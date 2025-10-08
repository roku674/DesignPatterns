using System;
using System.Collections.Generic;

namespace Enterprise.ObjectRelational.Repository;

/// <summary>
/// Demonstrates the Repository pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Repository Pattern Demo ===\n");

        // Create repositories
        IRepository<Customer> customerRepo = new InMemoryRepository<Customer>();
        IRepository<Product> productRepo = new InMemoryRepository<Product>();

        // Add customers
        Console.WriteLine("Adding customers...");
        Customer customer1 = new Customer("John Doe", "john@example.com");
        Customer customer2 = new Customer("Jane Smith", "jane@example.com");
        Customer customer3 = new Customer("Bob Wilson", "bob@example.com");

        customerRepo.Add(customer1);
        customerRepo.Add(customer2);
        customerRepo.Add(customer3);

        Console.WriteLine($"Added {customerRepo.Count()} customers\n");

        // Add products
        Console.WriteLine("Adding products...");
        Product product1 = new Product("Laptop", 999.99m, 10, "Electronics");
        Product product2 = new Product("Mouse", 29.99m, 50, "Electronics");
        Product product3 = new Product("Desk", 299.99m, 5, "Furniture");
        Product product4 = new Product("Chair", 199.99m, 8, "Furniture");

        productRepo.Add(product1);
        productRepo.Add(product2);
        productRepo.Add(product3);
        productRepo.Add(product4);

        Console.WriteLine($"Added {productRepo.Count()} products\n");

        // Query all customers
        Console.WriteLine("All customers:");
        IEnumerable<Customer> allCustomers = customerRepo.GetAll();
        foreach (Customer customer in allCustomers)
        {
            Console.WriteLine($"  {customer}");
        }

        // Query by ID
        Console.WriteLine("\nGet customer by ID (2):");
        Customer foundCustomer = customerRepo.GetById(2);
        Console.WriteLine($"  {foundCustomer}");

        // Query with predicate
        Console.WriteLine("\nFind electronics products:");
        IEnumerable<Product> electronics = productRepo.Find(p => p.Category == "Electronics");
        foreach (Product product in electronics)
        {
            Console.WriteLine($"  {product}");
        }

        Console.WriteLine("\nFind products under $100:");
        IEnumerable<Product> cheapProducts = productRepo.Find(p => p.Price < 100);
        foreach (Product product in cheapProducts)
        {
            Console.WriteLine($"  {product}");
        }

        // Update entity
        Console.WriteLine("\nUpdating customer 1...");
        customer1.Email = "newemail@example.com";
        customerRepo.Update(customer1);
        Customer updatedCustomer = customerRepo.GetById(customer1.Id);
        Console.WriteLine($"  Updated: {updatedCustomer}");

        // Check existence
        Console.WriteLine("\nChecking if customer 2 exists:");
        bool exists = customerRepo.Exists(2);
        Console.WriteLine($"  Exists: {exists}");

        // Count with predicate
        Console.WriteLine("\nCount furniture products:");
        int furnitureCount = productRepo.Count(p => p.Category == "Furniture");
        Console.WriteLine($"  Count: {furnitureCount}");

        // Remove entity
        Console.WriteLine("\nRemoving customer 3...");
        customerRepo.RemoveById(3);
        Console.WriteLine($"  Remaining customers: {customerRepo.Count()}");

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
