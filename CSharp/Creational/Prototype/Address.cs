namespace Prototype;

/// <summary>
/// Represents an address that will be cloned along with Person objects.
/// Demonstrates deep cloning of nested objects.
/// </summary>
public class Address : IPrototype<Address>
{
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;

    public Address() { }

    /// <summary>
    /// Copy constructor for deep cloning.
    /// </summary>
    private Address(Address source)
    {
        Street = source.Street;
        City = source.City;
        State = source.State;
        ZipCode = source.ZipCode;
        Country = source.Country;
    }

    /// <summary>
    /// Creates a deep copy of the address.
    /// </summary>
    public Address Clone()
    {
        return new Address(this);
    }

    public override string ToString()
    {
        return $"{Street}, {City}, {State} {ZipCode}, {Country}";
    }
}
