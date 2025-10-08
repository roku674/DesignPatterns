using System;

namespace Enterprise.DomainLogic.DomainModel;

/// <summary>
/// Domain Model - Order line value object with its own business logic.
/// </summary>
public class OrderLine
{
    public Product Product { get; private set; }
    public int Quantity { get; private set; }
    public decimal PriceAtOrder { get; private set; }

    public OrderLine(Product product, int quantity)
    {
        Product = product ?? throw new ArgumentNullException(nameof(product));

        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive", nameof(quantity));

        Quantity = quantity;
        PriceAtOrder = product.Price; // Capture price at time of order
    }

    public void IncreaseQuantity(int amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));

        Quantity += amount;
    }

    public void DecreaseQuantity(int amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));

        if (Quantity - amount < 0)
            throw new InvalidOperationException("Quantity cannot be negative");

        Quantity -= amount;
    }

    public decimal GetLineTotal()
    {
        return PriceAtOrder * Quantity;
    }
}
