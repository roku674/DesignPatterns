using System;

namespace Enterprise.BasePatterns.SpecialCase;

/// <summary>
/// Demonstrates the SpecialCase (Null Object) pattern.
/// This pattern provides special behavior for particular cases (null/missing objects)
/// eliminating the need for null checking throughout the codebase.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== SpecialCase (Null Object) Pattern Demo ===\n");

        // Setup: Create repository and add some customers
        CustomerRepository repository = new CustomerRepository();
        CustomerService service = new CustomerService(repository);

        // Add real customers
        RealCustomer customer1 = new RealCustomer("John Doe", "john@example.com", 10m);
        customer1.AddOrder("ORD-001");
        customer1.AddOrder("ORD-002");
        repository.AddCustomer(1, customer1);

        RealCustomer customer2 = new RealCustomer("Jane Smith", "jane@example.com", 15m);
        customer2.AddOrder("ORD-003");
        repository.AddCustomer(2, customer2);

        Console.WriteLine("1. Processing order for EXISTING customer (ID: 1):");
        Console.WriteLine(new string('-', 60));
        service.ProcessOrder(1, 100m);

        Console.WriteLine("\n\n2. Processing order for NON-EXISTING customer (ID: 999):");
        Console.WriteLine(new string('-', 60));
        // No null check needed! NullCustomer handles this gracefully
        service.ProcessOrder(999, 100m);

        Console.WriteLine("\n\n3. Generate report for EXISTING customer (ID: 2):");
        Console.WriteLine(new string('-', 60));
        service.GenerateCustomerReport(2);

        Console.WriteLine("\n\n4. Generate report for NON-EXISTING customer (ID: 777):");
        Console.WriteLine(new string('-', 60));
        service.GenerateCustomerReport(777);

        Console.WriteLine("\n\n5. Demonstrating null-safe operations:");
        Console.WriteLine(new string('-', 60));

        // Without SpecialCase pattern, this would require:
        // if (customer != null) { customer.SendEmail(...); }
        // With SpecialCase, we can safely call methods:
        ICustomer existingCustomer = repository.GetCustomer(1);
        ICustomer missingCustomer = repository.GetCustomer(999);

        Console.WriteLine($"\nExisting customer IsNull: {existingCustomer.IsNull}");
        Console.WriteLine($"Missing customer IsNull: {missingCustomer.IsNull}");

        Console.WriteLine("\nSending emails (no null checks needed):");
        existingCustomer.SendEmail("Thank you for your business!");
        missingCustomer.SendEmail("Thank you for your business!");

        Console.WriteLine("\n\nBenefits of SpecialCase Pattern:");
        Console.WriteLine("- Eliminates null checking throughout codebase");
        Console.WriteLine("- Provides safe default behavior for missing objects");
        Console.WriteLine("- Reduces code complexity and potential NullReferenceExceptions");
        Console.WriteLine("- Makes code more readable and maintainable");
        Console.WriteLine("- Client code doesn't need to know about null handling");

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
