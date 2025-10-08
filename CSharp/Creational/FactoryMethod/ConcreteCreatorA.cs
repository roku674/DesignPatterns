namespace FactoryMethod;

/// <summary>
/// Concrete Creator A overrides the factory method to return a CarShipping instance.
/// </summary>
public class RoadLogistics : LogisticsCreator
{
    /// <summary>
    /// Creates and returns a car shipping product.
    /// </summary>
    public override IProduct CreateTransport()
    {
        return new CarShipping();
    }
}
