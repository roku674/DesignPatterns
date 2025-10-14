using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace Microservices.DataManagement.DatabasePerService;

/// <summary>
/// Implementation of DatabasePerService pattern.
/// Each microservice has its own private database, ensuring loose coupling and independent scaling.
/// </summary>
public class DatabasePerServiceImplementation : IDatabasePerService
{
    public void Execute()
    {
        Console.WriteLine("DatabasePerService pattern executing...");
        Console.WriteLine("Each microservice owns its data and database schema independently.");
    }
}

// Database Connection - Represents a connection to a service-specific database
public class DatabaseConnection
{
    public string ServiceName { get; set; } = string.Empty;
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseType { get; set; } = string.Empty; // SQL, NoSQL, etc.
    public bool IsConnected { get; set; }
    public DateTime ConnectedAt { get; set; }

    public void Connect()
    {
        IsConnected = true;
        ConnectedAt = DateTime.UtcNow;
        Console.WriteLine($"[{ServiceName}] Connected to {DatabaseType} database");
    }

    public void Disconnect()
    {
        IsConnected = false;
        Console.WriteLine($"[{ServiceName}] Disconnected from database");
    }
}

// User Database - Private database for User Service
public class UserDatabase
{
    private readonly Dictionary<int, UserEntity> _users = new Dictionary<int, UserEntity>();
    private readonly DatabaseConnection _connection;
    private int _nextId = 1;

    public UserDatabase(DatabaseConnection connection)
    {
        _connection = connection;
        _connection.Connect();
        SeedData();
    }

    private void SeedData()
    {
        CreateUser("Alice Johnson", "alice@example.com");
        CreateUser("Bob Smith", "bob@example.com");
        CreateUser("Charlie Brown", "charlie@example.com");
    }

    public UserEntity? GetUser(int userId)
    {
        Console.WriteLine($"[UserDB] Query: SELECT * FROM Users WHERE Id = {userId}");
        return _users.ContainsKey(userId) ? _users[userId] : null;
    }

    public List<UserEntity> GetAllUsers()
    {
        Console.WriteLine($"[UserDB] Query: SELECT * FROM Users");
        return new List<UserEntity>(_users.Values);
    }

    public UserEntity CreateUser(string name, string email)
    {
        UserEntity user = new UserEntity
        {
            Id = _nextId++,
            Name = name,
            Email = email,
            CreatedAt = DateTime.UtcNow
        };

        _users[user.Id] = user;
        Console.WriteLine($"[UserDB] INSERT INTO Users: Id={user.Id}, Name={user.Name}");
        return user;
    }

    public bool UpdateUser(int userId, string? name, string? email)
    {
        if (!_users.ContainsKey(userId))
        {
            return false;
        }

        if (name != null) _users[userId].Name = name;
        if (email != null) _users[userId].Email = email;

        Console.WriteLine($"[UserDB] UPDATE Users SET Name='{name}', Email='{email}' WHERE Id={userId}");
        return true;
    }

    public bool DeleteUser(int userId)
    {
        bool deleted = _users.Remove(userId);
        if (deleted)
        {
            Console.WriteLine($"[UserDB] DELETE FROM Users WHERE Id={userId}");
        }
        return deleted;
    }

    public DatabaseStats GetStats()
    {
        return new DatabaseStats
        {
            ServiceName = "UserService",
            RecordCount = _users.Count,
            DatabaseType = _connection.DatabaseType
        };
    }
}

// Order Database - Private database for Order Service
public class OrderDatabase
{
    private readonly Dictionary<int, OrderEntity> _orders = new Dictionary<int, OrderEntity>();
    private readonly DatabaseConnection _connection;
    private int _nextId = 1001;

    public OrderDatabase(DatabaseConnection connection)
    {
        _connection = connection;
        _connection.Connect();
        SeedData();
    }

    private void SeedData()
    {
        CreateOrder(1, 250.00m, "Completed");
        CreateOrder(2, 450.00m, "Pending");
        CreateOrder(1, 175.00m, "Shipped");
    }

