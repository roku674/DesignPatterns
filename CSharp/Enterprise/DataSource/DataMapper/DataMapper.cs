using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Enterprise.DataSource.DataMapper
{
    // Domain Model - completely independent of database structure
    public class Person
    {
        public Guid Id { get; private set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string EmailAddress { get; set; }
        public Address HomeAddress { get; set; }

        public Person(Guid id, string firstName, string lastName, DateTime dateOfBirth, string email)
        {
            Id = id;
            FirstName = firstName ?? throw new ArgumentNullException(nameof(firstName));
            LastName = lastName ?? throw new ArgumentNullException(nameof(lastName));
            DateOfBirth = dateOfBirth;
            EmailAddress = email ?? throw new ArgumentNullException(nameof(email));
        }

        public int GetAge()
        {
            DateTime today = DateTime.Today;
            int age = today.Year - DateOfBirth.Year;
            if (DateOfBirth.Date > today.AddYears(-age)) age--;
            return age;
        }

        public string GetFullName()
        {
            return $"{FirstName} {LastName}";
        }

        public override string ToString()
        {
            return $"{GetFullName()} (Age: {GetAge()}, Email: {EmailAddress})";
        }
    }

    public class Address
    {
        public string Street { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }
        public string Country { get; set; }

        public Address(string street, string city, string state, string zipCode, string country)
        {
            Street = street ?? throw new ArgumentNullException(nameof(street));
            City = city ?? throw new ArgumentNullException(nameof(city));
            State = state ?? throw new ArgumentNullException(nameof(state));
            ZipCode = zipCode ?? throw new ArgumentNullException(nameof(zipCode));
            Country = country ?? throw new ArgumentNullException(nameof(country));
        }

        public override string ToString()
        {
            return $"{Street}, {City}, {State} {ZipCode}, {Country}";
        }
    }

    public class Product
    {
        public Guid Id { get; private set; }
        public string Name { get; set; }
        public string Sku { get; set; }
        public decimal Price { get; set; }
        public string Category { get; set; }
        public bool InStock { get; set; }

        public Product(Guid id, string name, string sku, decimal price, string category, bool inStock)
        {
            Id = id;
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Sku = sku ?? throw new ArgumentNullException(nameof(sku));
            Price = price;
            Category = category ?? throw new ArgumentNullException(nameof(category));
            InStock = inStock;
        }

        public override string ToString()
        {
            return $"{Name} (SKU: {Sku}) - ${Price} - {(InStock ? "In Stock" : "Out of Stock")}";
        }
    }

    // Database Row representation (simulating database structure)
    public class DatabaseRow
    {
        private readonly Dictionary<string, object> _columns = new Dictionary<string, object>();

        public void SetValue(string columnName, object value)
        {
            _columns[columnName] = value;
        }

        public T GetValue<T>(string columnName)
        {
            if (_columns.TryGetValue(columnName, out object value))
            {
                if (value is T typedValue)
                {
                    return typedValue;
                }

                // Handle type conversions
                if (value is DBNull)
                {
                    return default(T);
                }

                return (T)Convert.ChangeType(value, typeof(T));
            }

            return default(T);
        }

        public bool HasColumn(string columnName)
        {
            return _columns.ContainsKey(columnName);
        }

        public IEnumerable<string> GetColumnNames()
        {
            return _columns.Keys;
        }
    }

    // Simulated Database
    public class InMemoryDatabase
    {
        private readonly Dictionary<Guid, DatabaseRow> _personTable = new Dictionary<Guid, DatabaseRow>();
        private readonly Dictionary<Guid, DatabaseRow> _productTable = new Dictionary<Guid, DatabaseRow>();

        public void SeedData()
        {
            // Seed person data
            AddPerson(Guid.Parse("00000000-0000-0000-0000-000000000001"), "John", "Doe",
                new DateTime(1985, 6, 15), "john.doe@example.com",
                "123 Main St", "Springfield", "IL", "62701", "USA");

            AddPerson(Guid.Parse("00000000-0000-0000-0000-000000000002"), "Jane", "Smith",
                new DateTime(1990, 3, 22), "jane.smith@example.com",
                "456 Oak Ave", "Portland", "OR", "97201", "USA");

            AddPerson(Guid.Parse("00000000-0000-0000-0000-000000000003"), "Bob", "Johnson",
                new DateTime(1978, 11, 8), "bob.johnson@example.com",
                "789 Pine Rd", "Austin", "TX", "78701", "USA");

            // Seed product data
            AddProduct(Guid.Parse("00000000-0000-0000-0000-000000000011"), "Laptop Pro", "LAP-001",
                1299.99m, "Electronics", true);

            AddProduct(Guid.Parse("00000000-0000-0000-0000-000000000012"), "Wireless Mouse", "MOU-001",
                29.99m, "Accessories", true);

            AddProduct(Guid.Parse("00000000-0000-0000-0000-000000000013"), "USB-C Cable", "CAB-001",
                14.99m, "Accessories", false);
        }

        private void AddPerson(Guid id, string firstName, string lastName, DateTime dob, string email,
            string street, string city, string state, string zip, string country)
        {
            DatabaseRow row = new DatabaseRow();
            row.SetValue("person_id", id);
            row.SetValue("first_name", firstName);
            row.SetValue("last_name", lastName);
            row.SetValue("birth_date", dob);
            row.SetValue("email", email);
            row.SetValue("address_street", street);
            row.SetValue("address_city", city);
            row.SetValue("address_state", state);
            row.SetValue("address_zip", zip);
            row.SetValue("address_country", country);

            _personTable[id] = row;
        }

        private void AddProduct(Guid id, string name, string sku, decimal price, string category, bool inStock)
        {
            DatabaseRow row = new DatabaseRow();
            row.SetValue("product_id", id);
            row.SetValue("product_name", name);
            row.SetValue("product_sku", sku);
            row.SetValue("unit_price", price);
            row.SetValue("category_name", category);
            row.SetValue("stock_available", inStock ? 1 : 0);

            _productTable[id] = row;
        }

        public DatabaseRow FindPersonById(Guid id)
        {
            Console.WriteLine($"[DATABASE] SELECT * FROM persons WHERE person_id = '{id}'");
            System.Threading.Thread.Sleep(50); // Simulate DB latency
            _personTable.TryGetValue(id, out DatabaseRow row);
            return row;
        }

        public DatabaseRow FindProductById(Guid id)
        {
            Console.WriteLine($"[DATABASE] SELECT * FROM products WHERE product_id = '{id}'");
            System.Threading.Thread.Sleep(50); // Simulate DB latency
            _productTable.TryGetValue(id, out DatabaseRow row);
            return row;
        }

        public List<DatabaseRow> FindAllPersons()
        {
            Console.WriteLine("[DATABASE] SELECT * FROM persons");
            System.Threading.Thread.Sleep(50);
            return _personTable.Values.ToList();
        }

        public List<DatabaseRow> FindAllProducts()
        {
            Console.WriteLine("[DATABASE] SELECT * FROM products");
            System.Threading.Thread.Sleep(50);
            return _productTable.Values.ToList();
        }

        public void InsertPerson(DatabaseRow row)
        {
            Guid id = row.GetValue<Guid>("person_id");
            Console.WriteLine($"[DATABASE] INSERT INTO persons VALUES (...)");
            System.Threading.Thread.Sleep(50);
            _personTable[id] = row;
        }

        public void UpdatePerson(DatabaseRow row)
        {
            Guid id = row.GetValue<Guid>("person_id");
            Console.WriteLine($"[DATABASE] UPDATE persons SET ... WHERE person_id = '{id}'");
            System.Threading.Thread.Sleep(50);
            _personTable[id] = row;
        }

        public void DeletePerson(Guid id)
        {
            Console.WriteLine($"[DATABASE] DELETE FROM persons WHERE person_id = '{id}'");
            System.Threading.Thread.Sleep(50);
            _personTable.Remove(id);
        }
    }

    // Data Mapper interface
    public interface IDataMapper<T>
    {
        T Find(Guid id);
        List<T> FindAll();
        void Insert(T entity);
        void Update(T entity);
        void Delete(Guid id);
    }

    // Person Data Mapper - handles mapping between Person domain objects and database
    public class PersonDataMapper : IDataMapper<Person>
    {
        private readonly InMemoryDatabase _database;

        public PersonDataMapper(InMemoryDatabase database)
        {
            _database = database ?? throw new ArgumentNullException(nameof(database));
        }

        public Person Find(Guid id)
        {
            DatabaseRow row = _database.FindPersonById(id);
            if (row == null)
            {
                return null;
            }

            return MapToDomain(row);
        }

        public List<Person> FindAll()
        {
            List<DatabaseRow> rows = _database.FindAllPersons();
            return rows.Select(row => MapToDomain(row)).ToList();
        }

        public void Insert(Person entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            DatabaseRow row = MapToDatabase(entity);
            _database.InsertPerson(row);
        }

        public void Update(Person entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            DatabaseRow row = MapToDatabase(entity);
            _database.UpdatePerson(row);
        }

        public void Delete(Guid id)
        {
            _database.DeletePerson(id);
        }

        // Map database row to domain object
        private Person MapToDomain(DatabaseRow row)
        {
            Person person = new Person(
                row.GetValue<Guid>("person_id"),
                row.GetValue<string>("first_name"),
                row.GetValue<string>("last_name"),
                row.GetValue<DateTime>("birth_date"),
                row.GetValue<string>("email")
            );

            // Map nested address object
            person.HomeAddress = new Address(
                row.GetValue<string>("address_street"),
                row.GetValue<string>("address_city"),
                row.GetValue<string>("address_state"),
                row.GetValue<string>("address_zip"),
                row.GetValue<string>("address_country")
            );

            Console.WriteLine($"[MAPPER] Mapped database row to Person domain object: {person.GetFullName()}");
            return person;
        }

        // Map domain object to database row
        private DatabaseRow MapToDatabase(Person person)
        {
            DatabaseRow row = new DatabaseRow();
            row.SetValue("person_id", person.Id);
            row.SetValue("first_name", person.FirstName);
            row.SetValue("last_name", person.LastName);
            row.SetValue("birth_date", person.DateOfBirth);
            row.SetValue("email", person.EmailAddress);

            if (person.HomeAddress != null)
            {
                row.SetValue("address_street", person.HomeAddress.Street);
                row.SetValue("address_city", person.HomeAddress.City);
                row.SetValue("address_state", person.HomeAddress.State);
                row.SetValue("address_zip", person.HomeAddress.ZipCode);
                row.SetValue("address_country", person.HomeAddress.Country);
            }

            Console.WriteLine($"[MAPPER] Mapped Person domain object to database row");
            return row;
        }
    }

    // Product Data Mapper
    public class ProductDataMapper : IDataMapper<Product>
    {
        private readonly InMemoryDatabase _database;

        public ProductDataMapper(InMemoryDatabase database)
        {
            _database = database ?? throw new ArgumentNullException(nameof(database));
        }

        public Product Find(Guid id)
        {
            DatabaseRow row = _database.FindProductById(id);
            if (row == null)
            {
                return null;
            }

            return MapToDomain(row);
        }

        public List<Product> FindAll()
        {
            List<DatabaseRow> rows = _database.FindAllProducts();
            return rows.Select(row => MapToDomain(row)).ToList();
        }

        public void Insert(Product entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            // Insert logic would go here
            Console.WriteLine($"[MAPPER] Inserted product: {entity.Name}");
        }

        public void Update(Product entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            // Update logic would go here
            Console.WriteLine($"[MAPPER] Updated product: {entity.Name}");
        }

        public void Delete(Guid id)
        {
            Console.WriteLine($"[MAPPER] Deleted product: {id}");
        }

        // Map database row to domain object (note different column names)
        private Product MapToDomain(DatabaseRow row)
        {
            Product product = new Product(
                row.GetValue<Guid>("product_id"),
                row.GetValue<string>("product_name"),
                row.GetValue<string>("product_sku"),
                row.GetValue<decimal>("unit_price"),
                row.GetValue<string>("category_name"),
                row.GetValue<int>("stock_available") == 1
            );

            Console.WriteLine($"[MAPPER] Mapped database row to Product domain object: {product.Name}");
            return product;
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Data Mapper Pattern - Separating Domain from Database ===\n");

            try
            {
                // Setup database
                InMemoryDatabase database = new InMemoryDatabase();
                database.SeedData();

                // Scenario 1: Basic CRUD operations
                Console.WriteLine("--- Scenario 1: Basic CRUD Operations ---");
                await Scenario1_BasicCRUD(database);

                // Scenario 2: Finding all entities
                Console.WriteLine("\n--- Scenario 2: Finding All Entities ---");
                Scenario2_FindAll(database);

                // Scenario 3: Domain logic independence
                Console.WriteLine("\n--- Scenario 3: Domain Logic Independent of Database ---");
                Scenario3_DomainLogic(database);

                // Scenario 4: Different mappings for different entities
                Console.WriteLine("\n--- Scenario 4: Multiple Mappers for Different Entities ---");
                Scenario4_MultipleMappers(database);

                // Scenario 5: Update operations
                Console.WriteLine("\n--- Scenario 5: Update Operations ---");
                Scenario5_Updates(database);

                Console.WriteLine("\n=== All Scenarios Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }

        private static async Task Scenario1_BasicCRUD(InMemoryDatabase database)
        {
            PersonDataMapper mapper = new PersonDataMapper(database);

            // Find
            Console.WriteLine("Finding person by ID:");
            Person person = mapper.Find(Guid.Parse("00000000-0000-0000-0000-000000000001"));
            Console.WriteLine($"Found: {person}");
            Console.WriteLine($"Address: {person.HomeAddress}\n");

            // Insert
            Console.WriteLine("Inserting new person:");
            Person newPerson = new Person(
                Guid.NewGuid(),
                "Alice",
                "Williams",
                new DateTime(1995, 7, 20),
                "alice.williams@example.com"
            );
            newPerson.HomeAddress = new Address("321 Elm St", "Seattle", "WA", "98101", "USA");

            mapper.Insert(newPerson);
            Console.WriteLine($"Inserted: {newPerson}\n");

            // Delete
            Console.WriteLine("Deleting person:");
            await Task.Run(() => mapper.Delete(newPerson.Id));
            Console.WriteLine("Person deleted successfully");
        }

        private static void Scenario2_FindAll(InMemoryDatabase database)
        {
            PersonDataMapper personMapper = new PersonDataMapper(database);

            Console.WriteLine("Loading all persons:");
            List<Person> persons = personMapper.FindAll();

            Console.WriteLine($"\nFound {persons.Count} persons:");
            foreach (Person person in persons)
            {
                Console.WriteLine($"  - {person}");
                Console.WriteLine($"    Lives at: {person.HomeAddress}");
            }
        }

        private static void Scenario3_DomainLogic(InMemoryDatabase database)
        {
            PersonDataMapper mapper = new PersonDataMapper(database);

            Console.WriteLine("Domain objects have rich behavior independent of database:");
            List<Person> persons = mapper.FindAll();

            foreach (Person person in persons)
            {
                Console.WriteLine($"\n{person.GetFullName()}:");
                Console.WriteLine($"  Age: {person.GetAge()} years old");
                Console.WriteLine($"  Email: {person.EmailAddress}");
                Console.WriteLine($"  Location: {person.HomeAddress.City}, {person.HomeAddress.State}");
            }

            Console.WriteLine("\nNote: The GetAge() and GetFullName() methods exist in the domain");
            Console.WriteLine("      but have no representation in the database!");
        }

        private static void Scenario4_MultipleMappers(InMemoryDatabase database)
        {
            ProductDataMapper productMapper = new ProductDataMapper(database);

            Console.WriteLine("Different mappers handle different entity types:");
            Console.WriteLine("Note how Product uses different column names than Person!\n");

            List<Product> products = productMapper.FindAll();

            Console.WriteLine($"Found {products.Count} products:");
            foreach (Product product in products)
            {
                Console.WriteLine($"  - {product}");
                Console.WriteLine($"    Category: {product.Category}");
            }

            Console.WriteLine("\nThe mapper handles the translation between:");
            Console.WriteLine("  Database: product_name, unit_price, stock_available");
            Console.WriteLine("  Domain:   Name, Price, InStock");
        }

        private static void Scenario5_Updates(InMemoryDatabase database)
        {
            PersonDataMapper mapper = new PersonDataMapper(database);

            Guid personId = Guid.Parse("00000000-0000-0000-0000-000000000002");

            Console.WriteLine("Loading person:");
            Person person = mapper.Find(personId);
            Console.WriteLine($"Before: {person}");

            Console.WriteLine("\nModifying domain object:");
            person.EmailAddress = "jane.smith.updated@example.com";
            person.HomeAddress = new Address("999 New St", "Denver", "CO", "80201", "USA");

            Console.WriteLine("\nSaving changes:");
            mapper.Update(person);

            Console.WriteLine("\nReloading to verify:");
            Person reloaded = mapper.Find(personId);
            Console.WriteLine($"After: {reloaded}");
            Console.WriteLine($"New Address: {reloaded.HomeAddress}");
        }
    }
}
