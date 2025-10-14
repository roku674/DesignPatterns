package Enterprise.ClassTableInheritance;

import java.util.*;
import java.sql.*;

/**
 * Class Table Inheritance Pattern Demonstration
 *
 * Intent: Maps each class in an inheritance hierarchy to its own database table.
 * Each table contains columns for the class's own fields, with a foreign key
 * reference to the superclass table.
 *
 * Key Concepts:
 * - One table per class in hierarchy
 * - Subclass tables have foreign key to superclass table
 * - No duplicate columns across hierarchy
 * - Supports polymorphic queries
 * - Requires joins to load complete objects
 *
 * Advantages:
 * - No wasted space (no null columns)
 * - Easy to understand schema
 * - Refactoring friendly
 * - Each class has its own table
 *
 * Disadvantages:
 * - Multiple table access for subclass objects
 * - Joins required for queries
 * - Slower than Single Table Inheritance
 *
 * Real-world examples:
 * - Employee hierarchy (Manager, Engineer, Salesperson)
 * - Vehicle types (Car, Truck, Motorcycle)
 * - Media content (Video, Audio, Document)
 * - Financial accounts (Checking, Savings, Investment)
 * - Product categories with specific attributes
 *
 * Database Schema Examples:
 *
 * -- Base class table
 * CREATE TABLE persons (
 *     person_id BIGINT PRIMARY KEY,
 *     name VARCHAR(255) NOT NULL,
 *     email VARCHAR(255),
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 *
 * -- Subclass table 1
 * CREATE TABLE employees (
 *     employee_id BIGINT PRIMARY KEY REFERENCES persons(person_id),
 *     department VARCHAR(100),
 *     salary DECIMAL(15,2),
 *     hire_date DATE
 * );
 *
 * -- Subclass table 2
 * CREATE TABLE customers (
 *     customer_id BIGINT PRIMARY KEY REFERENCES persons(person_id),
 *     customer_number VARCHAR(50),
 *     credit_limit DECIMAL(15,2),
 *     account_status VARCHAR(20)
 * );
 *
 * -- Join query example:
 * SELECT p.*, e.*
 * FROM persons p
 * JOIN employees e ON p.person_id = e.employee_id
 * WHERE e.department = 'Engineering';
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Class Table Inheritance Pattern Demo ===\n");

        // Scenario 1: Person Hierarchy (Employee, Customer)
        demonstratePersonHierarchy();

        // Scenario 2: Vehicle Hierarchy
        demonstrateVehicleHierarchy();

        // Scenario 3: Media Content Hierarchy
        demonstrateMediaContentHierarchy();

        // Scenario 4: Account Hierarchy
        demonstrateAccountHierarchy();

        // Scenario 5: Product Hierarchy
        demonstrateProductHierarchy();

        // Scenario 6: Polymorphic Queries
        demonstratePolymorphicQueries();

        // Scenario 7: Loading Complete Object Graph
        demonstrateCompleteObjectLoading();

        // Scenario 8: Inheritance with Multiple Levels
        demonstrateMultiLevelInheritance();

        // Scenario 9: ORM Mapping Configuration
        demonstrateORMConfiguration();

        // Scenario 10: Performance Considerations
        demonstratePerformanceConsiderations();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Person hierarchy with Employee and Customer subclasses
     */
    private static void demonstratePersonHierarchy() {
        System.out.println("--- Scenario 1: Person Hierarchy ---");

        PersonRepository repo = new PersonRepository();

        // Create employees
        Employee emp1 = new Employee(1L, "Alice Johnson", "alice@company.com",
            "Engineering", 95000.0, "2020-01-15");
        Employee emp2 = new Employee(2L, "Bob Smith", "bob@company.com",
            "Sales", 75000.0, "2019-06-01");

        // Create customers
        Customer cust1 = new Customer(3L, "Carol Williams", "carol@example.com",
            "CUST-1001", 10000.0, "ACTIVE");
        Customer cust2 = new Customer(4L, "Dave Brown", "dave@example.com",
            "CUST-1002", 5000.0, "ACTIVE");

        // Save all persons
        repo.save(emp1);
        repo.save(emp2);
        repo.save(cust1);
        repo.save(cust2);

        System.out.println("Saved 2 employees and 2 customers");

        // Query employees
        System.out.println("\nEmployees in Engineering:");
        List<Employee> engineers = repo.findEmployeesByDepartment("Engineering");
        engineers.forEach(e -> System.out.println("  " + e.getName() +
            " - $" + e.getSalary()));

        // Query customers
        System.out.println("\nActive customers:");
        List<Customer> activeCustomers = repo.findCustomersByStatus("ACTIVE");
        activeCustomers.forEach(c -> System.out.println("  " + c.getName() +
            " - Credit: $" + c.getCreditLimit()));

        System.out.println();
    }

    /**
     * Scenario 2: Vehicle hierarchy with different vehicle types
     */
    private static void demonstrateVehicleHierarchy() {
        System.out.println("--- Scenario 2: Vehicle Hierarchy ---");

        VehicleRepository repo = new VehicleRepository();

        // Create vehicles
        Car car = new Car(1L, "Toyota Camry", "2023", 28000.0, 4, "Sedan");
        Truck truck = new Truck(2L, "Ford F-150", "2023", 35000.0, 1500.0, "Pickup");
        Motorcycle bike = new Motorcycle(3L, "Harley Davidson", "2023", 18000.0,
            "Cruiser", 1200);

        repo.save(car);
        repo.save(truck);
        repo.save(bike);

        System.out.println("Saved 1 car, 1 truck, 1 motorcycle");

        // Load and display
        System.out.println("\nAll vehicles:");
        repo.findAll().forEach(v ->
            System.out.println("  " + v.getClass().getSimpleName() + ": " +
                v.getMake() + " - $" + v.getPrice()));

        System.out.println();
    }

    /**
     * Scenario 3: Media content with video, audio, and documents
     */
    private static void demonstrateMediaContentHierarchy() {
        System.out.println("--- Scenario 3: Media Content Hierarchy ---");

        MediaRepository repo = new MediaRepository();

        // Create different media types
        Video video = new Video(1L, "Tutorial Video", "MP4", 1024000L,
            "1920x1080", 3600);
        Audio audio = new Audio(2L, "Podcast Episode", "MP3", 52000L,
            "192kbps", 2400);
        Document doc = new Document(3L, "User Manual", "PDF", 2048L,
            50, "A4");

        repo.save(video);
        repo.save(audio);
        repo.save(doc);

        System.out.println("Saved 1 video, 1 audio, 1 document");

        // Query by type
        System.out.println("\nVideo files:");
        repo.findVideosByResolution("1920x1080").forEach(v ->
            System.out.println("  " + v.getTitle() + " - " + v.getDuration() + "s"));

        System.out.println();
    }

    /**
     * Scenario 4: Financial account hierarchy
     */
    private static void demonstrateAccountHierarchy() {
        System.out.println("--- Scenario 4: Account Hierarchy ---");

        AccountRepository repo = new AccountRepository();

        // Create different account types
        CheckingAccount checking = new CheckingAccount(1L, "ACC-1001", 5000.0,
            "ACTIVE", 500.0, 0.0);
        SavingsAccount savings = new SavingsAccount(2L, "ACC-1002", 25000.0,
            "ACTIVE", 2.5, 6);
        InvestmentAccount investment = new InvestmentAccount(3L, "ACC-1003", 100000.0,
            "ACTIVE", "Aggressive", 8.5);

        repo.save(checking);
        repo.save(savings);
        repo.save(investment);

        System.out.println("Created checking, savings, and investment accounts");

        // Calculate total balance
        double totalBalance = repo.findAll().stream()
            .mapToDouble(Account::getBalance)
            .sum();

        System.out.println("Total balance across all accounts: $" + totalBalance);

        System.out.println();
    }

    /**
     * Scenario 5: Product hierarchy with specific attributes
     */
    private static void demonstrateProductHierarchy() {
        System.out.println("--- Scenario 5: Product Hierarchy ---");

        ProductRepository repo = new ProductRepository();

        // Create different products
        Book book = new Book(1L, "Design Patterns", 49.99, 10,
            "978-0201633610", "Gang of Four", 395);
        Electronics laptop = new Electronics(2L, "MacBook Pro", 2499.99, 5,
            "Apple", "24 months", 90);
        Clothing shirt = new Clothing(3L, "T-Shirt", 19.99, 50,
            "M", "Blue", "Cotton");

        repo.save(book);
        repo.save(laptop);
        repo.save(shirt);

        System.out.println("Saved book, electronics, and clothing items");

        // Query products by type
        System.out.println("\nBooks in stock:");
        repo.findBooks().forEach(b ->
            System.out.println("  " + b.getName() + " by " + b.getAuthor()));

        System.out.println();
    }

    /**
     * Scenario 6: Polymorphic queries across hierarchy
     */
    private static void demonstratePolymorphicQueries() {
        System.out.println("--- Scenario 6: Polymorphic Queries ---");

        PersonRepository repo = new PersonRepository();

        // Query all persons (polymorphic)
        System.out.println("All persons in system:");
        repo.findAll().forEach(p ->
            System.out.println("  " + p.getClass().getSimpleName() + ": " + p.getName()));

        // Count by type
        long employeeCount = repo.findAll().stream()
            .filter(p -> p instanceof Employee)
            .count();
        long customerCount = repo.findAll().stream()
            .filter(p -> p instanceof Customer)
            .count();

        System.out.println("\nEmployees: " + employeeCount);
        System.out.println("Customers: " + customerCount);

        System.out.println();
    }

    /**
     * Scenario 7: Loading complete object with joins
     */
    private static void demonstrateCompleteObjectLoading() {
        System.out.println("--- Scenario 7: Complete Object Loading ---");

        System.out.println("SQL for loading Employee:");
        System.out.println("  SELECT p.*, e.*");
        System.out.println("  FROM persons p");
        System.out.println("  JOIN employees e ON p.person_id = e.employee_id");
        System.out.println("  WHERE p.person_id = ?");

        System.out.println("\nSQL for loading Customer:");
        System.out.println("  SELECT p.*, c.*");
        System.out.println("  FROM persons p");
        System.out.println("  JOIN customers c ON p.person_id = c.customer_id");
        System.out.println("  WHERE p.person_id = ?");

        System.out.println();
    }

    /**
     * Scenario 8: Multi-level inheritance (Manager extends Employee)
     */
    private static void demonstrateMultiLevelInheritance() {
        System.out.println("--- Scenario 8: Multi-Level Inheritance ---");

        System.out.println("Schema for 3-level hierarchy:");
        System.out.println("  persons -> employees -> managers");
        System.out.println();

        System.out.println("CREATE TABLE managers (");
        System.out.println("  manager_id BIGINT PRIMARY KEY REFERENCES employees(employee_id),");
        System.out.println("  team_size INT,");
        System.out.println("  budget DECIMAL(15,2)");
        System.out.println(");");

        System.out.println("\nLoading Manager requires 3-way join:");
        System.out.println("  SELECT p.*, e.*, m.*");
        System.out.println("  FROM persons p");
        System.out.println("  JOIN employees e ON p.person_id = e.employee_id");
        System.out.println("  JOIN managers m ON e.employee_id = m.manager_id");
        System.out.println("  WHERE p.person_id = ?");

        System.out.println();
    }

    /**
     * Scenario 9: ORM mapping configuration examples
     */
    private static void demonstrateORMConfiguration() {
        System.out.println("--- Scenario 9: ORM Configuration ---");

        System.out.println("JPA/Hibernate mapping:");
        System.out.println();
        System.out.println("@Entity");
        System.out.println("@Table(name = \"persons\")");
        System.out.println("@Inheritance(strategy = InheritanceType.JOINED)");
        System.out.println("public class Person {");
        System.out.println("    @Id");
        System.out.println("    private Long id;");
        System.out.println("    private String name;");
        System.out.println("}");
        System.out.println();
        System.out.println("@Entity");
        System.out.println("@Table(name = \"employees\")");
        System.out.println("@PrimaryKeyJoinColumn(name = \"employee_id\")");
        System.out.println("public class Employee extends Person {");
        System.out.println("    private String department;");
        System.out.println("    private Double salary;");
        System.out.println("}");

        System.out.println();
    }

    /**
     * Scenario 10: Performance analysis
     */
    private static void demonstratePerformanceConsiderations() {
        System.out.println("--- Scenario 10: Performance Considerations ---");

        System.out.println("Advantages:");
        System.out.println("  + No wasted space (no NULL columns)");
        System.out.println("  + Clear, normalized schema");
        System.out.println("  + Easy to add new subclasses");
        System.out.println("  + Supports referential integrity");

        System.out.println("\nDisadvantages:");
        System.out.println("  - Requires joins for every subclass query");
        System.out.println("  - Slower than Single Table Inheritance");
        System.out.println("  - More complex queries");
        System.out.println("  - Multiple tables to maintain");

        System.out.println("\nBest for:");
        System.out.println("  - Deep inheritance hierarchies");
        System.out.println("  - Subclasses with many unique fields");
        System.out.println("  - When storage efficiency matters");
        System.out.println("  - When schema clarity is important");

        System.out.println();
    }
}

