using System;
using System.Collections.Generic;

namespace Enterprise.BasePatterns.Mapper;

/// <summary>
/// Concrete implementation of Mapper pattern.
/// Object setting up communication between two subsystems
/// </summary>
public class MapperImplementation : IMapper
{
    public void Execute()
    {
        Console.WriteLine("Mapper Pattern - Object that sets up communication between two independent subsystems");
        Console.WriteLine("======================================================================================\n");

        DemonstrateDomainToDto();
        Console.WriteLine();
        DemonstrateCollectionMapping();
        Console.WriteLine();
        DemonstrateNestedMapping();
        Console.WriteLine();
        DemonstrateBidirectionalMapping();
    }

    private void DemonstrateDomainToDto()
    {
        Console.WriteLine("1. Domain Entity to DTO Mapping:");
        Console.WriteLine("   - Converts rich domain objects to simple data transfer objects");
        Console.WriteLine("   - Decouples internal representation from external API\n");

        Customer customer = new Customer
        {
            Id = 1,
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            DateOfBirth = new DateTime(1985, 6, 15),
            IsActive = true,
            LoyaltyPoints = 2500
        };

        CustomerMapper mapper = new CustomerMapper();
        CustomerDto dto = mapper.MapToDto(customer);

        Console.WriteLine("Domain Entity:");
        Console.WriteLine($"  Customer ID: {customer.Id}");
        Console.WriteLine($"  Name: {customer.FirstName} {customer.LastName}");
        Console.WriteLine($"  Email: {customer.Email}");
        Console.WriteLine($"  Date of Birth: {customer.DateOfBirth:yyyy-MM-dd}");
        Console.WriteLine($"  Is Active: {customer.IsActive}");
        Console.WriteLine($"  Loyalty Points: {customer.LoyaltyPoints}");

        Console.WriteLine("\nMapped DTO:");
        Console.WriteLine($"  Customer ID: {dto.Id}");
        Console.WriteLine($"  Full Name: {dto.FullName}");
        Console.WriteLine($"  Email: {dto.Email}");
        Console.WriteLine($"  Age: {dto.Age}");
        Console.WriteLine($"  Status: {dto.Status}");
        Console.WriteLine($"  Loyalty Tier: {dto.LoyaltyTier}");
    }

    private void DemonstrateCollectionMapping()
    {
        Console.WriteLine("2. Collection Mapping:");
        Console.WriteLine("   - Maps collections of domain objects to DTO collections");
        Console.WriteLine("   - Useful for list endpoints in APIs\n");

        List<Customer> customers = new List<Customer>
        {
            new Customer { Id = 1, FirstName = "Alice", LastName = "Smith", Email = "alice@example.com", DateOfBirth = new DateTime(1990, 3, 10), IsActive = true, LoyaltyPoints = 1500 },
            new Customer { Id = 2, FirstName = "Bob", LastName = "Johnson", Email = "bob@example.com", DateOfBirth = new DateTime(1988, 7, 22), IsActive = true, LoyaltyPoints = 3200 },
            new Customer { Id = 3, FirstName = "Carol", LastName = "Williams", Email = "carol@example.com", DateOfBirth = new DateTime(1995, 11, 5), IsActive = false, LoyaltyPoints = 500 }
        };

        CustomerMapper mapper = new CustomerMapper();
        List<CustomerDto> dtos = mapper.MapToDtoList(customers);

        Console.WriteLine($"Mapped {dtos.Count} customers:");
        foreach (CustomerDto dto in dtos)
        {
            Console.WriteLine($"  - {dto.FullName} ({dto.Status}): {dto.LoyaltyTier}");
        }
    }

