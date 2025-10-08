using System;
using System.Collections.Generic;
using System.Linq;

namespace Enterprise.DomainLogic.TransactionScript;

/// <summary>
/// Mock implementation of data gateway for demonstration.
/// </summary>
public class MockDataGateway : IDataGateway
{
    private readonly List<Customer> _customers = new List<Customer>();
    private readonly List<Product> _products = new List<Product>();
    private readonly List<Order> _orders = new List<Order>();
    private readonly List<OrderLine> _orderLines = new List<OrderLine>();
    private int _nextOrderId = 1;

    public MockDataGateway()
    {
        SeedData();
    }

    private void SeedData()
    {
        _customers.Add(new Customer { Id = 1, Name = "John Doe", Email = "john@example.com" });
        _customers.Add(new Customer { Id = 2, Name = "Jane Smith", Email = "jane@example.com" });

        _products.Add(new Product { Id = 1, Name = "Laptop", Price = 999.99m, Stock = 10 });
        _products.Add(new Product { Id = 2, Name = "Mouse", Price = 29.99m, Stock = 50 });
        _products.Add(new Product { Id = 3, Name = "Keyboard", Price = 79.99m, Stock = 30 });
    }

    public Customer GetCustomer(int customerId)
    {
        return _customers.FirstOrDefault(c => c.Id == customerId);
    }

    public Product GetProduct(int productId)
    {
        return _products.FirstOrDefault(p => p.Id == productId);
    }

    public Order GetOrder(int orderId)
    {
        return _orders.FirstOrDefault(o => o.Id == orderId);
    }

    public OrderLine[] GetOrderLines(int orderId)
    {
        return _orderLines.Where(ol => ol.OrderId == orderId).ToArray();
    }

    public int CreateOrder(int customerId, DateTime orderDate, decimal total)
    {
        int orderId = _nextOrderId++;
        Order order = new Order
        {
            Id = orderId,
            CustomerId = customerId,
            OrderDate = orderDate,
            Total = total,
            Status = "Pending"
        };
        _orders.Add(order);
        return orderId;
    }

    public void CreateOrderLine(int orderId, int productId, int quantity, decimal price)
    {
        OrderLine orderLine = new OrderLine
        {
            OrderId = orderId,
            ProductId = productId,
            Quantity = quantity,
            Price = price
        };
        _orderLines.Add(orderLine);
    }

    public void UpdateProductStock(int productId, int newStock)
    {
        Product product = _products.FirstOrDefault(p => p.Id == productId);
        if (product != null)
        {
            product.Stock = newStock;
        }
    }

    public void UpdateOrderStatus(int orderId, string status)
    {
        Order order = _orders.FirstOrDefault(o => o.Id == orderId);
        if (order != null)
        {
            order.Status = status;
        }
    }
}
