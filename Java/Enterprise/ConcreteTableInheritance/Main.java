package Enterprise.ConcreteTableInheritance;

import java.util.*;

/**
 * Concrete Table Inheritance Pattern Demonstration
 *
 * Intent: Maps each concrete class in an inheritance hierarchy to its own table,
 * with each table containing ALL columns (both inherited and class-specific).
 * Abstract classes have no corresponding tables.
 *
 * Key Concepts:
 * - One table per concrete class only
 * - Each table is self-contained with all fields
 * - Duplicate columns for inherited fields
 * - No joins needed to load objects
 * - Fast queries for individual concrete types
 * - Difficult polymorphic queries
 *
 * Advantages:
 * - No joins required for loading
 * - Fast queries for specific types
 * - Each concrete class is independent
 * - Simple to understand per table
 *
 * Disadvantages:
 * - Duplicate columns across tables
 * - Polymorphic queries are complex
 * - Changes to superclass require updates to all tables
 * - Data redundancy
 * - Difficult to enforce integrity across hierarchy
 *
 * Real-world examples:
 * - Payment methods (CreditCard, PayPal, BankTransfer)
 * - Notifications (Email, SMS, Push)
 * - Reports (SalesReport, InventoryReport, CustomerReport)
 * - Shipment methods (Ground, Air, Sea)
 * - User types in multi-tenant systems
 *
 * Database Schema Examples:
 *
 * -- No table for abstract Person class
 *
 * -- Each concrete class has ALL fields (inherited + own)
 * CREATE TABLE employees (
 *     employee_id BIGINT PRIMARY KEY,
 *     name VARCHAR(255) NOT NULL,         -- inherited from Person
 *     email VARCHAR(255),                 -- inherited from Person
 *     created_at TIMESTAMP,               -- inherited from Person
 *     department VARCHAR(100),            -- specific to Employee
 *     salary DECIMAL(15,2),               -- specific to Employee
 *     hire_date DATE                      -- specific to Employee
 * );
 *
 * CREATE TABLE customers (
 *     customer_id BIGINT PRIMARY KEY,
 *     name VARCHAR(255) NOT NULL,         -- inherited from Person
 *     email VARCHAR(255),                 -- inherited from Person
 *     created_at TIMESTAMP,               -- inherited from Person
 *     customer_number VARCHAR(50),        -- specific to Customer
 *     credit_limit DECIMAL(15,2),         -- specific to Customer
 *     account_status VARCHAR(20)          -- specific to Customer
 * );
 *
 * -- Polymorphic query requires UNION:
 * SELECT employee_id as id, name, email, 'EMPLOYEE' as type FROM employees
 * UNION ALL
 * SELECT customer_id as id, name, email, 'CUSTOMER' as type FROM customers;
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Concrete Table Inheritance Pattern Demo ===\n");

        // Scenario 1: Person Hierarchy (Employee, Customer)
        demonstratePersonHierarchy();

        // Scenario 2: Payment Methods
        demonstratePaymentMethods();

        // Scenario 3: Notification System
        demonstrateNotificationSystem();

        // Scenario 4: Report Generation
        demonstrateReportGeneration();

        // Scenario 5: Shipment Methods
        demonstrateShipmentMethods();

        // Scenario 6: Polymorphic Queries with UNION
        demonstratePolymorphicQueries();

        // Scenario 7: Schema Evolution Challenges
        demonstrateSchemaEvolution();

        // Scenario 8: Performance Benefits
        demonstratePerformanceBenefits();

        // Scenario 9: ORM Configuration
        demonstrateORMConfiguration();

        // Scenario 10: When to Use This Pattern
        demonstrateUsageGuidelines();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Person hierarchy with separate tables for each concrete type
     */
    private static void demonstratePersonHierarchy() {
        System.out.println("--- Scenario 1: Person Hierarchy ---");

        ConcretePersonRepository repo = new ConcretePersonRepository();

        // Create employees
        ConcreteEmployee emp1 = new ConcreteEmployee(1L, "Alice Johnson",
            "alice@company.com", "Engineering", 95000.0, "2020-01-15");
        ConcreteEmployee emp2 = new ConcreteEmployee(2L, "Bob Smith",
            "bob@company.com", "Sales", 75000.0, "2019-06-01");

        // Create customers
        ConcreteCustomer cust1 = new ConcreteCustomer(3L, "Carol Williams",
            "carol@example.com", "CUST-1001", 10000.0, "ACTIVE");
        ConcreteCustomer cust2 = new ConcreteCustomer(4L, "Dave Brown",
            "dave@example.com", "CUST-1002", 5000.0, "ACTIVE");

        repo.saveEmployee(emp1);
        repo.saveEmployee(emp2);
        repo.saveCustomer(cust1);
        repo.saveCustomer(cust2);

        System.out.println("Saved 2 employees and 2 customers");

        // Query specific types (fast, no joins)
        System.out.println("\nEmployees in Engineering:");
        repo.findEmployeesByDepartment("Engineering").forEach(e ->
            System.out.println("  " + e.getName() + " - $" + e.getSalary()));

        System.out.println("\nActive customers:");
        repo.findCustomersByStatus("ACTIVE").forEach(c ->
            System.out.println("  " + c.getName() + " - Credit: $" + c.getCreditLimit()));

        System.out.println();
    }

    /**
     * Scenario 2: Payment methods with different implementations
     */
    private static void demonstratePaymentMethods() {
        System.out.println("--- Scenario 2: Payment Methods ---");

        PaymentRepository repo = new PaymentRepository();

        // Different payment types
        CreditCardPayment cc = new CreditCardPayment(1L, 150.00, "COMPLETED",
            "2024-10-14", "****1234", "Visa", "12/25");
        PayPalPayment pp = new PayPalPayment(2L, 75.50, "COMPLETED",
            "2024-10-14", "user@paypal.com", "TR-12345");
        BankTransferPayment bt = new BankTransferPayment(3L, 500.00, "PENDING",
            "2024-10-14", "123456789", "SWIFT123", "Bank of America");

        repo.saveCreditCard(cc);
        repo.savePayPal(pp);
        repo.saveBankTransfer(bt);

        System.out.println("Saved 3 different payment types");

        // Query by specific type (no joins needed)
        System.out.println("\nCredit card payments:");
        repo.findAllCreditCards().forEach(payment ->
            System.out.println("  " + payment.getCardType() + " ending in " +
                payment.getCardNumber() + " - $" + payment.getAmount()));

        System.out.println();
    }

    /**
     * Scenario 3: Notification system with multiple delivery methods
     */
    private static void demonstrateNotificationSystem() {
        System.out.println("--- Scenario 3: Notification System ---");

        NotificationRepository repo = new NotificationRepository();

        // Create different notification types
        EmailNotification email = new EmailNotification(1L, "Welcome",
            "Welcome to our service", "SENT", "user@example.com",
            "noreply@company.com", "Plain Text");
        SMSNotification sms = new SMSNotification(2L, "Verification",
            "Your code is 123456", "SENT", "+1234567890",
            "Company", 160);
        PushNotification push = new PushNotification(3L, "New Message",
            "You have a new message", "DELIVERED", "device-token-123",
            "iOS", "High");

        repo.saveEmail(email);
        repo.saveSMS(sms);
        repo.savePush(push);

        System.out.println("Sent email, SMS, and push notifications");

        // Query specific type
        System.out.println("\nEmail notifications:");
        repo.findAllEmails().forEach(n ->
            System.out.println("  " + n.getSubject() + " to " + n.getRecipientEmail()));

        System.out.println();
    }

    /**
     * Scenario 4: Report generation with different report types
     */
    private static void demonstrateReportGeneration() {
        System.out.println("--- Scenario 4: Report Generation ---");

        ReportRepository repo = new ReportRepository();

        // Create different reports
        SalesReport sales = new SalesReport(1L, "Q4 Sales",
            "2024-10-14", "PDF", "Monthly", 125000.0, 450);
        InventoryReport inventory = new InventoryReport(2L, "Current Stock",
            "2024-10-14", "Excel", "Daily", 1250, 45);
        CustomerReport customer = new CustomerReport(3L, "New Customers",
            "2024-10-14", "CSV", "Weekly", 89, "Active");

        repo.saveSalesReport(sales);
        repo.saveInventoryReport(inventory);
        repo.saveCustomerReport(customer);

        System.out.println("Generated 3 types of reports");

        // Query by type (efficient, single table)
        System.out.println("\nSales reports:");
        repo.findAllSalesReports().forEach(r ->
            System.out.println("  " + r.getTitle() + " - Revenue: $" +
                r.getTotalRevenue()));

        System.out.println();
    }

    /**
     * Scenario 5: Shipment methods with different carriers
     */
    private static void demonstrateShipmentMethods() {
        System.out.println("--- Scenario 5: Shipment Methods ---");

        ShipmentRepository repo = new ShipmentRepository();

        // Different shipment types
        GroundShipment ground = new GroundShipment(1L, "New York",
            "Los Angeles", "IN_TRANSIT", 15.5, "Standard Ground", 5);
        AirShipment air = new AirShipment(2L, "Chicago",
            "Miami", "DELIVERED", 45.0, "AA1234", "O'Hare");
        SeaShipment sea = new SeaShipment(3L, "Shanghai",
            "San Francisco", "IN_TRANSIT", 1200.0, "CONT-123", "Cargo Ship");

        repo.saveGround(ground);
        repo.saveAir(air);
        repo.saveSea(sea);

        System.out.println("Created ground, air, and sea shipments");

        // Efficient single-table queries
        System.out.println("\nAir shipments:");
        repo.findAllAir().forEach(s ->
            System.out.println("  Flight " + s.getFlightNumber() + ": " +
                s.getOrigin() + " to " + s.getDestination()));

        System.out.println();
    }

    /**
     * Scenario 6: Complex polymorphic queries requiring UNION
     */
    private static void demonstratePolymorphicQueries() {
        System.out.println("--- Scenario 6: Polymorphic Queries ---");

        System.out.println("Polymorphic query (all persons) requires UNION:");
        System.out.println();
        System.out.println("SELECT employee_id as id, name, email, 'EMPLOYEE' as type");
        System.out.println("FROM employees");
        System.out.println("UNION ALL");
        System.out.println("SELECT customer_id as id, name, email, 'CUSTOMER' as type");
        System.out.println("FROM customers");
        System.out.println("ORDER BY name;");

        System.out.println("\nNote: UNION queries can be complex and slower");
        System.out.println("than single-table queries.");

        System.out.println();
    }

    /**
     * Scenario 7: Challenges when evolving the schema
     */
    private static void demonstrateSchemaEvolution() {
        System.out.println("--- Scenario 7: Schema Evolution Challenges ---");

        System.out.println("Adding a field to base class requires updating ALL tables:");
        System.out.println();
        System.out.println("-- Need to add 'phone' field to Person");
        System.out.println("ALTER TABLE employees ADD COLUMN phone VARCHAR(20);");
        System.out.println("ALTER TABLE customers ADD COLUMN phone VARCHAR(20);");
        System.out.println();
        System.out.println("Every concrete table must be updated!");

        System.out.println("\nRenaming a base class field:");
        System.out.println("ALTER TABLE employees RENAME COLUMN email TO email_address;");
        System.out.println("ALTER TABLE customers RENAME COLUMN email TO email_address;");
        System.out.println();
        System.out.println("Maintenance overhead increases with more concrete classes.");

        System.out.println();
    }

    /**
     * Scenario 8: Performance benefits of this pattern
     */
    private static void demonstratePerformanceBenefits() {
        System.out.println("--- Scenario 8: Performance Benefits ---");

        System.out.println("Query for specific type (FAST - single table, no joins):");
        System.out.println("  SELECT * FROM employees WHERE department = 'Engineering';");
        System.out.println();

        System.out.println("Compare to Class Table Inheritance (requires join):");
        System.out.println("  SELECT p.*, e.*");
        System.out.println("  FROM persons p");
        System.out.println("  JOIN employees e ON p.person_id = e.employee_id");
        System.out.println("  WHERE e.department = 'Engineering';");
        System.out.println();

        System.out.println("Concrete Table Inheritance advantages:");
        System.out.println("  + No joins = faster queries");
        System.out.println("  + Simple indexes per table");
        System.out.println("  + Independent table optimization");
        System.out.println("  + Better query plan caching");

        System.out.println();
    }

    /**
     * Scenario 9: ORM configuration examples
     */
    private static void demonstrateORMConfiguration() {
        System.out.println("--- Scenario 9: ORM Configuration ---");

        System.out.println("JPA/Hibernate mapping:");
        System.out.println();
        System.out.println("@Entity");
        System.out.println("@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)");
        System.out.println("public abstract class Person {");
        System.out.println("    @Id");
        System.out.println("    private Long id;");
        System.out.println("    private String name;");
        System.out.println("    private String email;");
        System.out.println("}");
        System.out.println();
        System.out.println("@Entity");
        System.out.println("@Table(name = \"employees\")");
        System.out.println("public class Employee extends Person {");
        System.out.println("    private String department;");
        System.out.println("    private Double salary;");
        System.out.println("}");
        System.out.println();
        System.out.println("@Entity");
        System.out.println("@Table(name = \"customers\")");
        System.out.println("public class Customer extends Person {");
        System.out.println("    private String customerNumber;");
        System.out.println("    private Double creditLimit;");
        System.out.println("}");

        System.out.println();
    }

    /**
     * Scenario 10: Guidelines for when to use this pattern
     */
    private static void demonstrateUsageGuidelines() {
        System.out.println("--- Scenario 10: Usage Guidelines ---");

        System.out.println("Use Concrete Table Inheritance when:");
        System.out.println("  + Queries usually target specific concrete types");
        System.out.println("  + Performance is critical (no joins needed)");
        System.out.println("  + Concrete classes have very different attributes");
        System.out.println("  + Polymorphic queries are rare");
        System.out.println("  + Each concrete type is largely independent");

        System.out.println("\nAvoid Concrete Table Inheritance when:");
        System.out.println("  - Frequent polymorphic queries across all types");
        System.out.println("  - Base class changes frequently");
        System.out.println("  - Need referential integrity across hierarchy");
        System.out.println("  - Many concrete classes (maintenance burden)");
        System.out.println("  - Shared columns need consistency guarantees");

        System.out.println("\nBest alternatives:");
        System.out.println("  - Single Table Inheritance: If polymorphic queries common");
        System.out.println("  - Class Table Inheritance: If schema clarity matters");
        System.out.println("  - Separate hierarchies: If classes truly independent");

        System.out.println();
    }
}

