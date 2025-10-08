using System;

namespace Enterprise.ObjectRelational.Repository;

/// <summary>
/// Another example domain entity.
/// </summary>
public class Product : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string Category { get; set; }

    public Product(string name, decimal price, int stockQuantity, string category)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));

        if (price < 0)
            throw new ArgumentException("Price cannot be negative", nameof(price));

        if (stockQuantity < 0)
            throw new ArgumentException("Stock quantity cannot be negative", nameof(stockQuantity));

        Price = price;
        StockQuantity = stockQuantity;
        Category = category ?? throw new ArgumentNullException(nameof(category));
    }

    public override string ToString()
    {
        return $"Product[{Id}]: {Name} - ${Price} (Stock: {StockQuantity}, Category: {Category})";
    }
}
