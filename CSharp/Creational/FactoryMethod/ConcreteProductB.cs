namespace FactoryMethod;

/// <summary>
/// Concrete Product B implements the IProduct interface.
/// Represents a ship shipping method.
/// </summary>
public class ShipShipping : IProduct
{
    /// <summary>
    /// Returns the result of ship shipping operation.
    /// </summary>
    public string Operation()
    {
        return "Shipping by ship - Economical for overseas delivery";
    }
}