// ============= Abstract Base Classes (No Tables) =============

/**
 * Abstract Person class - NO corresponding table in database.
 * Fields are duplicated in each concrete class table.
 */
abstract class ConcretePerson {
    private Long id;
    private String name;
    private String email;

    public ConcretePerson(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}

/**
 * Concrete Employee - Has its own table with ALL fields (inherited + own).
 * employees table: id, name, email, department, salary, hire_date
 */
class ConcreteEmployee extends ConcretePerson {
    private String department;
    private Double salary;
    private String hireDate;

    public ConcreteEmployee(Long id, String name, String email, String department,
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
 * Concrete Customer - Has its own table with ALL fields (inherited + own).
 * customers table: id, name, email, customer_number, credit_limit, status
 */
class ConcreteCustomer extends ConcretePerson {
    private String customerNumber;
    private Double creditLimit;
    private String accountStatus;

    public ConcreteCustomer(Long id, String name, String email, String customerNumber,
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
 * Repository with separate storage for each concrete type.
 * Simulates separate database tables.
 */
class ConcretePersonRepository {
    private Map<Long, ConcreteEmployee> employees = new HashMap<>();
    private Map<Long, ConcreteCustomer> customers = new HashMap<>();

    public void saveEmployee(ConcreteEmployee employee) {
        employees.put(employee.getId(), employee);
    }

    public void saveCustomer(ConcreteCustomer customer) {
        customers.put(customer.getId(), customer);
    }

    public List<ConcreteEmployee> findEmployeesByDepartment(String department) {
        return employees.values().stream()
            .filter(e -> e.getDepartment().equals(department))
            .toList();
    }

    public List<ConcreteCustomer> findCustomersByStatus(String status) {
        return customers.values().stream()
            .filter(c -> c.getAccountStatus().equals(status))
            .toList();
    }

    // Polymorphic query requires combining results from both storages
    public List<ConcretePerson> findAllPersons() {
        List<ConcretePerson> all = new ArrayList<>();
        all.addAll(employees.values());
        all.addAll(customers.values());
        return all;
    }
}

// ============= Payment Methods =============

abstract class Payment {
    private Long id;
    private Double amount;
    private String status;
    private String paymentDate;

    public Payment(Long id, Double amount, String status, String paymentDate) {
        this.id = id;
        this.amount = amount;
        this.status = status;
        this.paymentDate = paymentDate;
    }

    public Long getId() { return id; }
    public Double getAmount() { return amount; }
    public String getStatus() { return status; }
    public String getPaymentDate() { return paymentDate; }
}

class CreditCardPayment extends Payment {
    private String cardNumber;
    private String cardType;
    private String expiryDate;

    public CreditCardPayment(Long id, Double amount, String status, String paymentDate,
                            String cardNumber, String cardType, String expiryDate) {
        super(id, amount, status, paymentDate);
        this.cardNumber = cardNumber;
        this.cardType = cardType;
        this.expiryDate = expiryDate;
    }

    public String getCardNumber() { return cardNumber; }
    public String getCardType() { return cardType; }
    public String getExpiryDate() { return expiryDate; }
}

class PayPalPayment extends Payment {
    private String paypalEmail;
    private String transactionId;

    public PayPalPayment(Long id, Double amount, String status, String paymentDate,
                        String paypalEmail, String transactionId) {
        super(id, amount, status, paymentDate);
        this.paypalEmail = paypalEmail;
        this.transactionId = transactionId;
    }

    public String getPaypalEmail() { return paypalEmail; }
    public String getTransactionId() { return transactionId; }
}

class BankTransferPayment extends Payment {
    private String accountNumber;
    private String swiftCode;
    private String bankName;

    public BankTransferPayment(Long id, Double amount, String status, String paymentDate,
                              String accountNumber, String swiftCode, String bankName) {
        super(id, amount, status, paymentDate);
        this.accountNumber = accountNumber;
        this.swiftCode = swiftCode;
        this.bankName = bankName;
    }

    public String getAccountNumber() { return accountNumber; }
    public String getSwiftCode() { return swiftCode; }
    public String getBankName() { return bankName; }
}

class PaymentRepository {
    private Map<Long, CreditCardPayment> creditCards = new HashMap<>();
    private Map<Long, PayPalPayment> paypal = new HashMap<>();
    private Map<Long, BankTransferPayment> bankTransfers = new HashMap<>();

    public void saveCreditCard(CreditCardPayment payment) {
        creditCards.put(payment.getId(), payment);
    }

    public void savePayPal(PayPalPayment payment) {
        paypal.put(payment.getId(), payment);
    }

    public void saveBankTransfer(BankTransferPayment payment) {
        bankTransfers.put(payment.getId(), payment);
    }

    public List<CreditCardPayment> findAllCreditCards() {
        return new ArrayList<>(creditCards.values());
    }
}

// ============= Notification System =============

abstract class Notification {
    private Long id;
    private String subject;
    private String message;
    private String status;

    public Notification(Long id, String subject, String message, String status) {
        this.id = id;
        this.subject = subject;
        this.message = message;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getSubject() { return subject; }
    public String getMessage() { return message; }
    public String getStatus() { return status; }
}

class EmailNotification extends Notification {
    private String recipientEmail;
    private String senderEmail;
    private String emailFormat;

    public EmailNotification(Long id, String subject, String message, String status,
                            String recipientEmail, String senderEmail, String emailFormat) {
        super(id, subject, message, status);
        this.recipientEmail = recipientEmail;
        this.senderEmail = senderEmail;
        this.emailFormat = emailFormat;
    }

    public String getRecipientEmail() { return recipientEmail; }
    public String getSenderEmail() { return senderEmail; }
    public String getEmailFormat() { return emailFormat; }
}

class SMSNotification extends Notification {
    private String phoneNumber;
    private String carrier;
    private Integer characterCount;

    public SMSNotification(Long id, String subject, String message, String status,
                          String phoneNumber, String carrier, Integer characterCount) {
        super(id, subject, message, status);
        this.phoneNumber = phoneNumber;
        this.carrier = carrier;
        this.characterCount = characterCount;
    }

    public String getPhoneNumber() { return phoneNumber; }
    public String getCarrier() { return carrier; }
    public Integer getCharacterCount() { return characterCount; }
}

class PushNotification extends Notification {
    private String deviceToken;
    private String platform;
    private String priority;

    public PushNotification(Long id, String subject, String message, String status,
                           String deviceToken, String platform, String priority) {
        super(id, subject, message, status);
        this.deviceToken = deviceToken;
        this.platform = platform;
        this.priority = priority;
    }

    public String getDeviceToken() { return deviceToken; }
    public String getPlatform() { return platform; }
    public String getPriority() { return priority; }
}

class NotificationRepository {
    private Map<Long, EmailNotification> emails = new HashMap<>();
    private Map<Long, SMSNotification> sms = new HashMap<>();
    private Map<Long, PushNotification> push = new HashMap<>();

    public void saveEmail(EmailNotification notification) {
        emails.put(notification.getId(), notification);
    }

    public void saveSMS(SMSNotification notification) {
        sms.put(notification.getId(), notification);
    }

    public void savePush(PushNotification notification) {
        push.put(notification.getId(), notification);
    }

    public List<EmailNotification> findAllEmails() {
        return new ArrayList<>(emails.values());
    }
}

// ============= Report System =============

abstract class Report {
    private Long id;
    private String title;
    private String generatedDate;
    private String format;
    private String frequency;

    public Report(Long id, String title, String generatedDate, String format, String frequency) {
        this.id = id;
        this.title = title;
        this.generatedDate = generatedDate;
        this.format = format;
        this.frequency = frequency;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getGeneratedDate() { return generatedDate; }
    public String getFormat() { return format; }
    public String getFrequency() { return frequency; }
}

class SalesReport extends Report {
    private Double totalRevenue;
    private Integer transactionCount;

    public SalesReport(Long id, String title, String generatedDate, String format,
                      String frequency, Double totalRevenue, Integer transactionCount) {
        super(id, title, generatedDate, format, frequency);
        this.totalRevenue = totalRevenue;
        this.transactionCount = transactionCount;
    }

    public Double getTotalRevenue() { return totalRevenue; }
    public Integer getTransactionCount() { return transactionCount; }
}

class InventoryReport extends Report {
    private Integer totalItems;
    private Integer lowStockItems;

    public InventoryReport(Long id, String title, String generatedDate, String format,
                          String frequency, Integer totalItems, Integer lowStockItems) {
        super(id, title, generatedDate, format, frequency);
        this.totalItems = totalItems;
        this.lowStockItems = lowStockItems;
    }

    public Integer getTotalItems() { return totalItems; }
    public Integer getLowStockItems() { return lowStockItems; }
}

class CustomerReport extends Report {
    private Integer newCustomers;
    private String segment;

    public CustomerReport(Long id, String title, String generatedDate, String format,
                         String frequency, Integer newCustomers, String segment) {
        super(id, title, generatedDate, format, frequency);
        this.newCustomers = newCustomers;
        this.segment = segment;
    }

    public Integer getNewCustomers() { return newCustomers; }
    public String getSegment() { return segment; }
}

class ReportRepository {
    private Map<Long, SalesReport> salesReports = new HashMap<>();
    private Map<Long, InventoryReport> inventoryReports = new HashMap<>();
    private Map<Long, CustomerReport> customerReports = new HashMap<>();

    public void saveSalesReport(SalesReport report) {
        salesReports.put(report.getId(), report);
    }

    public void saveInventoryReport(InventoryReport report) {
        inventoryReports.put(report.getId(), report);
    }

    public void saveCustomerReport(CustomerReport report) {
        customerReports.put(report.getId(), report);
    }

    public List<SalesReport> findAllSalesReports() {
        return new ArrayList<>(salesReports.values());
    }
}

// ============= Shipment System =============

abstract class Shipment {
    private Long id;
    private String origin;
    private String destination;
    private String status;
    private Double weight;

    public Shipment(Long id, String origin, String destination, String status, Double weight) {
        this.id = id;
        this.origin = origin;
        this.destination = destination;
        this.status = status;
        this.weight = weight;
    }

    public Long getId() { return id; }
    public String getOrigin() { return origin; }
    public String getDestination() { return destination; }
    public String getStatus() { return status; }
    public Double getWeight() { return weight; }
}

class GroundShipment extends Shipment {
    private String deliveryType;
    private Integer estimatedDays;

    public GroundShipment(Long id, String origin, String destination, String status,
                         Double weight, String deliveryType, Integer estimatedDays) {
        super(id, origin, destination, status, weight);
        this.deliveryType = deliveryType;
        this.estimatedDays = estimatedDays;
    }

    public String getDeliveryType() { return deliveryType; }
    public Integer getEstimatedDays() { return estimatedDays; }
}

class AirShipment extends Shipment {
    private String flightNumber;
    private String airport;

    public AirShipment(Long id, String origin, String destination, String status,
                      Double weight, String flightNumber, String airport) {
        super(id, origin, destination, status, weight);
        this.flightNumber = flightNumber;
        this.airport = airport;
    }

    public String getFlightNumber() { return flightNumber; }
    public String getAirport() { return airport; }
}

class SeaShipment extends Shipment {
    private String containerNumber;
    private String vesselName;

    public SeaShipment(Long id, String origin, String destination, String status,
                      Double weight, String containerNumber, String vesselName) {
        super(id, origin, destination, status, weight);
        this.containerNumber = containerNumber;
        this.vesselName = vesselName;
    }

    public String getContainerNumber() { return containerNumber; }
    public String getVesselName() { return vesselName; }
}

class ShipmentRepository {
    private Map<Long, GroundShipment> ground = new HashMap<>();
    private Map<Long, AirShipment> air = new HashMap<>();
    private Map<Long, SeaShipment> sea = new HashMap<>();

    public void saveGround(GroundShipment shipment) {
        ground.put(shipment.getId(), shipment);
    }

    public void saveAir(AirShipment shipment) {
        air.put(shipment.getId(), shipment);
    }

    public void saveSea(SeaShipment shipment) {
        sea.put(shipment.getId(), shipment);
    }

    public List<AirShipment> findAllAir() {
        return new ArrayList<>(air.values());
    }
}