    public OrderEntity? GetOrder(int orderId)
    {
        Console.WriteLine($"[OrderDB] Query: SELECT * FROM Orders WHERE Id = {orderId}");
        return _orders.ContainsKey(orderId) ? _orders[orderId] : null;
    }

    public List<OrderEntity> GetOrdersByUser(int userId)
    {
        Console.WriteLine($"[OrderDB] Query: SELECT * FROM Orders WHERE UserId = {userId}");
        return _orders.Values.Where(o => o.UserId == userId).ToList();
    }

    public OrderEntity CreateOrder(int userId, decimal amount, string status)
    {
        OrderEntity order = new OrderEntity
        {
            Id = _nextId++,
            UserId = userId,
            Amount = amount,
            Status = status,
            CreatedAt = DateTime.UtcNow
        };

        _orders[order.Id] = order;
        Console.WriteLine($"[OrderDB] INSERT INTO Orders: Id={order.Id}, UserId={userId}, Amount=${amount}");
        return order;
    }

    public bool UpdateOrderStatus(int orderId, string status)
    {
        if (!_orders.ContainsKey(orderId))
        {
            return false;
        }

        _orders[orderId].Status = status;
        Console.WriteLine($"[OrderDB] UPDATE Orders SET Status='{status}' WHERE Id={orderId}");
        return true;
    }

    public DatabaseStats GetStats()
    {
        return new DatabaseStats
        {
            ServiceName = "OrderService",
            RecordCount = _orders.Count,
            DatabaseType = _connection.DatabaseType
        };
    }
}

// Payment Database - Private database for Payment Service
public class PaymentDatabase
{
    private readonly Dictionary<string, PaymentEntity> _payments = new Dictionary<string, PaymentEntity>();
    private readonly DatabaseConnection _connection;

    public PaymentDatabase(DatabaseConnection connection)
    {
        _connection = connection;
        _connection.Connect();
        SeedData();
    }

    private void SeedData()
    {
        CreatePayment(1001, 250.00m, "Completed");
        CreatePayment(1002, 450.00m, "Pending");
    }

    public PaymentEntity? GetPayment(string transactionId)
    {
        Console.WriteLine($"[PaymentDB] Query: SELECT * FROM Payments WHERE TransactionId = '{transactionId}'");
        return _payments.ContainsKey(transactionId) ? _payments[transactionId] : null;
    }

    public List<PaymentEntity> GetPaymentsByOrder(int orderId)
    {
        Console.WriteLine($"[PaymentDB] Query: SELECT * FROM Payments WHERE OrderId = {orderId}");
        return _payments.Values.Where(p => p.OrderId == orderId).ToList();
    }

    public PaymentEntity CreatePayment(int orderId, decimal amount, string status)
    {
        PaymentEntity payment = new PaymentEntity
        {
            TransactionId = $"TXN-{Guid.NewGuid().ToString().Substring(0, 8)}",
            OrderId = orderId,
            Amount = amount,
            Status = status,
            CreatedAt = DateTime.UtcNow
        };

        _payments[payment.TransactionId] = payment;
        Console.WriteLine($"[PaymentDB] INSERT INTO Payments: TxnId={payment.TransactionId}, OrderId={orderId}, Amount=${amount}");
        return payment;
    }

    public bool UpdatePaymentStatus(string transactionId, string status)
    {
        if (!_payments.ContainsKey(transactionId))
        {
            return false;
        }

        _payments[transactionId].Status = status;
        Console.WriteLine($"[PaymentDB] UPDATE Payments SET Status='{status}' WHERE TransactionId='{transactionId}'");
        return true;
    }

    public DatabaseStats GetStats()
    {
        return new DatabaseStats
        {
            ServiceName = "PaymentService",
            RecordCount = _payments.Count,
            DatabaseType = _connection.DatabaseType
        };
    }
}

