using System;

namespace Enterprise.DomainLogic.DomainModel;

/// <summary>
/// Demonstrates the Domain Model pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Domain Model Pattern Demo ===\n");

        try
        {
            // Create domain objects
            Customer customer = new Customer(1, "John Doe", "john@example.com", creditLimit: 5000m, isVip: false);
            Product laptop = new Product(1, "Laptop", 999.99m, initialStock: 10);
            Product mouse = new Product(2, "Mouse", 29.99m, initialStock: 50);

            Console.WriteLine($"Customer: {customer.Name}, Credit Limit: ${customer.CreditLimit}");
            Console.WriteLine($"Product: {laptop.Name}, Price: ${laptop.Price}, Stock: {laptop.AvailableStock}");
            Console.WriteLine($"Product: {mouse.Name}, Price: ${mouse.Price}, Stock: {mouse.AvailableStock}\n");

            // Create and build an order
            Order order = new Order(customer);
            Console.WriteLine("Creating new order...");

            order.AddProduct(laptop, 2);
            Console.WriteLine($"Added 2 {laptop.Name}s");

            order.AddProduct(mouse, 3);
            Console.WriteLine($"Added 3 {mouse.Name}s");

            decimal total = order.GetTotal();
            decimal discount = order.ApplyDiscount();
            decimal finalTotal = order.GetFinalTotal();

            Console.WriteLine($"\nOrder Total: ${total:F2}");
            Console.WriteLine($"Discount: ${discount:F2}");
            Console.WriteLine($"Final Total: ${finalTotal:F2}");

            // Place the order
            Console.WriteLine("\nPlacing order...");
            order.Place();
            Console.WriteLine($"Order placed successfully! Status: {order.Status}");
            Console.WriteLine($"Laptop available stock: {laptop.AvailableStock}");
            Console.WriteLine($"Mouse available stock: {mouse.AvailableStock}");

            // Try to modify placed order
            Console.WriteLine("\n Attempting to modify placed order...");
            try
            {
                order.AddProduct(laptop, 1);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }

            // Cancel order
            Console.WriteLine("\nCancelling order...");
            order.Cancel();
            Console.WriteLine($"Order cancelled. Status: {order.Status}");
            Console.WriteLine($"Laptop available stock restored: {laptop.AvailableStock}");

            // Demonstrate VIP customer
            Console.WriteLine("\n--- VIP Customer Demo ---");
            customer.PromoteToVip();
            Console.WriteLine($"Customer promoted to VIP. New credit limit: ${customer.CreditLimit}");

            Order vipOrder = new Order(customer);
            vipOrder.AddProduct(laptop, 1);
            decimal vipDiscount = vipOrder.ApplyDiscount();
            Console.WriteLine($"VIP Order total: ${vipOrder.GetTotal():F2}");
            Console.WriteLine($"VIP Discount: ${vipDiscount:F2} (5% VIP discount)");
            Console.WriteLine($"VIP Final total: ${vipOrder.GetFinalTotal():F2}");

            Console.WriteLine("\n=== Demo Complete ===");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
