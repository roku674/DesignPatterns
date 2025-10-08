namespace FactoryMethod;

/// <summary>
/// Concrete Product A implements the IProduct interface.
/// Represents a car shipping method.
/// </summary>
public class CarShipping : IProduct
{
    /// <summary>
    /// Returns the result of car shipping operation.
    /// </summary>
    public string Operation()
    {
        return "Shipping by car - Fast delivery within city limits";
    }
}