// Entities
public class UserEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class OrderEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class PaymentEntity
{
    public string TransactionId { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class DatabaseStats
{
    public string ServiceName { get; set; } = string.Empty;
    public int RecordCount { get; set; }
    public string DatabaseType { get; set; } = string.Empty;
}

// Service Layer - Each service operates on its own database
public class UserServiceWithDB
{
    private readonly UserDatabase _database;

    public UserServiceWithDB(UserDatabase database)
    {
        _database = database;
    }

    public async Task<UserEntity?> GetUserAsync(int userId)
    {
        await Task.Delay(10); // Simulate async operation
        return _database.GetUser(userId);
    }

    public async Task<List<UserEntity>> GetAllUsersAsync()
    {
        await Task.Delay(10);
        return _database.GetAllUsers();
    }

    public async Task<UserEntity> CreateUserAsync(string name, string email)
    {
        await Task.Delay(10);
        return _database.CreateUser(name, email);
    }

    public async Task<bool> UpdateUserAsync(int userId, string? name, string? email)
    {
        await Task.Delay(10);
        return _database.UpdateUser(userId, name, email);
    }

    public DatabaseStats GetDatabaseStats()
    {
        return _database.GetStats();
    }
}

public class OrderServiceWithDB
{
    private readonly OrderDatabase _database;

    public OrderServiceWithDB(OrderDatabase database)
    {
        _database = database;
    }

    public async Task<OrderEntity?> GetOrderAsync(int orderId)
    {
        await Task.Delay(10);
        return _database.GetOrder(orderId);
    }

    public async Task<List<OrderEntity>> GetUserOrdersAsync(int userId)
    {
        await Task.Delay(10);
        return _database.GetOrdersByUser(userId);
    }

    public async Task<OrderEntity> CreateOrderAsync(int userId, decimal amount)
    {
        await Task.Delay(10);
        return _database.CreateOrder(userId, amount, "Pending");
    }

    public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
    {
        await Task.Delay(10);
        return _database.UpdateOrderStatus(orderId, status);
    }

    public DatabaseStats GetDatabaseStats()
    {
        return _database.GetStats();
    }
}

public class PaymentServiceWithDB
{
    private readonly PaymentDatabase _database;

    public PaymentServiceWithDB(PaymentDatabase database)
    {
        _database = database;
    }

    public async Task<PaymentEntity?> GetPaymentAsync(string transactionId)
    {
        await Task.Delay(10);
        return _database.GetPayment(transactionId);
    }

    public async Task<List<PaymentEntity>> GetOrderPaymentsAsync(int orderId)
    {
        await Task.Delay(10);
        return _database.GetPaymentsByOrder(orderId);
    }

    public async Task<PaymentEntity> ProcessPaymentAsync(int orderId, decimal amount)
    {
        await Task.Delay(50); // Payment processing takes longer
        return _database.CreatePayment(orderId, amount, "Completed");
    }

    public DatabaseStats GetDatabaseStats()
    {
        return _database.GetStats();
    }
}

// Cross-Service Query Coordinator - Demonstrates how to query across services
public class CrossServiceQueryCoordinator
{
    private readonly UserServiceWithDB _userService;
    private readonly OrderServiceWithDB _orderService;
    private readonly PaymentServiceWithDB _paymentService;

    public CrossServiceQueryCoordinator(
        UserServiceWithDB userService,
        OrderServiceWithDB orderService,
        PaymentServiceWithDB paymentService)
    {
        _userService = userService;
        _orderService = orderService;
        _paymentService = paymentService;
    }

    public async Task<UserOrderSummary> GetUserOrderSummaryAsync(int userId)
    {
        Console.WriteLine($"\n[Coordinator] Fetching comprehensive data for user {userId}");

        // Query each service's database independently
        UserEntity? user = await _userService.GetUserAsync(userId);
        List<OrderEntity> orders = await _orderService.GetUserOrdersAsync(userId);

        // Calculate total spent
        decimal totalSpent = 0;
        foreach (OrderEntity order in orders)
        {
            totalSpent += order.Amount;
        }

        UserOrderSummary summary = new UserOrderSummary
        {
            UserId = userId,
            UserName = user?.Name ?? "Unknown",
            UserEmail = user?.Email ?? "Unknown",
            TotalOrders = orders.Count,
            TotalSpent = totalSpent,
            Orders = orders
        };

        Console.WriteLine($"[Coordinator] Summary compiled from multiple databases");
        return summary;
    }
}

public class UserOrderSummary
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public List<OrderEntity> Orders { get; set; } = new List<OrderEntity>();
}
