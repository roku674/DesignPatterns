namespace FactoryMethod;

/// <summary>
/// Concrete Creator C overrides the factory method to return an AirShipping instance.
/// </summary>
public class AirLogistics : LogisticsCreator
{
    /// <summary>
    /// Creates and returns an air shipping product.
    /// </summary>
    public override IProduct CreateTransport()
    {
        return new AirShipping();
    }
}