// ============= Person Hierarchy =============

/**
 * Base class representing a person.
 * Mapped to persons table.
 */
abstract class Person {
    private Long id;
    private String name;
    private String email;

    public Person(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}

/**
 * Employee subclass.
 * Mapped to employees table with FK to persons.
 */
class Employee extends Person {
    private String department;
    private Double salary;
    private String hireDate;

    public Employee(Long id, String name, String email, String department,
                   Double salary, String hireDate) {
        super(id, name, email);
        this.department = department;
        this.salary = salary;
        this.hireDate = hireDate;
    }

    public String getDepartment() { return department; }
    public Double getSalary() { return salary; }
    public String getHireDate() { return hireDate; }
}

/**
 * Customer subclass.
 * Mapped to customers table with FK to persons.
 */
class Customer extends Person {
    private String customerNumber;
    private Double creditLimit;
    private String accountStatus;

    public Customer(Long id, String name, String email, String customerNumber,
                   Double creditLimit, String accountStatus) {
        super(id, name, email);
        this.customerNumber = customerNumber;
        this.creditLimit = creditLimit;
        this.accountStatus = accountStatus;
    }

    public String getCustomerNumber() { return customerNumber; }
    public Double getCreditLimit() { return creditLimit; }
    public String getAccountStatus() { return accountStatus; }
}

/**
 * Repository for Person hierarchy.
 * Demonstrates joins required for loading subclasses.
 */
class PersonRepository {
    private Map<Long, Person> storage = new HashMap<>();

