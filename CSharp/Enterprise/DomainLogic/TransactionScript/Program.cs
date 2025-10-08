using System;

namespace Enterprise.DomainLogic.TransactionScript;

/// <summary>
/// Demonstrates the Transaction Script pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Transaction Script Pattern Demo ===\n");

        IDataGateway dataGateway = new MockDataGateway();
        OrderService orderService = new OrderService(dataGateway);

        try
        {
            // Place an order
            Console.WriteLine("1. Placing order for customer 1:");
            orderService.PlaceOrder(customerId: 1, productId: 1, quantity: 2);

            Console.WriteLine("\n2. Placing another order:");
            orderService.PlaceOrder(customerId: 2, productId: 2, quantity: 5);

            Console.WriteLine("\n3. Cancelling first order:");
            orderService.CancelOrder(orderId: 1);

            Console.WriteLine("\n4. Attempting to place order with insufficient stock:");
            try
            {
                orderService.PlaceOrder(customerId: 1, productId: 1, quantity: 100);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }

            Console.WriteLine("\n=== Demo Complete ===");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
