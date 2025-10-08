using System;

namespace Enterprise.DomainLogic.TransactionScript;

/// <summary>
/// Example Transaction Script for processing orders.
/// Each method represents a complete transaction.
/// </summary>
public class OrderService
{
    private readonly IDataGateway _dataGateway;

    public OrderService(IDataGateway dataGateway)
    {
        _dataGateway = dataGateway ?? throw new ArgumentNullException(nameof(dataGateway));
    }

    /// <summary>
    /// Places an order - complete transaction in one procedure.
    /// </summary>
    public void PlaceOrder(int customerId, int productId, int quantity)
    {
        // Validate customer
        Customer customer = _dataGateway.GetCustomer(customerId);
        if (customer == null)
        {
            throw new InvalidOperationException($"Customer {customerId} not found");
        }

        // Validate product and check inventory
        Product product = _dataGateway.GetProduct(productId);
        if (product == null)
        {
            throw new InvalidOperationException($"Product {productId} not found");
        }

        if (product.Stock < quantity)
        {
            throw new InvalidOperationException("Insufficient stock");
        }

        // Calculate total
        decimal total = product.Price * quantity;

        // Create order
        int orderId = _dataGateway.CreateOrder(customerId, DateTime.Now, total);

        // Create order line
        _dataGateway.CreateOrderLine(orderId, productId, quantity, product.Price);

        // Update inventory
        _dataGateway.UpdateProductStock(productId, product.Stock - quantity);

        Console.WriteLine($"Order {orderId} placed successfully. Total: ${total}");
    }

    /// <summary>
    /// Cancels an order - another complete transaction.
    /// </summary>
    public void CancelOrder(int orderId)
    {
        Order order = _dataGateway.GetOrder(orderId);
        if (order == null)
        {
            throw new InvalidOperationException($"Order {orderId} not found");
        }

        if (order.Status == "Cancelled")
        {
            throw new InvalidOperationException("Order already cancelled");
        }

        // Get order lines to restore inventory
        OrderLine[] orderLines = _dataGateway.GetOrderLines(orderId);
        foreach (OrderLine line in orderLines)
        {
            Product product = _dataGateway.GetProduct(line.ProductId);
            _dataGateway.UpdateProductStock(line.ProductId, product.Stock + line.Quantity);
        }

        // Update order status
        _dataGateway.UpdateOrderStatus(orderId, "Cancelled");

        Console.WriteLine($"Order {orderId} cancelled successfully");
    }
}