    public void save(Person person) {
        storage.put(person.getId(), person);
    }

    public Person findById(Long id) {
        return storage.get(id);
    }

    public List<Person> findAll() {
        return new ArrayList<>(storage.values());
    }

    public List<Employee> findEmployeesByDepartment(String department) {
        return storage.values().stream()
            .filter(p -> p instanceof Employee)
            .map(p -> (Employee) p)
            .filter(e -> e.getDepartment().equals(department))
            .toList();
    }

    public List<Customer> findCustomersByStatus(String status) {
        return storage.values().stream()
            .filter(p -> p instanceof Customer)
            .map(p -> (Customer) p)
            .filter(c -> c.getAccountStatus().equals(status))
            .toList();
    }
}

// ============= Vehicle Hierarchy =============

abstract class Vehicle {
    private Long id;
    private String make;
    private String year;
    private Double price;

    public Vehicle(Long id, String make, String year, Double price) {
        this.id = id;
        this.make = make;
        this.year = year;
        this.price = price;
    }

    public Long getId() { return id; }
    public String getMake() { return make; }
    public String getYear() { return year; }
    public Double getPrice() { return price; }
}

class Car extends Vehicle {
    private Integer doors;
    private String bodyType;

    public Car(Long id, String make, String year, Double price,
               Integer doors, String bodyType) {
        super(id, make, year, price);
        this.doors = doors;
        this.bodyType = bodyType;
    }

