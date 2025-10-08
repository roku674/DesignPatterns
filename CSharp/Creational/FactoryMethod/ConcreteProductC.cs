namespace FactoryMethod;

/// <summary>
/// Concrete Product C implements the IProduct interface.
/// Represents an air shipping method.
/// </summary>
public class AirShipping : IProduct
{
    /// <summary>
    /// Returns the result of air shipping operation.
    /// </summary>
    public string Operation()
    {
        return "Shipping by air - Express delivery worldwide";
    }
}
