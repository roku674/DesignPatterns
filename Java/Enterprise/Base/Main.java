package Enterprise.Base;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Demonstrates the Base Patterns for Enterprise Applications.
 * Base patterns provide common infrastructure used across multiple patterns.
 *
 * Key Base Patterns:
 * - Gateway: Object that encapsulates access to an external system
 * - Mapper: Base class for data mapping operations
 * - Layer Supertype: Base class for all types in a layer
 * - Registry: Well-known object that other objects can use to find services
 * - Value Object: Small object representing a simple value
 * - Money: Represents monetary values with currency
 * - Special Case: Subclass providing special behavior for particular cases
 * - Plugin: Links classes during configuration rather than compilation
 * - Service Stub: Removes dependence on services during testing
 * - Record Set: In-memory representation of tabular data
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Base Patterns Demo ===\n");

        // 1. Layer Supertype Pattern
        demonstrateLayerSupertype();

        // 2. Registry Pattern
        demonstrateRegistry();

        // 3. Value Object Pattern
        demonstrateValueObject();

        // 4. Money Pattern
        demonstrateMoneyPattern();

        // 5. Special Case Pattern
        demonstrateSpecialCase();

        // 6. Plugin Pattern
        demonstratePlugin();

        // 7. Gateway Pattern
        demonstrateGateway();

        System.out.println("\n=== All Base Patterns Demonstrated ===");
    }

    private static void demonstrateLayerSupertype() {
        System.out.println("--- Layer Supertype Pattern ---");
        System.out.println("Purpose: Base class for all domain objects in a layer\n");

        Product product = new Product("Laptop", 999.99);
        Customer customer = new Customer("John Doe", "john@example.com");

        System.out.println("Created entities:");
        System.out.println("  " + product);
        System.out.println("  " + customer);
        System.out.println("Both inherit common behavior from DomainObject base class");
        System.out.println();
    }

    private static void demonstrateRegistry() {
        System.out.println("--- Registry Pattern ---");
        System.out.println("Purpose: Central location to find common objects and services\n");

        ApplicationRegistry registry = ApplicationRegistry.getInstance();

        // Register services
        DatabaseConnection db = new DatabaseConnection("jdbc:postgresql://localhost/mydb");
        registry.registerService("database", db);
        registry.registerService("config", new ConfigurationService());

        System.out.println("Registered services:");
        System.out.println("  - database: " + registry.getService("database").getClass().getSimpleName());
        System.out.println("  - config: " + registry.getService("config").getClass().getSimpleName());
        System.out.println();
    }

    private static void demonstrateValueObject() {
        System.out.println("--- Value Object Pattern ---");
        System.out.println("Purpose: Small immutable object representing a simple value\n");

        Address address1 = new Address("123 Main St", "Springfield", "IL", "62701");
        Address address2 = new Address("123 Main St", "Springfield", "IL", "62701");
        Address address3 = new Address("456 Oak Ave", "Chicago", "IL", "60601");

        System.out.println("Address 1: " + address1);
        System.out.println("Address 2: " + address2);
        System.out.println("Address 3: " + address3);
        System.out.println("\nAddress 1 equals Address 2: " + address1.equals(address2));
        System.out.println("Address 1 equals Address 3: " + address1.equals(address3));
        System.out.println("Value objects are compared by value, not identity");
        System.out.println();
    }

    private static void demonstrateMoneyPattern() {
        System.out.println("--- Money Pattern ---");
        System.out.println("Purpose: Represents monetary values with proper currency handling\n");

        Money price1 = new Money(100.50, Currency.USD);
        Money price2 = new Money(50.25, Currency.USD);
        Money euroPrice = new Money(85.00, Currency.EUR);

        System.out.println("Price 1: " + price1);
        System.out.println("Price 2: " + price2);
        System.out.println("Sum: " + price1.add(price2));
        System.out.println("Difference: " + price1.subtract(price2));
        System.out.println("Euro Price: " + euroPrice);

        try {
            price1.add(euroPrice);
        } catch (IllegalArgumentException e) {
            System.out.println("Cannot add different currencies: " + e.getMessage());
        }
        System.out.println();
    }

    private static void demonstrateSpecialCase() {
        System.out.println("--- Special Case Pattern ---");
        System.out.println("Purpose: Provides special behavior for null/missing cases\n");

        CustomerAccount normalCustomer = new RealCustomerAccount("John", 1000.0);
        CustomerAccount unknownCustomer = CustomerAccount.createUnknownCustomer();
        CustomerAccount blockedCustomer = CustomerAccount.createBlockedCustomer();

        System.out.println("Normal customer purchases:");
        System.out.println("  Can purchase: " + normalCustomer.canPurchase());
        System.out.println("  Discount: " + normalCustomer.getDiscount() + "%");

        System.out.println("\nUnknown customer purchases:");
        System.out.println("  Can purchase: " + unknownCustomer.canPurchase());
        System.out.println("  Discount: " + unknownCustomer.getDiscount() + "%");

        System.out.println("\nBlocked customer purchases:");
        System.out.println("  Can purchase: " + blockedCustomer.canPurchase());
        System.out.println("  Discount: " + blockedCustomer.getDiscount() + "%");
        System.out.println();
    }

    private static void demonstratePlugin() {
        System.out.println("--- Plugin Pattern ---");
        System.out.println("Purpose: Links classes during configuration rather than compilation\n");

        TaxCalculatorFactory factory = new TaxCalculatorFactory();

        TaxCalculator usTax = factory.getCalculator("US");
        TaxCalculator euTax = factory.getCalculator("EU");
        TaxCalculator asiaTax = factory.getCalculator("ASIA");

        double amount = 100.0;
        System.out.println("Tax on $" + amount + ":");
        System.out.println("  US: $" + usTax.calculateTax(amount));
        System.out.println("  EU: $" + euTax.calculateTax(amount));
        System.out.println("  ASIA: $" + asiaTax.calculateTax(amount));
        System.out.println();
    }

    private static void demonstrateGateway() {
        System.out.println("--- Gateway Pattern ---");
        System.out.println("Purpose: Encapsulates access to external system or resource\n");

        EmailGateway emailGateway = new SmtpEmailGateway("smtp.example.com", 587);

        System.out.println("Sending emails through gateway:");
        emailGateway.sendEmail("john@example.com", "Welcome", "Welcome to our service!");
        emailGateway.sendEmail("jane@example.com", "Alert", "Your order has shipped");

        System.out.println("Gateway provides simple interface to complex external system");
        System.out.println();
    }
}
