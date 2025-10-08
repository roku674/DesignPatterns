using System;
using System.Collections.Generic;
using System.Linq;

namespace Enterprise.DomainLogic.DomainModel;

/// <summary>
/// Domain Model pattern - Rich domain objects with behavior and data.
/// Order aggregate root that encapsulates business logic.
/// </summary>
public class Order
{
    private readonly List<OrderLine> _orderLines;

    public int Id { get; private set; }
    public Customer Customer { get; private set; }
    public DateTime OrderDate { get; private set; }
    public OrderStatus Status { get; private set; }
    public IReadOnlyList<OrderLine> OrderLines => _orderLines.AsReadOnly();

    public Order(Customer customer)
    {
        Customer = customer ?? throw new ArgumentNullException(nameof(customer));
        OrderDate = DateTime.Now;
        Status = OrderStatus.Draft;
        _orderLines = new List<OrderLine>();
    }

    /// <summary>
    /// Adds a product to the order with business logic validation.
    /// </summary>
    public void AddProduct(Product product, int quantity)
    {
        if (product == null) throw new ArgumentNullException(nameof(product));
        if (quantity <= 0) throw new ArgumentException("Quantity must be positive", nameof(quantity));
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException("Cannot modify a placed order");

        if (!product.IsAvailable(quantity))
            throw new InvalidOperationException($"Insufficient stock for {product.Name}");

        OrderLine existingLine = _orderLines.FirstOrDefault(ol => ol.Product.Id == product.Id);
        if (existingLine != null)
        {
            existingLine.IncreaseQuantity(quantity);
        }
        else
        {
            OrderLine newLine = new OrderLine(product, quantity);
            _orderLines.Add(newLine);
        }
    }

    /// <summary>
    /// Removes a product from the order.
    /// </summary>
    public void RemoveProduct(int productId)
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException("Cannot modify a placed order");

        OrderLine line = _orderLines.FirstOrDefault(ol => ol.Product.Id == productId);
        if (line != null)
        {
            _orderLines.Remove(line);
        }
    }

    /// <summary>
    /// Places the order - transitions state and applies business rules.
    /// </summary>
    public void Place()
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException("Order has already been placed");

        if (!_orderLines.Any())
            throw new InvalidOperationException("Cannot place an empty order");

        if (!Customer.CanPlaceOrder(GetTotal()))
            throw new InvalidOperationException("Customer credit limit exceeded");

        // Reserve inventory
        foreach (OrderLine line in _orderLines)
        {
            line.Product.ReserveStock(line.Quantity);
        }

        Status = OrderStatus.Placed;
    }

    /// <summary>
    /// Cancels the order and restores inventory.
    /// </summary>
    public void Cancel()
    {
        if (Status == OrderStatus.Cancelled || Status == OrderStatus.Shipped)
            throw new InvalidOperationException($"Cannot cancel order in {Status} status");

        // Restore inventory
        foreach (OrderLine line in _orderLines)
        {
            line.Product.RestoreStock(line.Quantity);
        }

        Status = OrderStatus.Cancelled;
    }

    /// <summary>
    /// Calculates the total order amount.
    /// </summary>
    public decimal GetTotal()
    {
        return _orderLines.Sum(ol => ol.GetLineTotal());
    }

    /// <summary>
    /// Applies a discount to the order.
    /// </summary>
    public decimal ApplyDiscount()
    {
        decimal total = GetTotal();

        // Business rule: 10% discount for orders over $1000
        if (total > 1000m)
            return total * 0.10m;

        // Business rule: 5% discount for VIP customers
        if (Customer.IsVip)
            return total * 0.05m;

        return 0m;
    }

    public decimal GetFinalTotal()
    {
        return GetTotal() - ApplyDiscount();
    }
}

public enum OrderStatus
{
    Draft,
    Placed,
    Shipped,
    Cancelled
}
