namespace Prototype;

/// <summary>
/// Demonstrates the Prototype pattern with real cloning implementations.
/// Shows production-ready cloning strategies and use cases.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Prototype Pattern Demo ===");
        Console.WriteLine("Production-Ready Cloning Strategies\n");

        // Example 1: Enhanced Person cloning with multiple strategies
        DemoEnhancedPersonCloning();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 2: Database record cloning for caching/versioning
        DemoDatabaseRecordCloning();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 3: Cloning performance comparison
        DemoPerformanceComparison();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 4: Original demos (educational)
        DemoPersonCloning();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        DemoDocumentCloning();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        DemoPrototypeRegistry();
    }

    /// <summary>
    /// Demonstrates enhanced person cloning with multiple strategies.
    /// </summary>
    private static void DemoEnhancedPersonCloning()
    {
        Console.WriteLine("--- Enhanced Person Cloning Demo ---");

        // Create original person
        Person original = new Person
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
            PhoneNumbers = new List<string> { "555-1234", "555-5678" },
            Metadata = new Dictionary<string, string>
            {
                { "Department", "Engineering" },
                { "EmployeeId", "E12345" },
                { "Level", "Senior" }
            }
        };

        Console.WriteLine("\nOriginal Person:");
        original.DisplayInfo();

        // Strategy 1: Deep copy via copy constructor (recommended)
        Console.WriteLine("\n--- Strategy 1: Deep Copy (Copy Constructor) ---");
        Person deepCopy = original.Clone();
        deepCopy.FirstName = "Jane";
        deepCopy.Age = 28;
        deepCopy.Address.City = "New York";
        deepCopy.Metadata["Level"] = "Lead";

        Console.WriteLine("\nOriginal (unchanged):");
        Console.WriteLine($"Name: {original.FirstName}, City: {original.Address.City}, Level: {original.Metadata["Level"]}");
        Console.WriteLine("\nDeep Copy (modified):");
        Console.WriteLine($"Name: {deepCopy.FirstName}, City: {deepCopy.Address.City}, Level: {deepCopy.Metadata["Level"]}");

        // Strategy 2: Shallow copy
        Console.WriteLine("\n--- Strategy 2: Shallow Copy (Reference Sharing) ---");
        Person shallowCopy = original.ShallowCopy();
        shallowCopy.FirstName = "Bob"; // This won't affect original
        shallowCopy.Address.City = "Los Angeles"; // This WILL affect original!

        Console.WriteLine($"\nOriginal city after shallow copy modification: {original.Address.City}");
        Console.WriteLine($"Shallow copy city: {shallowCopy.Address.City}");
        Console.WriteLine("Note: Both point to the same Address object!");

        // Reset for next test
        original.Address.City = "Springfield";

        // Strategy 3: Serialization-based cloning
        Console.WriteLine("\n--- Strategy 3: Serialization-Based Cloning ---");
        DateTime startTime = DateTime.Now;
        Person serializationCopy = original.DeepCopyViaSerialization();
        TimeSpan elapsed = DateTime.Now - startTime;

        Console.WriteLine($"Serialization cloning took: {elapsed.TotalMilliseconds:F2}ms");
        Console.WriteLine($"Copy is valid: {serializationCopy.Validate()}");

        // ICloneable interface usage
        Console.WriteLine("\n--- ICloneable Interface Usage ---");
        ICloneable cloneable = original;
        Person interfaceCopy = (Person)cloneable.Clone();
        Console.WriteLine($"Cloned via ICloneable interface: {interfaceCopy.FirstName} {interfaceCopy.LastName}");
    }

    /// <summary>
    /// Demonstrates database record cloning for caching and versioning.
    /// </summary>
    private static void DemoDatabaseRecordCloning()
    {
        Console.WriteLine("--- Database Record Cloning Demo ---");

        // Create a database record
        DatabaseRecord record = new DatabaseRecord
        {
            TableName = "Users",
            State = RecordState.Active
        };

        record.SetField("username", "johndoe", "admin");
        record.SetField("email", "john@example.com", "admin");
        record.SetField("age", 30, "admin");
        record.SetField("isActive", true, "admin");

        Console.WriteLine("\nOriginal Record:");
        record.DisplayInfo();

        // Clone for caching
        Console.WriteLine("\n--- Cloning for Cache ---");
        DatabaseRecord cachedRecord = record.Clone();
        Console.WriteLine($"Cached record ID: {cachedRecord.Id}");
        Console.WriteLine($"Cache has same data: {cachedRecord.GetField<string>("username") == "johndoe"}");

        // Modify original
        record.SetField("age", 31, "user");
        record.SetField("lastLogin", DateTime.Now, "system");

        Console.WriteLine($"\nOriginal record age: {record.GetField<int>("age")}");
        Console.WriteLine($"Cached record age (unchanged): {cachedRecord.GetField<int>("age")}");
        Console.WriteLine($"Original has {record.ChangeLogs.Count} change logs");
        Console.WriteLine($"Cache has {cachedRecord.ChangeLogs.Count} change logs (before modification)");

        // Create snapshot for versioning
        Console.WriteLine("\n--- Creating Snapshot for Versioning ---");
        DatabaseRecord snapshot = record.CreateSnapshot();

        Console.WriteLine($"\nSnapshot ID: {snapshot.Id}");
        Console.WriteLine($"Snapshot of: {snapshot.Metadata.SnapshotOf}");
        Console.WriteLine($"Snapshot state: {snapshot.State}");

        // Continue modifying original
        record.SetField("status", "premium", "system");

        Console.WriteLine($"\nOriginal has 'status' field: {record.Fields.ContainsKey("status")}");
        Console.WriteLine($"Snapshot has 'status' field: {snapshot.Fields.ContainsKey("status")}");

        snapshot.DisplayInfo();
    }

    /// <summary>
    /// Demonstrates cloning performance comparison.
    /// </summary>
    private static void DemoPerformanceComparison()
    {
        Console.WriteLine("--- Cloning Performance Comparison ---");

        Person testPerson = new Person
        {
            FirstName = "Performance",
            LastName = "Test",
            Age = 25,
            Email = "perf@test.com",
            Address = new Address
            {
                Street = "123 Test St",
                City = "TestCity",
                State = "TS",
                ZipCode = "12345",
                Country = "TestLand"
            },
            PhoneNumbers = new List<string> { "111-1111", "222-2222", "333-3333" },
            Metadata = new Dictionary<string, string>
            {
                { "Key1", "Value1" },
                { "Key2", "Value2" },
                { "Key3", "Value3" }
            }
        };

        int iterations = 1000;

        // Test copy constructor performance
        Console.WriteLine($"\nTesting {iterations} iterations...");

        DateTime start = DateTime.Now;
        for (int i = 0; i < iterations; i++)
        {
            Person copy = testPerson.Clone();
        }
        TimeSpan copyConstructorTime = DateTime.Now - start;
        Console.WriteLine($"Copy Constructor: {copyConstructorTime.TotalMilliseconds:F2}ms");

        // Test serialization performance
        start = DateTime.Now;
        for (int i = 0; i < iterations; i++)
        {
            Person copy = testPerson.DeepCopyViaSerialization();
        }
        TimeSpan serializationTime = DateTime.Now - start;
        Console.WriteLine($"Serialization: {serializationTime.TotalMilliseconds:F2}ms");

        // Test shallow copy performance
        start = DateTime.Now;
        for (int i = 0; i < iterations; i++)
        {
            Person copy = testPerson.ShallowCopy();
        }
        TimeSpan shallowCopyTime = DateTime.Now - start;
        Console.WriteLine($"Shallow Copy: {shallowCopyTime.TotalMilliseconds:F2}ms");

        Console.WriteLine($"\nPerformance Ratio:");
        Console.WriteLine($"Shallow Copy is {copyConstructorTime.TotalMilliseconds / shallowCopyTime.TotalMilliseconds:F2}x faster than Copy Constructor");
        Console.WriteLine($"Copy Constructor is {serializationTime.TotalMilliseconds / copyConstructorTime.TotalMilliseconds:F2}x faster than Serialization");
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