    public Integer getDoors() { return doors; }
    public String getBodyType() { return bodyType; }
}

class Truck extends Vehicle {
    private Double payloadCapacity;
    private String truckType;

    public Truck(Long id, String make, String year, Double price,
                 Double payloadCapacity, String truckType) {
        super(id, make, year, price);
        this.payloadCapacity = payloadCapacity;
        this.truckType = truckType;
    }

    public Double getPayloadCapacity() { return payloadCapacity; }
    public String getTruckType() { return truckType; }
}

class Motorcycle extends Vehicle {
    private String style;
    private Integer engineCC;

    public Motorcycle(Long id, String make, String year, Double price,
                     String style, Integer engineCC) {
        super(id, make, year, price);
        this.style = style;
        this.engineCC = engineCC;
    }

    public String getStyle() { return style; }
    public Integer getEngineCC() { return engineCC; }
}

class VehicleRepository {
    private Map<Long, Vehicle> storage = new HashMap<>();

    public void save(Vehicle vehicle) {
        storage.put(vehicle.getId(), vehicle);
    }

    public List<Vehicle> findAll() {
        return new ArrayList<>(storage.values());
    }
}

// ============= Media Content Hierarchy =============

abstract class MediaContent {
    private Long id;
    private String title;
    private String format;
    private Long fileSize;