    private void DemonstrateNestedMapping()
    {
        Console.WriteLine("3. Nested Object Mapping:");
        Console.WriteLine("   - Maps complex objects with nested relationships");
        Console.WriteLine("   - Handles aggregates and composed objects\n");

        Order order = new Order
        {
            Id = 101,
            OrderDate = DateTime.Now,
            Customer = new Customer
            {
                Id = 1,
                FirstName = "David",
                LastName = "Brown",
                Email = "david@example.com",
                DateOfBirth = new DateTime(1987, 4, 18),
                IsActive = true,
                LoyaltyPoints = 1800
            },
            Items = new List<OrderItem>
            {
                new OrderItem { ProductName = "Laptop", Quantity = 1, UnitPrice = 1200.00m },
                new OrderItem { ProductName = "Mouse", Quantity = 2, UnitPrice = 25.00m }
            },
            TotalAmount = 1250.00m,
            Status = "Pending"
        };

        OrderMapper orderMapper = new OrderMapper();
        OrderDto orderDto = orderMapper.MapToDto(order);

        Console.WriteLine("Domain Order:");
        Console.WriteLine($"  Order ID: {order.Id}");
        Console.WriteLine($"  Customer: {order.Customer.FirstName} {order.Customer.LastName}");
        Console.WriteLine($"  Items: {order.Items.Count}");
        Console.WriteLine($"  Total: ${order.TotalAmount:N2}");
        Console.WriteLine($"  Status: {order.Status}");

        Console.WriteLine("\nMapped Order DTO:");
        Console.WriteLine($"  Order ID: {orderDto.OrderId}");
        Console.WriteLine($"  Customer: {orderDto.CustomerName}");
        Console.WriteLine($"  Customer Email: {orderDto.CustomerEmail}");
        Console.WriteLine($"  Item Count: {orderDto.ItemCount}");
        Console.WriteLine($"  Total: ${orderDto.TotalAmount:N2}");
        Console.WriteLine($"  Status: {orderDto.Status}");
        Console.WriteLine($"  Order Date: {orderDto.OrderDate:yyyy-MM-dd HH:mm}");
    }

    private void DemonstrateBidirectionalMapping()
    {
        Console.WriteLine("4. Bidirectional Mapping:");
        Console.WriteLine("   - Maps from DTO back to domain entity");
        Console.WriteLine("   - Useful for updates and create operations\n");

        CustomerDto dto = new CustomerDto
        {
            Id = 5,
            FullName = "Emma Wilson",
            Email = "emma.wilson@example.com",
            Age = 32,
            Status = "Active",
            LoyaltyTier = "Gold"
        };

        CustomerMapper mapper = new CustomerMapper();
        Customer customer = mapper.MapFromDto(dto);

        Console.WriteLine("Input DTO:");
        Console.WriteLine($"  Full Name: {dto.FullName}");
        Console.WriteLine($"  Email: {dto.Email}");
        Console.WriteLine($"  Age: {dto.Age}");
        Console.WriteLine($"  Status: {dto.Status}");

        Console.WriteLine("\nMapped Domain Entity:");
        Console.WriteLine($"  Customer ID: {customer.Id}");
        Console.WriteLine($"  First Name: {customer.FirstName}");
        Console.WriteLine($"  Last Name: {customer.LastName}");
        Console.WriteLine($"  Email: {customer.Email}");
        Console.WriteLine($"  Is Active: {customer.IsActive}");
        Console.WriteLine($"  Loyalty Points: {customer.LoyaltyPoints}");
        Console.WriteLine($"  Date of Birth: {customer.DateOfBirth:yyyy-MM-dd}");

        Console.WriteLine("\nRound-trip verification:");
        CustomerDto roundTripDto = mapper.MapToDto(customer);
        Console.WriteLine($"  Original FullName: {dto.FullName}");
        Console.WriteLine($"  Round-trip FullName: {roundTripDto.FullName}");
        Console.WriteLine($"  Original Email: {dto.Email}");
        Console.WriteLine($"  Round-trip Email: {roundTripDto.Email}");
    }
}

/// <summary>
/// Domain entity representing a customer in the system.
/// Contains rich business logic and validation.
/// </summary>
public class Customer
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public DateTime DateOfBirth { get; set; }
    public bool IsActive { get; set; }
    public int LoyaltyPoints { get; set; }

    public int GetAge()
    {
        int age = DateTime.Now.Year - DateOfBirth.Year;
        if (DateTime.Now.DayOfYear < DateOfBirth.DayOfYear)
            age--;
        return age;
    }

    public string GetFullName()
    {
        return $"{FirstName} {LastName}";
    }
}

