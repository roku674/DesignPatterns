namespace FactoryMethod;

/// <summary>
/// The Product interface declares the operations that all concrete products must implement.
/// </summary>
public interface IProduct
{
    /// <summary>
    /// Performs the main operation of the product.
    /// </summary>
    /// <returns>A string describing the operation result.</returns>
    string Operation();
}
