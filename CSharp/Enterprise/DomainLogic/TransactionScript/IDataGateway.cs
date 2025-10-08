using System;

namespace Enterprise.DomainLogic.TransactionScript;

/// <summary>
/// Data access interface for transaction scripts.
/// </summary>
public interface IDataGateway
{
    Customer GetCustomer(int customerId);
    Product GetProduct(int productId);
    Order GetOrder(int orderId);
    OrderLine[] GetOrderLines(int orderId);
    int CreateOrder(int customerId, DateTime orderDate, decimal total);
    void CreateOrderLine(int orderId, int productId, int quantity, decimal price);
    void UpdateProductStock(int productId, int newStock);
    void UpdateOrderStatus(int orderId, string status);
}

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
}

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; }
}

public class OrderLine
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
