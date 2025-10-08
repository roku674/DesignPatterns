namespace FactoryMethod;

/// <summary>
/// Concrete Creator B overrides the factory method to return a ShipShipping instance.
/// </summary>
public class SeaLogistics : LogisticsCreator
{
    /// <summary>
    /// Creates and returns a ship shipping product.
    /// </summary>
    public override IProduct CreateTransport()
    {
        return new ShipShipping();
    }
}
