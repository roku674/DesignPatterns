using System;

namespace Enterprise.DomainLogic.DomainModel;

/// <summary>
/// Domain Model - Product entity with inventory management logic.
/// </summary>
public class Product
{
    public int Id { get; private set; }
    public string Name { get; private set; }
    public decimal Price { get; private set; }
    public int Stock { get; private set; }
    public int ReservedStock { get; private set; }

    public Product(int id, string name, decimal price, int initialStock)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));

        if (price < 0)
            throw new ArgumentException("Price cannot be negative", nameof(price));

        if (initialStock < 0)
            throw new ArgumentException("Stock cannot be negative", nameof(initialStock));

        Id = id;
        Name = name;
        Price = price;
        Stock = initialStock;
        ReservedStock = 0;
    }

    public int AvailableStock => Stock - ReservedStock;

    /// <summary>
    /// Checks if requested quantity is available.
    /// </summary>
    public bool IsAvailable(int quantity)
    {
        return AvailableStock >= quantity;
    }

    /// <summary>
    /// Reserves stock for an order.
    /// </summary>
    public void ReserveStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive", nameof(quantity));

        if (!IsAvailable(quantity))
            throw new InvalidOperationException($"Insufficient stock. Available: {AvailableStock}, Requested: {quantity}");

        ReservedStock += quantity;
    }

    /// <summary>
    /// Restores previously reserved stock.
    /// </summary>
    public void RestoreStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive", nameof(quantity));

        if (quantity > ReservedStock)
            throw new InvalidOperationException("Cannot restore more than reserved");

        ReservedStock -= quantity;
    }

    /// <summary>
    /// Commits reserved stock (when order ships).
    /// </summary>
    public void CommitReservedStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive", nameof(quantity));

        if (quantity > ReservedStock)
            throw new InvalidOperationException("Cannot commit more than reserved");

        Stock -= quantity;
        ReservedStock -= quantity;
    }

    /// <summary>
    /// Adds stock (receiving inventory).
    /// </summary>
    public void AddStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive", nameof(quantity));

        Stock += quantity;
    }

    /// <summary>
    /// Updates the product price.
    /// </summary>
    public void UpdatePrice(decimal newPrice)
    {
        if (newPrice < 0)
            throw new ArgumentException("Price cannot be negative", nameof(newPrice));

        Price = newPrice;
    }
}
