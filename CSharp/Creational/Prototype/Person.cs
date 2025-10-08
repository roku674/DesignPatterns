namespace Prototype;

/// <summary>
/// Concrete Prototype representing a person with contact information.
/// Demonstrates deep cloning of objects with nested references.
/// </summary>
public class Person : IPrototype<Person>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Email { get; set; } = string.Empty;
    public Address Address { get; set; } = new Address();
    public List<string> PhoneNumbers { get; set; } = new List<string>();

    public Person() { }

    /// <summary>
    /// Copy constructor for deep cloning.
    /// </summary>
    private Person(Person source)
    {
        FirstName = source.FirstName;
        LastName = source.LastName;
        Age = source.Age;
        Email = source.Email;

        // Deep copy of Address
        Address = source.Address.Clone();

        // Deep copy of List
        PhoneNumbers = new List<string>(source.PhoneNumbers);
    }

    /// <summary>
    /// Creates a deep copy of the person object.
    /// </summary>
    public Person Clone()
    {
        return new Person(this);
    }

    public void DisplayInfo()
    {
        Console.WriteLine($"\nPerson Information:");
        Console.WriteLine($"Name: {FirstName} {LastName}");
        Console.WriteLine($"Age: {Age}");
        Console.WriteLine($"Email: {Email}");
        Console.WriteLine($"Address: {Address}");
        Console.WriteLine($"Phone Numbers: {string.Join(", ", PhoneNumbers)}");
        Console.WriteLine($"Object Hash Code: {GetHashCode()}");
    }
}