    public MediaContent(Long id, String title, String format, Long fileSize) {
        this.id = id;
        this.title = title;
        this.format = format;
        this.fileSize = fileSize;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getFormat() { return format; }
    public Long getFileSize() { return fileSize; }
}

class Video extends MediaContent {
    private String resolution;
    private Integer duration;

    public Video(Long id, String title, String format, Long fileSize,
                 String resolution, Integer duration) {
        super(id, title, format, fileSize);
        this.resolution = resolution;
        this.duration = duration;
    }

    public String getResolution() { return resolution; }
    public Integer getDuration() { return duration; }
}

class Audio extends MediaContent {
    private String bitrate;
    private Integer duration;

    public Audio(Long id, String title, String format, Long fileSize,
                 String bitrate, Integer duration) {
        super(id, title, format, fileSize);
        this.bitrate = bitrate;
        this.duration = duration;
    }

    public String getBitrate() { return bitrate; }
    public Integer getDuration() { return duration; }
}

class Document extends MediaContent {
    private Integer pageCount;
    private String paperSize;

    public Document(Long id, String title, String format, Long fileSize,
                   Integer pageCount, String paperSize) {
        super(id, title, format, fileSize);
        this.pageCount = pageCount;
        this.paperSize = paperSize;
    }

    public Integer getPageCount() { return pageCount; }
    public String getPaperSize() { return paperSize; }
}

class MediaRepository {
    private Map<Long, MediaContent> storage = new HashMap<>();

    public void save(MediaContent media) {
        storage.put(media.getId(), media);
    }

    public List<Video> findVideosByResolution(String resolution) {
        return storage.values().stream()
            .filter(m -> m instanceof Video)
            .map(m -> (Video) m)
            .filter(v -> v.getResolution().equals(resolution))
            .toList();
    }
}

// ============= Account Hierarchy =============

abstract class Account {
    private Long id;
    private String accountNumber;
    private Double balance;
    private String status;

