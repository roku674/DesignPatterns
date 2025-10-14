package Enterprise.DataSource;

import java.util.List;
import java.util.Optional;

/**
 * Demonstrates Data Source Architectural Patterns.
 *
 * Data Source patterns provide abstraction layer between business logic and data storage.
 * Key patterns:
 * - Table Data Gateway: Gateway to a database table with methods for CRUD operations
 * - Row Data Gateway: Object representing a single row in a database table
 * - Active Record: Domain object with data access methods
 * - Data Mapper: Layer that moves data between objects and database independently
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Data Source Patterns Demo ===\n");

        // 1. Table Data Gateway
        demonstrateTableDataGateway();

        // 2. Row Data Gateway
        demonstrateRowDataGateway();

        // 3. Active Record
        demonstrateActiveRecord();

        // 4. Data Mapper
        demonstrateDataMapper();

        System.out.println("\n=== All Data Source Patterns Demonstrated ===");
    }

    private static void demonstrateTableDataGateway() {
        System.out.println("--- Table Data Gateway Pattern ---");
        System.out.println("Purpose: Gateway to a database table\n");

        PersonGateway gateway = new PersonGateway();

        // Insert records
        System.out.println("Inserting persons:");
        Long id1 = gateway.insert("John Doe", "john@example.com", 30);
        Long id2 = gateway.insert("Jane Smith", "jane@example.com", 25);
        System.out.println("Inserted person with ID: " + id1);
        System.out.println("Inserted person with ID: " + id2);

        // Find by ID
        System.out.println("\nFinding person by ID:");
        PersonData person = gateway.findById(id1);
        System.out.println("Found: " + person);

        // Find all
        System.out.println("\nAll persons:");
        List<PersonData> allPersons = gateway.findAll();
        allPersons.forEach(p -> System.out.println("  " + p));

        // Update
        System.out.println("\nUpdating person:");
        gateway.update(id1, "John Updated", "john.updated@example.com", 31);
        System.out.println("Updated: " + gateway.findById(id1));

        // Delete
        System.out.println("\nDeleting person:");
        gateway.delete(id2);
        System.out.println("Remaining persons: " + gateway.findAll().size());
        System.out.println();
    }

    private static void demonstrateRowDataGateway() {
        System.out.println("--- Row Data Gateway Pattern ---");
        System.out.println("Purpose: Object representing a database row\n");

        // Create new row
        System.out.println("Creating new employee row:");
        EmployeeRow employee = new EmployeeRow("Alice Johnson", "Engineering", 75000.0);
        employee.insert();
        System.out.println("Inserted: " + employee);

        // Load existing row
        System.out.println("\nLoading employee:");
        EmployeeRow loadedEmployee = EmployeeRow.load(employee.getId());
        System.out.println("Loaded: " + loadedEmployee);

        // Update row
        System.out.println("\nUpdating employee:");
        loadedEmployee.setSalary(80000.0);
        loadedEmployee.update();
        System.out.println("Updated: " + loadedEmployee);

        // Find by department
        System.out.println("\nFinding by department:");
        EmployeeRow engineer = new EmployeeRow("Bob Smith", "Engineering", 70000.0);
        engineer.insert();
        List<EmployeeRow> engineers = EmployeeRow.findByDepartment("Engineering");
        System.out.println("Engineers: " + engineers.size());
        engineers.forEach(e -> System.out.println("  " + e));
        System.out.println();
    }

    private static void demonstrateActiveRecord() {
        System.out.println("--- Active Record Pattern ---");
        System.out.println("Purpose: Domain object with data access methods\n");

        // Create and save
        System.out.println("Creating product:");
        ProductActiveRecord product = new ProductActiveRecord("Laptop", 999.99, 10);
        product.save();
        System.out.println("Saved: " + product);

        // Load
        System.out.println("\nLoading product:");
        Optional<ProductActiveRecord> loaded = ProductActiveRecord.find(product.getId());
        loaded.ifPresent(p -> System.out.println("Loaded: " + p));

        // Update
        System.out.println("\nUpdating product:");
        product.setPrice(899.99);
        product.setStock(15);
        product.save();
        System.out.println("Updated: " + product);

        // Business logic in Active Record
        System.out.println("\nSelling product:");
        product.sell(3);
        System.out.println("After sale: stock = " + product.getStock());

        // Find all
        System.out.println("\nAll products:");
        ProductActiveRecord another = new ProductActiveRecord("Mouse", 29.99, 50);
        another.save();
        List<ProductActiveRecord> all = ProductActiveRecord.findAll();
        all.forEach(p -> System.out.println("  " + p));
        System.out.println();
    }

    private static void demonstrateDataMapper() {
        System.out.println("--- Data Mapper Pattern ---");
        System.out.println("Purpose: Separates domain objects from database operations\n");

        OrderMapper mapper = new OrderMapper();

        // Create domain object
        System.out.println("Creating order:");
        Order order = new Order("John Doe", 150.00, "PENDING");
        mapper.insert(order);
        System.out.println("Inserted: " + order);

        // Load domain object
        System.out.println("\nLoading order:");
        Optional<Order> loadedOrder = mapper.findById(order.getId());
        loadedOrder.ifPresent(o -> System.out.println("Loaded: " + o));

        // Update domain object
        System.out.println("\nUpdating order:");
        order.setStatus("SHIPPED");
        order.setTotalAmount(175.00);
        mapper.update(order);
        System.out.println("Updated: " + order);

        // Complex query
        System.out.println("\nFinding orders by status:");
        Order another = new Order("Jane Smith", 200.00, "SHIPPED");
        mapper.insert(another);
        List<Order> shippedOrders = mapper.findByStatus("SHIPPED");
        System.out.println("Shipped orders: " + shippedOrders.size());
        shippedOrders.forEach(o -> System.out.println("  " + o));

        System.out.println("\nData Mapper keeps domain objects clean of persistence logic");
        System.out.println();
    }
}
