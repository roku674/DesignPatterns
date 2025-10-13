using System;
using System.Collections.Generic;

namespace Enterprise.BasePatterns.SpecialCase;

/// <summary>
/// Normal customer implementation with standard behavior.
/// Represents a real customer with actual data and operations.
/// </summary>
public class RealCustomer : ICustomer
{
    private readonly string _name;
    private readonly string _email;
    private readonly decimal _discountPercentage;
    private readonly List<string> _orderHistory;

    public RealCustomer(string name, string email, decimal discountPercentage)
    {
        _name = name ?? throw new ArgumentNullException(nameof(name));
        _email = email ?? throw new ArgumentNullException(nameof(email));
        _discountPercentage = discountPercentage;
        _orderHistory = new List<string>();
    }

    public string Name => _name;
    public string Email => _email;
    public bool IsNull => false;

    public decimal GetDiscountPercentage()
    {
        return _discountPercentage;
    }

    public void SendEmail(string message)
    {
        Console.WriteLine($"Sending email to {_email}: {message}");
    }

    public List<string> GetOrderHistory()
    {
        return new List<string>(_orderHistory);
    }

    public void AddOrder(string orderId)
    {
        _orderHistory.Add(orderId);
    }
}

/// <summary>
/// SpecialCase implementation - represents a null/missing customer.
/// This is the Null Object pattern implementation that provides safe default behavior.
/// Eliminates the need for null checking throughout the codebase.
/// </summary>
public class NullCustomer : ICustomer
{
    private static readonly NullCustomer _instance = new NullCustomer();

    // Private constructor for singleton pattern
    private NullCustomer() { }

    public static NullCustomer Instance => _instance;

    public string Name => "Unknown Customer";
    public string Email => "no-email@unknown.com";
    public bool IsNull => true;

    public decimal GetDiscountPercentage()
    {
        return 0m; // No discount for unknown customers
    }

    public void SendEmail(string message)
    {
        // Do nothing - can't send email to unknown customer
        Console.WriteLine("Cannot send email to unknown customer");
    }

    public List<string> GetOrderHistory()
    {
        return new List<string>(); // Empty history for unknown customers
    }
}

/// <summary>
/// Customer repository that uses the SpecialCase pattern.
/// Returns NullCustomer instead of null when customer is not found.
/// </summary>
public class CustomerRepository
{
    private readonly Dictionary<int, ICustomer> _customers;

    public CustomerRepository()
    {
        _customers = new Dictionary<int, ICustomer>();
    }

    public void AddCustomer(int id, ICustomer customer)
    {
        if (customer == null)
        {
            throw new ArgumentNullException(nameof(customer));
        }
        _customers[id] = customer;
    }

    /// <summary>
    /// Returns customer by ID, or NullCustomer if not found.
    /// Never returns null, eliminating null checking in client code.
    /// </summary>
    public ICustomer GetCustomer(int id)
    {
        if (_customers.TryGetValue(id, out ICustomer customer))
        {
            return customer;
        }
        return NullCustomer.Instance;
    }
}

/// <summary>
/// Service class demonstrating null-safe operations using SpecialCase pattern.
/// </summary>
public class CustomerService
{
    private readonly CustomerRepository _repository;

    public CustomerService(CustomerRepository repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    /// <summary>
    /// Processes customer order without null checking.
    /// SpecialCase pattern ensures safe operations on missing customers.
    /// </summary>
    public void ProcessOrder(int customerId, decimal orderAmount)
    {
        // No null check needed - will always get a valid ICustomer
        ICustomer customer = _repository.GetCustomer(customerId);

        decimal discount = customer.GetDiscountPercentage();
        decimal finalAmount = orderAmount * (1 - discount / 100);

        Console.WriteLine($"Processing order for: {customer.Name}");
        Console.WriteLine($"Original amount: ${orderAmount:F2}");
        Console.WriteLine($"Discount: {discount}%");
        Console.WriteLine($"Final amount: ${finalAmount:F2}");

        // Send confirmation - safe even if customer is NullCustomer
        customer.SendEmail($"Order confirmed: ${finalAmount:F2}");
    }

    /// <summary>
    /// Generates customer report without null checking.
    /// </summary>
    public void GenerateCustomerReport(int customerId)
    {
        ICustomer customer = _repository.GetCustomer(customerId);

        Console.WriteLine("\n--- Customer Report ---");
        Console.WriteLine($"Name: {customer.Name}");
        Console.WriteLine($"Email: {customer.Email}");
        Console.WriteLine($"Discount Rate: {customer.GetDiscountPercentage()}%");
        Console.WriteLine($"Order Count: {customer.GetOrderHistory().Count}");

        if (customer.IsNull)
        {
            Console.WriteLine("NOTE: Customer not found in system");
        }
    }
}