    public Account(Long id, String accountNumber, Double balance, String status) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getAccountNumber() { return accountNumber; }
    public Double getBalance() { return balance; }
    public String getStatus() { return status; }
}

class CheckingAccount extends Account {
    private Double overdraftLimit;
    private Double monthlyFee;

    public CheckingAccount(Long id, String accountNumber, Double balance,
                          String status, Double overdraftLimit, Double monthlyFee) {
        super(id, accountNumber, balance, status);
        this.overdraftLimit = overdraftLimit;
        this.monthlyFee = monthlyFee;
    }

    public Double getOverdraftLimit() { return overdraftLimit; }
    public Double getMonthlyFee() { return monthlyFee; }
}

class SavingsAccount extends Account {
    private Double interestRate;
    private Integer withdrawalLimit;

    public SavingsAccount(Long id, String accountNumber, Double balance,
                         String status, Double interestRate, Integer withdrawalLimit) {
        super(id, accountNumber, balance, status);
        this.interestRate = interestRate;
        this.withdrawalLimit = withdrawalLimit;
    }

    public Double getInterestRate() { return interestRate; }
    public Integer getWithdrawalLimit() { return withdrawalLimit; }
}

class InvestmentAccount extends Account {
    private String riskProfile;
    private Double expectedReturn;

    public InvestmentAccount(Long id, String accountNumber, Double balance,
                            String status, String riskProfile, Double expectedReturn) {
        super(id, accountNumber, balance, status);
        this.riskProfile = riskProfile;
        this.expectedReturn = expectedReturn;
    }

    public String getRiskProfile() { return riskProfile; }
    public Double getExpectedReturn() { return expectedReturn; }
}

class AccountRepository {
    private Map<Long, Account> storage = new HashMap<>();

    public void save(Account account) {
        storage.put(account.getId(), account);
    }

    public List<Account> findAll() {
        return new ArrayList<>(storage.values());
    }
}

// ============= Product Hierarchy =============

abstract class Product {
    private Long id;
    private String name;
    private Double price;
    private Integer stockQuantity;

    public Product(Long id, String name, Double price, Integer stockQuantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stockQuantity = stockQuantity;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Double getPrice() { return price; }
    public Integer getStockQuantity() { return stockQuantity; }
}

class Book extends Product {
    private String isbn;
    private String author;
    private Integer pages;

    public Book(Long id, String name, Double price, Integer stockQuantity,
                String isbn, String author, Integer pages) {
        super(id, name, price, stockQuantity);
        this.isbn = isbn;
        this.author = author;
        this.pages = pages;
    }

    public String getIsbn() { return isbn; }
    public String getAuthor() { return author; }
    public Integer getPages() { return pages; }
}

class Electronics extends Product {
    private String manufacturer;
    private String warranty;
    private Integer warrantyDays;

    public Electronics(Long id, String name, Double price, Integer stockQuantity,
                      String manufacturer, String warranty, Integer warrantyDays) {
        super(id, name, price, stockQuantity);
        this.manufacturer = manufacturer;
        this.warranty = warranty;
        this.warrantyDays = warrantyDays;
    }

    public String getManufacturer() { return manufacturer; }
    public String getWarranty() { return warranty; }
    public Integer getWarrantyDays() { return warrantyDays; }
}

class Clothing extends Product {
    private String size;
    private String color;
    private String material;

    public Clothing(Long id, String name, Double price, Integer stockQuantity,
                   String size, String color, String material) {
        super(id, name, price, stockQuantity);
        this.size = size;
        this.color = color;
        this.material = material;
    }

    public String getSize() { return size; }
    public String getColor() { return color; }
    public String getMaterial() { return material; }
}

class ProductRepository {
    private Map<Long, Product> storage = new HashMap<>();

    public void save(Product product) {
        storage.put(product.getId(), product);
    }

    public List<Book> findBooks() {
        return storage.values().stream()
            .filter(p -> p instanceof Book)
            .map(p -> (Book) p)
            .toList();
    }
}
