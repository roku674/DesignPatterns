using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Enterprise.ObjectRelational.IdentityMap
{
    // Entity base class
    public abstract class Entity
    {
        public Guid Id { get; set; }
        public DateTime LoadedAt { get; set; }

        protected Entity()
        {
            Id = Guid.NewGuid();
            LoadedAt = DateTime.UtcNow;
        }

        protected Entity(Guid id)
        {
            Id = id;
            LoadedAt = DateTime.UtcNow;
        }
    }

    // Domain entities
    public class Product : Entity
    {
        public string Name { get; set; }
        public string Sku { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }

        public Product(string name, string sku, decimal price, int stockQuantity) : base()
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Sku = sku ?? throw new ArgumentNullException(nameof(sku));
            Price = price;
            StockQuantity = stockQuantity;
        }

        public Product(Guid id, string name, string sku, decimal price, int stockQuantity) : base(id)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Sku = sku ?? throw new ArgumentNullException(nameof(sku));
            Price = price;
            StockQuantity = stockQuantity;
        }

        public override string ToString()
        {
            return $"Product[{Id}]: {Name} (SKU: {Sku}) - ${Price} - Stock: {StockQuantity}";
        }
    }

    public class Customer : Entity
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public CustomerTier Tier { get; set; }

        public Customer(string name, string email, CustomerTier tier = CustomerTier.Standard) : base()
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Email = email ?? throw new ArgumentNullException(nameof(email));
            Tier = tier;
        }

        public Customer(Guid id, string name, string email, CustomerTier tier) : base(id)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Email = email ?? throw new ArgumentNullException(nameof(email));
            Tier = tier;
        }

        public override string ToString()
        {
            return $"Customer[{Id}]: {Name} ({Email}) - {Tier}";
        }
    }

    public enum CustomerTier
    {
        Standard,
        Premium,
        Enterprise
    }

    // Identity Map interface
    public interface IIdentityMap<T> where T : Entity
    {
        void Add(T entity);
        T Get(Guid id);
        bool Contains(Guid id);
        void Remove(Guid id);
        void Clear();
        int Count { get; }
        IEnumerable<T> GetAll();
    }

    // Basic Identity Map implementation
    public class IdentityMapImplementation<T> : IIdentityMap<T> where T : Entity
    {
        private readonly Dictionary<Guid, T> _map = new Dictionary<Guid, T>();
        private readonly object _lock = new object();

        public int Count
        {
            get
            {
                lock (_lock)
                {
                    return _map.Count;
                }
            }
        }

        public void Add(T entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            lock (_lock)
            {
                if (_map.ContainsKey(entity.Id))
                {
                    Console.WriteLine($"WARNING: Entity {typeof(T).Name}[{entity.Id}] already exists in Identity Map");
                    return;
                }

                _map[entity.Id] = entity;
                Console.WriteLine($"Added {typeof(T).Name}[{entity.Id}] to Identity Map");
            }
        }

        public T Get(Guid id)
        {
            lock (_lock)
            {
                if (_map.TryGetValue(id, out T entity))
                {
                    Console.WriteLine($"Retrieved {typeof(T).Name}[{id}] from Identity Map (cache hit)");
                    return entity;
                }

                Console.WriteLine($"Entity {typeof(T).Name}[{id}] not found in Identity Map (cache miss)");
                return null;
            }
        }

        public bool Contains(Guid id)
        {
            lock (_lock)
            {
                return _map.ContainsKey(id);
            }
        }

        public void Remove(Guid id)
        {
            lock (_lock)
            {
                if (_map.Remove(id))
                {
                    Console.WriteLine($"Removed {typeof(T).Name}[{id}] from Identity Map");
                }
            }
        }

        public void Clear()
        {
            lock (_lock)
            {
                int count = _map.Count;
                _map.Clear();
                Console.WriteLine($"Cleared Identity Map - removed {count} {typeof(T).Name} entities");
            }
        }

        public IEnumerable<T> GetAll()
        {
            lock (_lock)
            {
                return _map.Values.ToList();
            }
        }
    }

    // Advanced Identity Map with expiration
    public class ExpiringIdentityMap<T> : IIdentityMap<T> where T : Entity
    {
        private class CacheEntry
        {
            public T Entity { get; set; }
            public DateTime ExpirationTime { get; set; }
        }

        private readonly Dictionary<Guid, CacheEntry> _map = new Dictionary<Guid, CacheEntry>();
        private readonly TimeSpan _expirationDuration;
        private readonly object _lock = new object();

        public int Count
        {
            get
            {
                lock (_lock)
                {
                    CleanExpiredEntries();
                    return _map.Count;
                }
            }
        }

        public ExpiringIdentityMap(TimeSpan expirationDuration)
        {
            _expirationDuration = expirationDuration;
        }

        public void Add(T entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            lock (_lock)
            {
                CleanExpiredEntries();

                CacheEntry entry = new CacheEntry
                {
                    Entity = entity,
                    ExpirationTime = DateTime.UtcNow.Add(_expirationDuration)
                };

                _map[entity.Id] = entry;
                Console.WriteLine($"Added {typeof(T).Name}[{entity.Id}] to Expiring Identity Map (expires in {_expirationDuration.TotalSeconds}s)");
            }
        }

        public T Get(Guid id)
        {
            lock (_lock)
            {
                CleanExpiredEntries();

                if (_map.TryGetValue(id, out CacheEntry entry))
                {
                    if (entry.ExpirationTime > DateTime.UtcNow)
                    {
                        Console.WriteLine($"Retrieved {typeof(T).Name}[{id}] from Expiring Identity Map");
                        return entry.Entity;
                    }
                    else
                    {
                        _map.Remove(id);
                        Console.WriteLine($"Entity {typeof(T).Name}[{id}] expired from cache");
                    }
                }

                return null;
            }
        }

        public bool Contains(Guid id)
        {
            lock (_lock)
            {
                CleanExpiredEntries();
                return _map.ContainsKey(id);
            }
        }

        public void Remove(Guid id)
        {
            lock (_lock)
            {
                if (_map.Remove(id))
                {
                    Console.WriteLine($"Removed {typeof(T).Name}[{id}] from Expiring Identity Map");
                }
            }
        }

        public void Clear()
        {
            lock (_lock)
            {
                int count = _map.Count;
                _map.Clear();
                Console.WriteLine($"Cleared Expiring Identity Map - removed {count} entries");
            }
        }

        public IEnumerable<T> GetAll()
        {
            lock (_lock)
            {
                CleanExpiredEntries();
                return _map.Values.Select(e => e.Entity).ToList();
            }
        }

        private void CleanExpiredEntries()
        {
            DateTime now = DateTime.UtcNow;
            List<Guid> expiredKeys = _map
                .Where(kvp => kvp.Value.ExpirationTime <= now)
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (Guid key in expiredKeys)
            {
                _map.Remove(key);
            }

            if (expiredKeys.Count > 0)
            {
                Console.WriteLine($"Cleaned {expiredKeys.Count} expired entries from cache");
            }
        }
    }

    // Repository with Identity Map integration
    public class DataStore
    {
        private readonly Dictionary<Guid, Product> _products = new Dictionary<Guid, Product>();
        private readonly Dictionary<Guid, Customer> _customers = new Dictionary<Guid, Customer>();

        public void SeedData()
        {
            // Add some products
            AddProduct(new Product(Guid.Parse("00000000-0000-0000-0000-000000000001"), "Laptop", "LAP-001", 1299.99m, 50));
            AddProduct(new Product(Guid.Parse("00000000-0000-0000-0000-000000000002"), "Mouse", "MOU-001", 29.99m, 200));
            AddProduct(new Product(Guid.Parse("00000000-0000-0000-0000-000000000003"), "Keyboard", "KEY-001", 79.99m, 150));

            // Add some customers
            AddCustomer(new Customer(Guid.Parse("00000000-0000-0000-0000-000000000011"), "John Doe", "john@example.com", CustomerTier.Premium));
            AddCustomer(new Customer(Guid.Parse("00000000-0000-0000-0000-000000000012"), "Jane Smith", "jane@example.com", CustomerTier.Enterprise));
        }

        public void AddProduct(Product product)
        {
            _products[product.Id] = product;
        }

        public void AddCustomer(Customer customer)
        {
            _customers[customer.Id] = customer;
        }

        public Product LoadProduct(Guid id)
        {
            // Simulate database delay
            System.Threading.Thread.Sleep(100);

            if (_products.TryGetValue(id, out Product product))
            {
                Console.WriteLine($"[DATABASE] Loaded product from DB: {product.Name}");
                return new Product(product.Id, product.Name, product.Sku, product.Price, product.StockQuantity);
            }

            return null;
        }

        public Customer LoadCustomer(Guid id)
        {
            // Simulate database delay
            System.Threading.Thread.Sleep(100);

            if (_customers.TryGetValue(id, out Customer customer))
            {
                Console.WriteLine($"[DATABASE] Loaded customer from DB: {customer.Name}");
                return new Customer(customer.Id, customer.Name, customer.Email, customer.Tier);
            }

            return null;
        }
    }

    // Repository with Identity Map
    public class ProductRepository
    {
        private readonly IIdentityMap<Product> _identityMap;
        private readonly DataStore _dataStore;

        public ProductRepository(IIdentityMap<Product> identityMap, DataStore dataStore)
        {
            _identityMap = identityMap ?? throw new ArgumentNullException(nameof(identityMap));
            _dataStore = dataStore ?? throw new ArgumentNullException(nameof(dataStore));
        }

        public Product FindById(Guid id)
        {
            // Check identity map first
            Product product = _identityMap.Get(id);
            if (product != null)
            {
                return product;
            }

            // Load from database
            product = _dataStore.LoadProduct(id);
            if (product != null)
            {
                _identityMap.Add(product);
            }

            return product;
        }

        public void ClearCache()
        {
            _identityMap.Clear();
        }
    }

    public class CustomerRepository
    {
        private readonly IIdentityMap<Customer> _identityMap;
        private readonly DataStore _dataStore;

        public CustomerRepository(IIdentityMap<Customer> identityMap, DataStore dataStore)
        {
            _identityMap = identityMap ?? throw new ArgumentNullException(nameof(identityMap));
            _dataStore = dataStore ?? throw new ArgumentNullException(nameof(dataStore));
        }

        public Customer FindById(Guid id)
        {
            // Check identity map first
            Customer customer = _identityMap.Get(id);
            if (customer != null)
            {
                return customer;
            }

            // Load from database
            customer = _dataStore.LoadCustomer(id);
            if (customer != null)
            {
                _identityMap.Add(customer);
            }

            return customer;
        }

        public void ClearCache()
        {
            _identityMap.Clear();
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Identity Map Pattern - Ensuring Object Identity ===\n");

            try
            {
                // Scenario 1: Basic Identity Map usage
                Console.WriteLine("--- Scenario 1: Basic Identity Map ---");
                Scenario1_BasicIdentityMap();

                // Scenario 2: Multiple requests for same entity
                Console.WriteLine("\n--- Scenario 2: Multiple Requests (Performance Benefits) ---");
                Scenario2_PerformanceComparison();

                // Scenario 3: Object identity guarantee
                Console.WriteLine("\n--- Scenario 3: Object Identity Guarantee ---");
                Scenario3_ObjectIdentity();

                // Scenario 4: Expiring Identity Map
                Console.WriteLine("\n--- Scenario 4: Expiring Identity Map ---");
                await Scenario4_ExpiringCache();

                // Scenario 5: Concurrent access
                Console.WriteLine("\n--- Scenario 5: Thread-Safe Concurrent Access ---");
                await Scenario5_ConcurrentAccess();

                Console.WriteLine("\n=== All Scenarios Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }

        private static void Scenario1_BasicIdentityMap()
        {
            DataStore dataStore = new DataStore();
            dataStore.SeedData();

            IIdentityMap<Product> identityMap = new IdentityMapImplementation<Product>();
            ProductRepository repository = new ProductRepository(identityMap, dataStore);

            Guid laptopId = Guid.Parse("00000000-0000-0000-0000-000000000001");

            Console.WriteLine("First request:");
            Product laptop1 = repository.FindById(laptopId);
            Console.WriteLine($"Result: {laptop1}\n");

            Console.WriteLine("Second request (should hit cache):");
            Product laptop2 = repository.FindById(laptopId);
            Console.WriteLine($"Result: {laptop2}\n");

            Console.WriteLine($"Identity Map contains {identityMap.Count} products");
        }

        private static void Scenario2_PerformanceComparison()
        {
            DataStore dataStore = new DataStore();
            dataStore.SeedData();

            IIdentityMap<Product> identityMap = new IdentityMapImplementation<Product>();
            ProductRepository repository = new ProductRepository(identityMap, dataStore);

            Guid laptopId = Guid.Parse("00000000-0000-0000-0000-000000000001");

            // Without cache (first load)
            Console.WriteLine("WITHOUT Identity Map (first load):");
            System.Diagnostics.Stopwatch sw = System.Diagnostics.Stopwatch.StartNew();
            Product product1 = repository.FindById(laptopId);
            sw.Stop();
            Console.WriteLine($"Time: {sw.ElapsedMilliseconds}ms\n");

            // With cache (subsequent loads)
            Console.WriteLine("WITH Identity Map (cached):");
            for (int i = 0; i < 5; i++)
            {
                sw.Restart();
                Product product = repository.FindById(laptopId);
                sw.Stop();
                Console.WriteLine($"Request {i + 1} - Time: {sw.ElapsedMilliseconds}ms");
            }
        }

        private static void Scenario3_ObjectIdentity()
        {
            DataStore dataStore = new DataStore();
            dataStore.SeedData();

            IIdentityMap<Customer> identityMap = new IdentityMapImplementation<Customer>();
            CustomerRepository repository = new CustomerRepository(identityMap, dataStore);

            Guid customerId = Guid.Parse("00000000-0000-0000-0000-000000000011");

            Customer customer1 = repository.FindById(customerId);
            Customer customer2 = repository.FindById(customerId);

            Console.WriteLine($"Customer 1: {customer1}");
            Console.WriteLine($"Customer 2: {customer2}");
            Console.WriteLine($"Same object reference: {ReferenceEquals(customer1, customer2)}");
            Console.WriteLine($"Same ID: {customer1.Id == customer2.Id}");
            Console.WriteLine("\nThis ensures consistent object identity across the application!");
        }

        private static async Task Scenario4_ExpiringCache()
        {
            DataStore dataStore = new DataStore();
            dataStore.SeedData();

            IIdentityMap<Product> expiringMap = new ExpiringIdentityMap<Product>(TimeSpan.FromSeconds(2));
            ProductRepository repository = new ProductRepository(expiringMap, dataStore);

            Guid mouseId = Guid.Parse("00000000-0000-0000-0000-000000000002");

            Console.WriteLine("Loading product:");
            Product mouse1 = repository.FindById(mouseId);
            Console.WriteLine($"Result: {mouse1}\n");

            Console.WriteLine("Immediate second request (should hit cache):");
            Product mouse2 = repository.FindById(mouseId);

            Console.WriteLine("\nWaiting 3 seconds for cache expiration...");
            await Task.Delay(3000);

            Console.WriteLine("\nRequest after expiration (should load from DB):");
            Product mouse3 = repository.FindById(mouseId);
        }

        private static async Task Scenario5_ConcurrentAccess()
        {
            DataStore dataStore = new DataStore();
            dataStore.SeedData();

            IIdentityMap<Product> identityMap = new IdentityMapImplementation<Product>();
            ProductRepository repository = new ProductRepository(identityMap, dataStore);

            Guid[] productIds = new[]
            {
                Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Guid.Parse("00000000-0000-0000-0000-000000000002"),
                Guid.Parse("00000000-0000-0000-0000-000000000003")
            };

            Console.WriteLine("Simulating concurrent access from multiple threads:");

            List<Task> tasks = new List<Task>();

            for (int i = 0; i < 10; i++)
            {
                int threadId = i;
                Task task = Task.Run(() =>
                {
                    Guid productId = productIds[threadId % productIds.Length];
                    Product product = repository.FindById(productId);
                    Console.WriteLine($"Thread {threadId}: Retrieved {product.Name}");
                });
                tasks.Add(task);
            }

            await Task.WhenAll(tasks);

            Console.WriteLine($"\nFinal Identity Map count: {identityMap.Count} (should be 3)");
            Console.WriteLine("All products are loaded exactly once, even with concurrent access!");
        }
    }
}
