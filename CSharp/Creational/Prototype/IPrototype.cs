namespace Prototype;

/// <summary>
/// The Prototype interface declares the cloning method.
/// </summary>
public interface IPrototype<T>
{
    /// <summary>
    /// Creates a deep copy of the object.
    /// </summary>
    T Clone();
}