/// <summary>
/// Data Transfer Object for Customer.
/// Simple object for transferring data across boundaries (API, network, etc.).
/// </summary>
public class CustomerDto
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public int Age { get; set; }
    public string Status { get; set; }
    public string LoyaltyTier { get; set; }
}

/// <summary>
/// Mapper that converts between Customer domain entity and CustomerDto.
/// Implements bidirectional mapping logic.
/// </summary>
public class CustomerMapper
{
    public CustomerDto MapToDto(Customer customer)
    {
        if (customer == null)
            throw new ArgumentNullException(nameof(customer));

        return new CustomerDto
        {
            Id = customer.Id,
            FullName = customer.GetFullName(),
            Email = customer.Email,
            Age = customer.GetAge(),
            Status = customer.IsActive ? "Active" : "Inactive",
            LoyaltyTier = GetLoyaltyTier(customer.LoyaltyPoints)
        };
    }

    public Customer MapFromDto(CustomerDto dto)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        string[] nameParts = dto.FullName.Split(' ', 2);
        string firstName = nameParts.Length > 0 ? nameParts[0] : string.Empty;
        string lastName = nameParts.Length > 1 ? nameParts[1] : string.Empty;

        DateTime dateOfBirth = DateTime.Now.AddYears(-dto.Age);

        return new Customer
        {
            Id = dto.Id,
            FirstName = firstName,
            LastName = lastName,
            Email = dto.Email,
            DateOfBirth = dateOfBirth,
            IsActive = dto.Status.Equals("Active", StringComparison.OrdinalIgnoreCase),
            LoyaltyPoints = GetPointsFromTier(dto.LoyaltyTier)
        };
    }

    public List<CustomerDto> MapToDtoList(List<Customer> customers)
    {
        if (customers == null)
            throw new ArgumentNullException(nameof(customers));

        List<CustomerDto> dtos = new List<CustomerDto>();
        foreach (Customer customer in customers)
        {
            dtos.Add(MapToDto(customer));
        }
        return dtos;
    }

    private string GetLoyaltyTier(int points)
    {
        if (points >= 3000) return "Gold";
        if (points >= 1500) return "Silver";
        return "Bronze";
    }

    private int GetPointsFromTier(string tier)
    {
        if (tier == null) return 0;
        if (tier.Equals("Gold", StringComparison.OrdinalIgnoreCase)) return 3000;
        if (tier.Equals("Silver", StringComparison.OrdinalIgnoreCase)) return 1500;
        return 500;
    }
}

/// <summary>
/// Domain entity representing an order.
/// </summary>
public class Order
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public Customer Customer { get; set; }
    public List<OrderItem> Items { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; }
}

/// <summary>
/// Domain entity representing an order line item.
/// </summary>
public class OrderItem
{
    public string ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    public decimal GetTotal()
    {
        return Quantity * UnitPrice;
    }
}

/// <summary>
/// Data Transfer Object for Order.
/// Flattens the order structure for API consumption.
/// </summary>
public class OrderDto
{
    public int OrderId { get; set; }
    public DateTime OrderDate { get; set; }
    public string CustomerName { get; set; }
    public string CustomerEmail { get; set; }
    public int ItemCount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; }
}

/// <summary>
/// Mapper for Order to OrderDto conversion.
/// Demonstrates mapping of complex nested objects.
/// </summary>
public class OrderMapper
{
    public OrderDto MapToDto(Order order)
    {
        if (order == null)
            throw new ArgumentNullException(nameof(order));

        return new OrderDto
        {
            OrderId = order.Id,
            OrderDate = order.OrderDate,
            CustomerName = order.Customer != null ? order.Customer.GetFullName() : "Unknown",
            CustomerEmail = order.Customer?.Email ?? "N/A",
            ItemCount = order.Items?.Count ?? 0,
            TotalAmount = order.TotalAmount,
            Status = order.Status
        };
    }
}
