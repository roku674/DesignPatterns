namespace Prototype;

/// <summary>
/// Demonstrates the Prototype pattern with person and document examples.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Prototype Pattern Demo ===\n");

        // Example 1: Basic cloning of Person objects
        DemoPersonCloning();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Example 2: Cloning Document objects
        DemoDocumentCloning();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Example 3: Using Prototype Registry
        DemoPrototypeRegistry();
    }

    /// <summary>
    /// Demonstrates cloning of Person objects with nested Address.
    /// Shows deep cloning where modifying the clone doesn't affect the original.
    /// </summary>
    private static void DemoPersonCloning()
    {
        Console.WriteLine("--- Person Cloning Demo ---");

        // Create original person
        Person originalPerson = new Person
        {
            FirstName = "John",
            LastName = "Doe",
            Age = 30,
            Email = "john.doe@example.com",
            Address = new Address
            {
                Street = "123 Main St",
                City = "Springfield",
                State = "IL",
                ZipCode = "62701",
                Country = "USA"
            },
            PhoneNumbers = new List<string> { "555-1234", "555-5678" }
        };

        Console.WriteLine("\nOriginal Person:");
        originalPerson.DisplayInfo();

        // Clone the person
        Person clonedPerson = originalPerson.Clone();

        Console.WriteLine("\nCloned Person (before modification):");
        clonedPerson.DisplayInfo();

        // Modify the clone
        clonedPerson.FirstName = "Jane";
        clonedPerson.Age = 28;
        clonedPerson.Address.Street = "456 Oak Ave";
        clonedPerson.PhoneNumbers.Add("555-9999");

        Console.WriteLine("\n--- After Modifying Clone ---");
        Console.WriteLine("\nOriginal Person (unchanged):");
        originalPerson.DisplayInfo();

        Console.WriteLine("\nCloned Person (modified):");
        clonedPerson.DisplayInfo();
    }

    /// <summary>
    /// Demonstrates cloning of Document objects.
    /// </summary>
    private static void DemoDocumentCloning()
    {
        Console.WriteLine("--- Document Cloning Demo ---");

        // Create template document
        Document templateDoc = new Document
        {
            Title = "Project Proposal Template",
            Content = "This is a standard project proposal template with predefined sections...",
            Author = "Template System",
            Tags = new List<string> { "template", "proposal", "business" },
            Metadata = new Dictionary<string, string>
            {
                { "Version", "1.0" },
                { "Category", "Business" },
                { "Language", "English" }
            }
        };

        Console.WriteLine("\nTemplate Document:");
        templateDoc.DisplayInfo();

        // Clone for specific project
        Document project1 = templateDoc.Clone();
        project1.Title = "Q1 Marketing Campaign Proposal";
        project1.Author = "Marketing Team";
        project1.Tags.Add("marketing");
        project1.Tags.Add("Q1-2024");

        Document project2 = templateDoc.Clone();
        project2.Title = "New Product Development Proposal";
        project2.Author = "Product Team";
        project2.Tags.Add("product");
        project2.Tags.Add("development");

        Console.WriteLine("\nProject 1 (cloned and customized):");
        project1.DisplayInfo();

        Console.WriteLine("\nProject 2 (cloned and customized):");
        project2.DisplayInfo();

        Console.WriteLine("\nTemplate Document (unchanged):");
        templateDoc.DisplayInfo();
    }

    /// <summary>
    /// Demonstrates using a Prototype Registry for managing common prototypes.
    /// </summary>
    private static void DemoPrototypeRegistry()
    {
        Console.WriteLine("--- Prototype Registry Demo ---");

        PrototypeRegistry<Person> registry = new PrototypeRegistry<Person>();

        // Register common person templates
        Person employeeTemplate = new Person
        {
            Email = "employee@company.com",
            Address = new Address
            {
                Street = "Corporate Office",
                City = "Tech City",
                State = "CA",
                ZipCode = "94000",
                Country = "USA"
            }
        };

        Person customerTemplate = new Person
        {
            Email = "customer@domain.com",
            PhoneNumbers = new List<string> { "555-0000" }
        };

        registry.Register("Employee", employeeTemplate);
        registry.Register("Customer", customerTemplate);

        Console.WriteLine($"\nRegistered prototypes: {string.Join(", ", registry.GetRegisteredKeys())}");

        // Create new employees from template
        Person employee1 = registry.Create("Employee");
        employee1.FirstName = "Alice";
        employee1.LastName = "Smith";
        employee1.Age = 28;

        Person employee2 = registry.Create("Employee");
        employee2.FirstName = "Bob";
        employee2.LastName = "Johnson";
        employee2.Age = 35;

        // Create customer from template
        Person customer1 = registry.Create("Customer");
        customer1.FirstName = "Carol";
        customer1.LastName = "Williams";
        customer1.Age = 42;

        Console.WriteLine("\nEmployee 1 (from registry):");
        employee1.DisplayInfo();

        Console.WriteLine("\nEmployee 2 (from registry):");
        employee2.DisplayInfo();

        Console.WriteLine("\nCustomer 1 (from registry):");
        customer1.DisplayInfo();
    }
}
