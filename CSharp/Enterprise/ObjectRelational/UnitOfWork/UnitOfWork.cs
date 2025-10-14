using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Enterprise.ObjectRelational.UnitOfWork
{
    // Entity base class
    public abstract class Entity
    {
        public Guid Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }

        protected Entity()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
        }
    }

    // Domain entities
    public class Customer : Entity
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public List<Order> Orders { get; set; } = new List<Order>();

        public Customer(string name, string email)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Email = email ?? throw new ArgumentNullException(nameof(email));
        }
    }

    public class Order : Entity
    {
        public Guid CustomerId { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();

        public Order(Guid customerId, OrderStatus status = OrderStatus.Pending)
        {
            CustomerId = customerId;
            Status = status;
        }
    }

    public class OrderItem : Entity
    {
        public Guid OrderId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }

        public OrderItem(Guid orderId, string productName, int quantity, decimal price)
        {
            OrderId = orderId;
            ProductName = productName ?? throw new ArgumentNullException(nameof(productName));
            Quantity = quantity;
            Price = price;
        }
    }

    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled
    }

    // Repository interface
    public interface IRepository<T> where T : Entity
    {
        void Add(T entity);
        void Update(T entity);
        void Remove(T entity);
        T GetById(Guid id);
        IEnumerable<T> GetAll();
    }

    // In-memory repository implementation
    public class InMemoryRepository<T> : IRepository<T> where T : Entity
    {
        private readonly Dictionary<Guid, T> _storage = new Dictionary<Guid, T>();

        public void Add(T entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            if (_storage.ContainsKey(entity.Id))
            {
                throw new InvalidOperationException($"Entity with ID {entity.Id} already exists");
            }

            _storage[entity.Id] = entity;
        }

        public void Update(T entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            if (!_storage.ContainsKey(entity.Id))
            {
                throw new InvalidOperationException($"Entity with ID {entity.Id} does not exist");
            }

            entity.ModifiedAt = DateTime.UtcNow;
            _storage[entity.Id] = entity;
        }

        public void Remove(T entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            if (!_storage.Remove(entity.Id))
            {
                throw new InvalidOperationException($"Entity with ID {entity.Id} does not exist");
            }
        }

        public T GetById(Guid id)
        {
            _storage.TryGetValue(id, out T entity);
            return entity;
        }

        public IEnumerable<T> GetAll()
        {
            return _storage.Values.ToList();
        }
    }

    // Unit of Work interface
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Customer> Customers { get; }
        IRepository<Order> Orders { get; }
        IRepository<OrderItem> OrderItems { get; }

        void RegisterNew<T>(T entity) where T : Entity;
        void RegisterDirty<T>(T entity) where T : Entity;
        void RegisterDeleted<T>(T entity) where T : Entity;

        void Commit();
        Task CommitAsync();
        void Rollback();
    }

    // Unit of Work implementation
    public class UnitOfWorkImplementation : IUnitOfWork
    {
        private readonly IRepository<Customer> _customerRepository;
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<OrderItem> _orderItemRepository;

        private readonly List<Entity> _newEntities = new List<Entity>();
        private readonly List<Entity> _dirtyEntities = new List<Entity>();
        private readonly List<Entity> _deletedEntities = new List<Entity>();

        private bool _isCommitted = false;
        private bool _isDisposed = false;

        public IRepository<Customer> Customers => _customerRepository;
        public IRepository<Order> Orders => _orderRepository;
        public IRepository<OrderItem> OrderItems => _orderItemRepository;

        public UnitOfWorkImplementation(
            IRepository<Customer> customerRepository,
            IRepository<Order> orderRepository,
            IRepository<OrderItem> orderItemRepository)
        {
            _customerRepository = customerRepository ?? throw new ArgumentNullException(nameof(customerRepository));
            _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
            _orderItemRepository = orderItemRepository ?? throw new ArgumentNullException(nameof(orderItemRepository));
        }

        public void RegisterNew<T>(T entity) where T : Entity
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            if (_isCommitted)
            {
                throw new InvalidOperationException("Cannot register entities after commit");
            }

            if (!_newEntities.Contains(entity))
            {
                _newEntities.Add(entity);
                Console.WriteLine($"Registered NEW entity: {typeof(T).Name} [{entity.Id}]");
            }
        }

        public void RegisterDirty<T>(T entity) where T : Entity
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            if (_isCommitted)
            {
                throw new InvalidOperationException("Cannot register entities after commit");
            }

            if (!_dirtyEntities.Contains(entity) && !_newEntities.Contains(entity))
            {
                _dirtyEntities.Add(entity);
                Console.WriteLine($"Registered DIRTY entity: {typeof(T).Name} [{entity.Id}]");
            }
        }

        public void RegisterDeleted<T>(T entity) where T : Entity
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            if (_isCommitted)
            {
                throw new InvalidOperationException("Cannot register entities after commit");
            }

            if (_newEntities.Contains(entity))
            {
                _newEntities.Remove(entity);
            }
            else if (!_deletedEntities.Contains(entity))
            {
                _deletedEntities.Add(entity);
                Console.WriteLine($"Registered DELETED entity: {typeof(T).Name} [{entity.Id}]");
            }

            _dirtyEntities.Remove(entity);
        }

        public void Commit()
        {
            if (_isCommitted)
            {
                throw new InvalidOperationException("Unit of Work has already been committed");
            }

            Console.WriteLine("\n=== Starting Transaction Commit ===");
            Console.WriteLine($"New entities: {_newEntities.Count}");
            Console.WriteLine($"Modified entities: {_dirtyEntities.Count}");
            Console.WriteLine($"Deleted entities: {_deletedEntities.Count}");

            try
            {
                // Insert new entities
                foreach (Entity entity in _newEntities)
                {
                    InsertEntity(entity);
                }

                // Update modified entities
                foreach (Entity entity in _dirtyEntities)
                {
                    UpdateEntity(entity);
                }

                // Delete removed entities
                foreach (Entity entity in _deletedEntities)
                {
                    DeleteEntity(entity);
                }

                _isCommitted = true;
                Console.WriteLine("=== Transaction Committed Successfully ===\n");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== Transaction Failed: {ex.Message} ===\n");
                Rollback();
                throw;
            }
        }

        public async Task CommitAsync()
        {
            await Task.Run(() => Commit());
        }

        public void Rollback()
        {
            Console.WriteLine("=== Rolling Back Transaction ===");
            _newEntities.Clear();
            _dirtyEntities.Clear();
            _deletedEntities.Clear();
            Console.WriteLine("=== Transaction Rolled Back ===\n");
        }

        private void InsertEntity(Entity entity)
        {
            if (entity is Customer customer)
            {
                _customerRepository.Add(customer);
                Console.WriteLine($"  Inserted Customer: {customer.Name}");
            }
            else if (entity is Order order)
            {
                _orderRepository.Add(order);
                Console.WriteLine($"  Inserted Order: [{order.Id}] - ${order.TotalAmount}");
            }
            else if (entity is OrderItem orderItem)
            {
                _orderItemRepository.Add(orderItem);
                Console.WriteLine($"  Inserted OrderItem: {orderItem.ProductName} x{orderItem.Quantity}");
            }
        }

        private void UpdateEntity(Entity entity)
        {
            if (entity is Customer customer)
            {
                _customerRepository.Update(customer);
                Console.WriteLine($"  Updated Customer: {customer.Name}");
            }
            else if (entity is Order order)
            {
                _orderRepository.Update(order);
                Console.WriteLine($"  Updated Order: [{order.Id}] - Status: {order.Status}");
            }
            else if (entity is OrderItem orderItem)
            {
                _orderItemRepository.Update(orderItem);
                Console.WriteLine($"  Updated OrderItem: {orderItem.ProductName}");
            }
        }

        private void DeleteEntity(Entity entity)
        {
            if (entity is Customer customer)
            {
                _customerRepository.Remove(customer);
                Console.WriteLine($"  Deleted Customer: {customer.Name}");
            }
            else if (entity is Order order)
            {
                _orderRepository.Remove(order);
                Console.WriteLine($"  Deleted Order: [{order.Id}]");
            }
            else if (entity is OrderItem orderItem)
            {
                _orderItemRepository.Remove(orderItem);
                Console.WriteLine($"  Deleted OrderItem: {orderItem.ProductName}");
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (_isDisposed)
            {
                return;
            }

            if (disposing)
            {
                if (!_isCommitted && (_newEntities.Any() || _dirtyEntities.Any() || _deletedEntities.Any()))
                {
                    Console.WriteLine("WARNING: Disposing UnitOfWork without commit. Changes will be lost!");
                    Rollback();
                }
            }

            _isDisposed = true;
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Unit of Work Pattern - Enterprise Transaction Management ===\n");

            try
            {
                // Scenario 1: Simple transaction
                Console.WriteLine("--- Scenario 1: Creating Customer and Order ---");
                await Scenario1_SimpleTransaction();

                // Scenario 2: Complex multi-entity transaction
                Console.WriteLine("\n--- Scenario 2: Complex Multi-Entity Transaction ---");
                await Scenario2_ComplexTransaction();

                // Scenario 3: Transaction rollback
                Console.WriteLine("\n--- Scenario 3: Transaction Rollback ---");
                Scenario3_Rollback();

                // Scenario 4: Updating existing entities
                Console.WriteLine("\n--- Scenario 4: Updating Existing Entities ---");
                Scenario4_Updates();

                // Scenario 5: Deleting entities
                Console.WriteLine("\n--- Scenario 5: Deleting Entities ---");
                Scenario5_Deletions();

                // Scenario 6: Disposing without commit
                Console.WriteLine("\n--- Scenario 6: Disposing Without Commit (Error Case) ---");
                Scenario6_DisposeWithoutCommit();

                Console.WriteLine("\n=== All Scenarios Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }

        private static async Task Scenario1_SimpleTransaction()
        {
            IRepository<Customer> customerRepo = new InMemoryRepository<Customer>();
            IRepository<Order> orderRepo = new InMemoryRepository<Order>();
            IRepository<OrderItem> orderItemRepo = new InMemoryRepository<OrderItem>();

            using (IUnitOfWork uow = new UnitOfWorkImplementation(customerRepo, orderRepo, orderItemRepo))
            {
                Customer customer = new Customer("John Doe", "john@example.com");
                uow.RegisterNew(customer);

                Order order = new Order(customer.Id, OrderStatus.Pending) { TotalAmount = 299.99m };
                uow.RegisterNew(order);

                await uow.CommitAsync();

                Console.WriteLine($"Total customers: {customerRepo.GetAll().Count()}");
                Console.WriteLine($"Total orders: {orderRepo.GetAll().Count()}");
            }
        }

        private static async Task Scenario2_ComplexTransaction()
        {
            IRepository<Customer> customerRepo = new InMemoryRepository<Customer>();
            IRepository<Order> orderRepo = new InMemoryRepository<Order>();
            IRepository<OrderItem> orderItemRepo = new InMemoryRepository<OrderItem>();

            using (IUnitOfWork uow = new UnitOfWorkImplementation(customerRepo, orderRepo, orderItemRepo))
            {
                Customer customer = new Customer("Alice Smith", "alice@example.com");
                uow.RegisterNew(customer);

                Order order = new Order(customer.Id, OrderStatus.Processing);
                uow.RegisterNew(order);

                OrderItem item1 = new OrderItem(order.Id, "Laptop", 1, 1299.99m);
                OrderItem item2 = new OrderItem(order.Id, "Mouse", 2, 29.99m);
                OrderItem item3 = new OrderItem(order.Id, "Keyboard", 1, 79.99m);

                uow.RegisterNew(item1);
                uow.RegisterNew(item2);
                uow.RegisterNew(item3);

                order.TotalAmount = item1.Price + (item2.Price * item2.Quantity) + item3.Price;

                await uow.CommitAsync();

                Console.WriteLine($"Order total: ${order.TotalAmount}");
                Console.WriteLine($"Total order items: {orderItemRepo.GetAll().Count()}");
            }
        }

        private static void Scenario3_Rollback()
        {
            IRepository<Customer> customerRepo = new InMemoryRepository<Customer>();
            IRepository<Order> orderRepo = new InMemoryRepository<Order>();
            IRepository<OrderItem> orderItemRepo = new InMemoryRepository<OrderItem>();

            using (IUnitOfWork uow = new UnitOfWorkImplementation(customerRepo, orderRepo, orderItemRepo))
            {
                Customer customer = new Customer("Bob Johnson", "bob@example.com");
                uow.RegisterNew(customer);

                Order order = new Order(customer.Id) { TotalAmount = 499.99m };
                uow.RegisterNew(order);

                Console.WriteLine("Simulating error condition...");
                uow.Rollback();

                Console.WriteLine($"Customers after rollback: {customerRepo.GetAll().Count()}");
                Console.WriteLine($"Orders after rollback: {orderRepo.GetAll().Count()}");
            }
        }

        private static void Scenario4_Updates()
        {
            IRepository<Customer> customerRepo = new InMemoryRepository<Customer>();
            IRepository<Order> orderRepo = new InMemoryRepository<Order>();
            IRepository<OrderItem> orderItemRepo = new InMemoryRepository<OrderItem>();

            // First create entities
            Customer customer = new Customer("Charlie Brown", "charlie@example.com");
            customerRepo.Add(customer);

            Order order = new Order(customer.Id, OrderStatus.Pending) { TotalAmount = 150.00m };
            orderRepo.Add(order);

            // Now update them using Unit of Work
            using (IUnitOfWork uow = new UnitOfWorkImplementation(customerRepo, orderRepo, orderItemRepo))
            {
                customer.Email = "charlie.brown@newdomain.com";
                uow.RegisterDirty(customer);

                order.Status = OrderStatus.Shipped;
                order.TotalAmount = 175.00m;
                uow.RegisterDirty(order);

                uow.Commit();

                Console.WriteLine($"Updated customer email: {customer.Email}");
                Console.WriteLine($"Updated order status: {order.Status}");
                Console.WriteLine($"Updated order total: ${order.TotalAmount}");
            }
        }

        private static void Scenario5_Deletions()
        {
            IRepository<Customer> customerRepo = new InMemoryRepository<Customer>();
            IRepository<Order> orderRepo = new InMemoryRepository<Order>();
            IRepository<OrderItem> orderItemRepo = new InMemoryRepository<OrderItem>();

            // Create entities first
            Customer customer = new Customer("David Wilson", "david@example.com");
            customerRepo.Add(customer);

            Order order = new Order(customer.Id) { TotalAmount = 99.99m };
            orderRepo.Add(order);

            Console.WriteLine($"Before deletion - Customers: {customerRepo.GetAll().Count()}, Orders: {orderRepo.GetAll().Count()}");

            // Delete using Unit of Work
            using (IUnitOfWork uow = new UnitOfWorkImplementation(customerRepo, orderRepo, orderItemRepo))
            {
                uow.RegisterDeleted(order);
                uow.RegisterDeleted(customer);

                uow.Commit();

                Console.WriteLine($"After deletion - Customers: {customerRepo.GetAll().Count()}, Orders: {orderRepo.GetAll().Count()}");
            }
        }

        private static void Scenario6_DisposeWithoutCommit()
        {
            IRepository<Customer> customerRepo = new InMemoryRepository<Customer>();
            IRepository<Order> orderRepo = new InMemoryRepository<Order>();
            IRepository<OrderItem> orderItemRepo = new InMemoryRepository<OrderItem>();

            using (IUnitOfWork uow = new UnitOfWorkImplementation(customerRepo, orderRepo, orderItemRepo))
            {
                Customer customer = new Customer("Eve Martinez", "eve@example.com");
                uow.RegisterNew(customer);

                // Dispose without commit - should trigger warning
            }

            Console.WriteLine($"Customers (should be 0): {customerRepo.GetAll().Count()}");
        }
    }
}
