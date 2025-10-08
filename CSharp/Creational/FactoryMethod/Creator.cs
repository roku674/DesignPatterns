namespace FactoryMethod;

/// <summary>
/// The Creator class declares the factory method that returns new product objects.
/// Subclasses usually provide the implementation of this method.
/// </summary>
public abstract class LogisticsCreator
{
    /// <summary>
    /// The factory method that subclasses override to produce specific products.
    /// </summary>
    public abstract IProduct CreateTransport();

    /// <summary>
    /// The Creator's primary responsibility uses the factory method to create product objects.
    /// </summary>
    public string PlanDelivery()
    {
        IProduct transport = CreateTransport();
        string result = "Logistics: Planning delivery using -> " + transport.Operation();
        return result;
    }
}
