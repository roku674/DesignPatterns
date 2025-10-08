namespace Prototype;

/// <summary>
/// The Prototype Registry provides a convenient way to access frequently used prototypes.
/// This is an enhancement to the basic Prototype pattern.
/// </summary>
public class PrototypeRegistry<T> where T : IPrototype<T>
{
    private readonly Dictionary<string, T> _prototypes = new Dictionary<string, T>();

    /// <summary>
    /// Registers a prototype with a given key.
    /// </summary>
    public void Register(string key, T prototype)
    {
        _prototypes[key] = prototype;
    }

    /// <summary>
    /// Unregisters a prototype with the given key.
    /// </summary>
    public void Unregister(string key)
    {
        _prototypes.Remove(key);
    }

    /// <summary>
    /// Creates a clone of the prototype registered with the given key.
    /// </summary>
    public T Create(string key)
    {
        if (_prototypes.ContainsKey(key))
        {
            return _prototypes[key].Clone();
        }

        throw new ArgumentException($"No prototype registered with key: {key}");
    }

    /// <summary>
    /// Gets all registered prototype keys.
    /// </summary>
    public IEnumerable<string> GetRegisteredKeys()
    {
        return _prototypes.Keys;
    }
}
