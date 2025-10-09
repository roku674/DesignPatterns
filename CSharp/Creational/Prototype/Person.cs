using System.Text.Json;

namespace Prototype;

/// <summary>
/// Production-ready Person class with deep cloning using ICloneable.
/// Demonstrates multiple cloning strategies and real data handling.
/// </summary>
public class Person : IPrototype<Person>, ICloneable
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Email { get; set; } = string.Empty;
    public Address Address { get; set; } = new Address();
    public List<string> PhoneNumbers { get; set; } = new List<string>();
    public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public DateTime? LastModified { get; set; }

    public Person() { }

    /// <summary>
    /// Copy constructor for deep cloning (manual approach).
    /// Provides maximum control over the cloning process.
    /// </summary>
    private Person(Person source)
    {
        if (source == null)
        {
            throw new ArgumentNullException(nameof(source));
        }

        // Copy value types
        FirstName = source.FirstName;
        LastName = source.LastName;
        Age = source.Age;
        Email = source.Email;
        CreatedDate = source.CreatedDate;
        LastModified = source.LastModified;

        // Deep copy of Address (reference type)
        Address = source.Address.Clone();

        // Deep copy of List (collection)
        PhoneNumbers = new List<string>(source.PhoneNumbers);

        // Deep copy of Dictionary
        Metadata = new Dictionary<string, string>(source.Metadata);
    }

    /// <summary>
    /// Creates a deep copy using the copy constructor.
    /// This is the preferred method for type-safe cloning.
    /// </summary>
    public Person Clone()
    {
        Person cloned = new Person(this);
        cloned.LastModified = DateTime.Now;
        return cloned;
    }

    /// <summary>
    /// ICloneable implementation for framework compatibility.
    /// </summary>
    object ICloneable.Clone()
    {
        return Clone();
    }

    /// <summary>
    /// Creates a shallow copy of the person.
    /// Reference types will point to the same objects.
    /// </summary>
    public Person ShallowCopy()
    {
        return (Person)MemberwiseClone();
    }

    /// <summary>
    /// Creates a deep copy using serialization.
    /// This is slower but handles complex object graphs automatically.
    /// </summary>
    public Person DeepCopyViaSerialization()
    {
        string json = JsonSerializer.Serialize(this);
        Person? cloned = JsonSerializer.Deserialize<Person>(json);
        if (cloned == null)
        {
            throw new InvalidOperationException("Failed to deserialize person");
        }
        cloned.LastModified = DateTime.Now;
        return cloned;
    }

    /// <summary>
    /// Validates the person data.
    /// </summary>
    public bool Validate()
    {
        if (string.IsNullOrWhiteSpace(FirstName) || string.IsNullOrWhiteSpace(LastName))
        {
            return false;
        }

        if (Age < 0 || Age > 150)
        {
            return false;
        }

        if (!string.IsNullOrWhiteSpace(Email) && !Email.Contains("@"))
        {
            return false;
        }

        return true;
    }

    /// <summary>
    /// Updates the last modified timestamp.
    /// </summary>
    public void Touch()
    {
        LastModified = DateTime.Now;
    }

    public void DisplayInfo()
    {
        Console.WriteLine($"\nPerson Information:");
        Console.WriteLine($"Name: {FirstName} {LastName}");
        Console.WriteLine($"Age: {Age}");
        Console.WriteLine($"Email: {Email}");
        Console.WriteLine($"Address: {Address}");
        Console.WriteLine($"Phone Numbers: {string.Join(", ", PhoneNumbers)}");
        Console.WriteLine($"Metadata: {string.Join(", ", Metadata.Select(kv => $"{kv.Key}={kv.Value}"))}");
        Console.WriteLine($"Created: {CreatedDate:yyyy-MM-dd HH:mm:ss}");
        Console.WriteLine($"Last Modified: {(LastModified.HasValue ? LastModified.Value.ToString("yyyy-MM-dd HH:mm:ss") : "Never")}");
        Console.WriteLine($"Object Hash Code: {GetHashCode()}");
        Console.WriteLine($"Valid: {Validate()}");
    }

    /// <summary>
    /// Compares two Person objects for equality based on their data.
    /// </summary>
    public override bool Equals(object? obj)
    {
        if (obj is not Person other)
        {
            return false;
        }

        return FirstName == other.FirstName &&
               LastName == other.LastName &&
               Age == other.Age &&
               Email == other.Email;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(FirstName, LastName, Age, Email);
    }
}
