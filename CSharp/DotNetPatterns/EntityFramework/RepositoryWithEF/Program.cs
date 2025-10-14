using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace DesignPatterns.DotNet.EntityFramework.RepositoryWithEF
{
    /// <summary>
    /// Repository Pattern with Entity Framework Core
    ///
    /// This pattern demonstrates how to implement the Repository pattern with EF Core,
    /// providing an abstraction layer over data access operations and allowing for
    /// easier testing and maintenance.
    /// </summary>

    // Domain entities
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Category { get; set; }
        public int Stock { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class Order
    {
        public int Id { get; set; }
        public string CustomerName { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public List<OrderItem> Items { get; set; }
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order Order { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled
    }

    // DbContext
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            if (modelBuilder == null) throw new ArgumentNullException(nameof(modelBuilder));

            // Product configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Category).HasMaxLength(100);
                entity.Property(e => e.Price).HasPrecision(18, 2);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.IsActive);
            });

            // Order configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
                entity.HasMany(e => e.Items)
                    .WithOne(e => e.Order)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // OrderItem configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.HasOne(e => e.Product)
                    .WithMany()
                    .HasForeignKey(e => e.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            base.OnModelCreating(modelBuilder);
        }
    }

    // Generic repository interface
    public interface IRepository<T> where T : class
    {
        Task<T> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<T> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
        Task AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        void Update(T entity);
        void UpdateRange(IEnumerable<T> entities);
        void Remove(T entity);
        void RemoveRange(IEnumerable<T> entities);
        Task<int> CountAsync(Expression<Func<T, bool>> predicate = null);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
    }

    // Generic repository implementation
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly ApplicationDbContext Context;
        protected readonly DbSet<T> DbSet;

        public Repository(ApplicationDbContext context)
        {
            Context = context ?? throw new ArgumentNullException(nameof(context));
            DbSet = context.Set<T>();
        }

        public virtual async Task<T> GetByIdAsync(int id)
        {
            return await DbSet.FindAsync(id);
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await DbSet.ToListAsync();
        }

        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            if (predicate == null) throw new ArgumentNullException(nameof(predicate));
            return await DbSet.Where(predicate).ToListAsync();
        }

        public virtual async Task<T> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
        {
            if (predicate == null) throw new ArgumentNullException(nameof(predicate));
            return await DbSet.FirstOrDefaultAsync(predicate);
        }

        public virtual async Task AddAsync(T entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            await DbSet.AddAsync(entity);
        }

        public virtual async Task AddRangeAsync(IEnumerable<T> entities)
        {
            if (entities == null) throw new ArgumentNullException(nameof(entities));
            await DbSet.AddRangeAsync(entities);
        }

        public virtual void Update(T entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            DbSet.Update(entity);
        }

        public virtual void UpdateRange(IEnumerable<T> entities)
        {
            if (entities == null) throw new ArgumentNullException(nameof(entities));
            DbSet.UpdateRange(entities);
        }

        public virtual void Remove(T entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            DbSet.Remove(entity);
        }

        public virtual void RemoveRange(IEnumerable<T> entities)
        {
            if (entities == null) throw new ArgumentNullException(nameof(entities));
            DbSet.RemoveRange(entities);
        }

        public virtual async Task<int> CountAsync(Expression<Func<T, bool>> predicate = null)
        {
            if (predicate == null)
            {
                return await DbSet.CountAsync();
            }
            return await DbSet.CountAsync(predicate);
        }

        public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
        {
            if (predicate == null) throw new ArgumentNullException(nameof(predicate));
            return await DbSet.AnyAsync(predicate);
        }
    }

    // Specialized product repository interface
    public interface IProductRepository : IRepository<Product>
    {
        Task<IEnumerable<Product>> GetActiveProductsAsync();
        Task<IEnumerable<Product>> GetProductsByCategoryAsync(string category);
        Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold);
        Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm);
        Task<Product> GetProductWithOrdersAsync(int productId);
    }

    // Specialized product repository implementation
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Product>> GetActiveProductsAsync()
        {
            return await DbSet
                .Where(p => p.IsActive)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
                throw new ArgumentException("Category cannot be null or empty", nameof(category));

            return await DbSet
                .Where(p => p.Category == category && p.IsActive)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold)
        {
            return await DbSet
                .Where(p => p.Stock <= threshold && p.IsActive)
                .OrderBy(p => p.Stock)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllAsync();

            string lowerSearchTerm = searchTerm.ToLower();

            return await DbSet
                .Where(p => p.Name.ToLower().Contains(lowerSearchTerm) ||
                           p.Category.ToLower().Contains(lowerSearchTerm))
                .Where(p => p.IsActive)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<Product> GetProductWithOrdersAsync(int productId)
        {
            return await DbSet
                .Include(p => p.Id) // In real app, would include navigation properties
                .FirstOrDefaultAsync(p => p.Id == productId);
        }
    }

    // Specialized order repository interface
    public interface IOrderRepository : IRepository<Order>
    {
        Task<IEnumerable<Order>> GetOrdersWithItemsAsync();
        Task<Order> GetOrderWithItemsAsync(int orderId);
        Task<IEnumerable<Order>> GetOrdersByStatusAsync(OrderStatus status);
        Task<IEnumerable<Order>> GetOrdersByCustomerAsync(string customerName);
        Task<IEnumerable<Order>> GetRecentOrdersAsync(int days);
        Task<decimal> GetTotalRevenueAsync(DateTime startDate, DateTime endDate);
    }

    // Specialized order repository implementation
    public class OrderRepository : Repository<Order>, IOrderRepository
    {
        public OrderRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Order>> GetOrdersWithItemsAsync()
        {
            return await DbSet
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order> GetOrderWithItemsAsync(int orderId)
        {
            return await DbSet
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<IEnumerable<Order>> GetOrdersByStatusAsync(OrderStatus status)
        {
            return await DbSet
                .Where(o => o.Status == status)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetOrdersByCustomerAsync(string customerName)
        {
            if (string.IsNullOrWhiteSpace(customerName))
                throw new ArgumentException("Customer name cannot be null or empty", nameof(customerName));

            return await DbSet
                .Where(o => o.CustomerName == customerName)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetRecentOrdersAsync(int days)
        {
            DateTime cutoffDate = DateTime.UtcNow.AddDays(-days);

            return await DbSet
                .Where(o => o.OrderDate >= cutoffDate)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalRevenueAsync(DateTime startDate, DateTime endDate)
        {
            return await DbSet
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                .Where(o => o.Status != OrderStatus.Cancelled)
                .SumAsync(o => o.TotalAmount);
        }
    }

    // Unit of Work interface
    public interface IUnitOfWork : IDisposable
    {
        IProductRepository Products { get; }
        IOrderRepository Orders { get; }
        IRepository<OrderItem> OrderItems { get; }
        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }

    // Unit of Work implementation
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IProductRepository _productRepository;
        private IOrderRepository _orderRepository;
        private IRepository<OrderItem> _orderItemRepository;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public IProductRepository Products =>
            _productRepository ??= new ProductRepository(_context);

        public IOrderRepository Orders =>
            _orderRepository ??= new OrderRepository(_context);

        public IRepository<OrderItem> OrderItems =>
            _orderItemRepository ??= new Repository<OrderItem>(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            await _context.Database.CommitTransactionAsync();
        }

        public async Task RollbackTransactionAsync()
        {
            await _context.Database.RollbackTransactionAsync();
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }

    // Service layer using repositories
    public class ProductService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ProductService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<Product> CreateProductAsync(string name, decimal price, string category, int stock)
        {
            Product product = new Product
            {
                Name = name,
                Price = price,
                Category = category,
                Stock = stock,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _unitOfWork.Products.AddAsync(product);
            await _unitOfWork.SaveChangesAsync();

            return product;
        }

        public async Task<bool> UpdateProductStockAsync(int productId, int newStock)
        {
            Product product = await _unitOfWork.Products.GetByIdAsync(productId);
            if (product == null) return false;

            product.Stock = newStock;
            product.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Products.Update(product);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold = 10)
        {
            return await _unitOfWork.Products.GetLowStockProductsAsync(threshold);
        }
    }

    // Demonstration
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Repository Pattern with EF Core Demo ===\n");

            DbContextOptions<ApplicationDbContext> options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase("RepositoryDemo")
                .Options;

            using (ApplicationDbContext context = new ApplicationDbContext(options))
            {
                // Demo 1: Basic repository operations
                Console.WriteLine("Demo 1: Basic Repository Operations");
                await DemoBasicOperations(context);

                // Demo 2: Specialized repository methods
                Console.WriteLine("\nDemo 2: Specialized Repository Methods");
                await DemoSpecializedMethods(context);

                // Demo 3: Unit of Work pattern
                Console.WriteLine("\nDemo 3: Unit of Work Pattern");
                await DemoUnitOfWork(context);

                // Demo 4: Service layer with repositories
                Console.WriteLine("\nDemo 4: Service Layer Integration");
                await DemoServiceLayer(context);

                // Demo 5: Complex queries
                Console.WriteLine("\nDemo 5: Complex Queries");
                await DemoComplexQueries(context);
            }

            Console.WriteLine("\n=== Repository Pattern Benefits ===");
            Console.WriteLine("- Abstraction over data access");
            Console.WriteLine("- Easier unit testing");
            Console.WriteLine("- Centralized data access logic");
            Console.WriteLine("- Consistent API across entities");
            Console.WriteLine("- Separation of concerns");
        }

        private static async Task DemoBasicOperations(ApplicationDbContext context)
        {
            IRepository<Product> repository = new Repository<Product>(context);

            // Add products
            await repository.AddAsync(new Product
            {
                Name = "Laptop",
                Price = 999.99m,
                Category = "Electronics",
                Stock = 50,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            });

            await repository.AddAsync(new Product
            {
                Name = "Mouse",
                Price = 29.99m,
                Category = "Electronics",
                Stock = 100,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            });

            await context.SaveChangesAsync();

            // Get all products
            IEnumerable<Product> products = await repository.GetAllAsync();
            Console.WriteLine($"  Total products: {products.Count()}");

            // Find products
            IEnumerable<Product> electronics = await repository.FindAsync(p => p.Category == "Electronics");
            Console.WriteLine($"  Electronics products: {electronics.Count()}");

            // Count products
            int count = await repository.CountAsync(p => p.IsActive);
            Console.WriteLine($"  Active products: {count}");
        }

        private static async Task DemoSpecializedMethods(ApplicationDbContext context)
        {
            IProductRepository productRepository = new ProductRepository(context);

            // Get active products
            IEnumerable<Product> activeProducts = await productRepository.GetActiveProductsAsync();
            Console.WriteLine($"  Active products: {activeProducts.Count()}");

            // Get products by category
            IEnumerable<Product> electronics = await productRepository.GetProductsByCategoryAsync("Electronics");
            Console.WriteLine($"  Electronics: {electronics.Count()}");

            // Search products
            IEnumerable<Product> searchResults = await productRepository.SearchProductsAsync("Laptop");
            Console.WriteLine($"  Search results for 'Laptop': {searchResults.Count()}");

            // Get low stock products
            IEnumerable<Product> lowStock = await productRepository.GetLowStockProductsAsync(50);
            Console.WriteLine($"  Low stock products: {lowStock.Count()}");
        }

        private static async Task DemoUnitOfWork(ApplicationDbContext context)
        {
            using (IUnitOfWork unitOfWork = new UnitOfWork(context))
            {
                // Create product
                Product product = new Product
                {
                    Name = "Keyboard",
                    Price = 79.99m,
                    Category = "Electronics",
                    Stock = 75,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                await unitOfWork.Products.AddAsync(product);
                int result = await unitOfWork.SaveChangesAsync();

                Console.WriteLine($"  Created product, changes saved: {result}");

                // Get product count
                int productCount = await unitOfWork.Products.CountAsync();
                Console.WriteLine($"  Total products in database: {productCount}");
            }
        }

        private static async Task DemoServiceLayer(ApplicationDbContext context)
        {
            using (IUnitOfWork unitOfWork = new UnitOfWork(context))
            {
                ProductService service = new ProductService(unitOfWork);

                // Create product through service
                Product product = await service.CreateProductAsync(
                    "Monitor",
                    299.99m,
                    "Electronics",
                    30
                );

                Console.WriteLine($"  Created product: {product.Name} (ID: {product.Id})");

                // Update stock
                bool updated = await service.UpdateProductStockAsync(product.Id, 25);
                Console.WriteLine($"  Stock updated: {updated}");

                // Get low stock products
                IEnumerable<Product> lowStock = await service.GetLowStockProductsAsync(30);
                Console.WriteLine($"  Low stock products: {lowStock.Count()}");
            }
        }

        private static async Task DemoComplexQueries(ApplicationDbContext context)
        {
            IProductRepository productRepository = new ProductRepository(context);

            // Complex query with multiple conditions
            IEnumerable<Product> products = await productRepository.FindAsync(p =>
                p.IsActive &&
                p.Stock > 0 &&
                p.Price < 100);

            Console.WriteLine($"  Active products under $100 with stock: {products.Count()}");

            // Check existence
            bool hasElectronics = await productRepository.AnyAsync(p => p.Category == "Electronics");
            Console.WriteLine($"  Has electronics: {hasElectronics}");

            // Get first matching
            Product cheapest = await productRepository.FirstOrDefaultAsync(p => p.IsActive);
            if (cheapest != null)
            {
                Console.WriteLine($"  First active product: {cheapest.Name}");
            }
        }
    }
}
