package Enterprise.Distribution;

/**
 * Demonstrates Distribution Patterns for Enterprise Applications.
 *
 * Distribution patterns address challenges when objects are distributed across different processes.
 * Key patterns:
 * - Remote Facade: Provides coarse-grained facade to minimize remote calls
 * - Data Transfer Object (DTO): Object that carries data between processes
 * - Assembler: Builds DTOs from domain objects and vice versa
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Distribution Patterns Demo ===\n");

        // 1. Remote Facade Pattern
        demonstrateRemoteFacade();

        // 2. Data Transfer Object Pattern
        demonstrateDataTransferObject();

        // 3. DTO Assembler Pattern
        demonstrateAssembler();

        // 4. Optimal Remote Call Strategy
        demonstrateOptimalStrategy();

        System.out.println("\n=== All Distribution Patterns Demonstrated ===");
    }

    private static void demonstrateRemoteFacade() {
        System.out.println("--- Remote Facade Pattern ---");
        System.out.println("Purpose: Coarse-grained facade for fine-grained objects\n");

        // Fine-grained domain objects
        Customer customer = new Customer(1L, "John Doe", "john@example.com");
        Address address = new Address("123 Main St", "Springfield", "IL", "62701");
        CreditCard creditCard = new CreditCard("1234-5678-9012-3456", "12/25", "John Doe");

        // Remote facade provides single coarse-grained call
        CustomerServiceFacade facade = new CustomerServiceFacade();

        System.out.println("Without facade: 3 separate remote calls needed");
        System.out.println("  1. getCustomer()");
        System.out.println("  2. getAddress()");
        System.out.println("  3. getCreditCard()");

        System.out.println("\nWith facade: 1 coarse-grained remote call");
        CustomerInfo info = facade.getCustomerInfo(1L);
        System.out.println("Retrieved: " + info);
        System.out.println("Reduced network roundtrips from 3 to 1");
        System.out.println();
    }

    private static void demonstrateDataTransferObject() {
        System.out.println("--- Data Transfer Object Pattern ---");
        System.out.println("Purpose: Object carrying data between processes\n");

        // Create DTO for transfer
        OrderDTO orderDTO = new OrderDTO(
            1L,
            "Jane Smith",
            new String[]{"Laptop", "Mouse", "Keyboard"},
            1299.97,
            "PENDING"
        );

        System.out.println("Serializing DTO for network transfer:");
        System.out.println("  Order ID: " + orderDTO.getOrderId());
        System.out.println("  Customer: " + orderDTO.getCustomerName());
        System.out.println("  Items: " + orderDTO.getItems().length);
        System.out.println("  Total: $" + orderDTO.getTotalAmount());
        System.out.println("  Status: " + orderDTO.getStatus());

        System.out.println("\nDTO benefits:");
        System.out.println("  - Reduces remote calls (batches data)");
        System.out.println("  - Serializable for network transfer");
        System.out.println("  - Independent of domain model");
        System.out.println("  - Can cross system boundaries");
        System.out.println();
    }

    private static void demonstrateAssembler() {
        System.out.println("--- DTO Assembler Pattern ---");
        System.out.println("Purpose: Converts between domain objects and DTOs\n");

        // Domain object
        Order order = new Order(2L, "Bob Johnson", 499.99, "SHIPPED");
        order.addItem("Tablet");
        order.addItem("Case");

        // Convert to DTO
        OrderAssembler assembler = new OrderAssembler();
        OrderDTO dto = assembler.toDTO(order);

        System.out.println("Domain to DTO:");
        System.out.println("  Domain: " + order);
        System.out.println("  DTO: Customer=" + dto.getCustomerName() +
                         ", Items=" + dto.getItems().length);

        // Convert back to domain
        Order reconstructed = assembler.toDomain(dto);
        System.out.println("\nDTO to Domain:");
        System.out.println("  Reconstructed: " + reconstructed);
        System.out.println("\nAssembler handles bidirectional conversion");
        System.out.println();
    }

    private static void demonstrateOptimalStrategy() {
        System.out.println("--- Optimal Remote Call Strategy ---");
        System.out.println("Purpose: Minimize network overhead\n");

        System.out.println("Anti-pattern (Chatty Interface):");
        System.out.println("  getFirstName()  -> 1 remote call");
        System.out.println("  getLastName()   -> 1 remote call");
        System.out.println("  getEmail()      -> 1 remote call");
        System.out.println("  getPhone()      -> 1 remote call");
        System.out.println("  Total: 4 remote calls");

        System.out.println("\nBest practice (Chunky Interface):");
        System.out.println("  getContactInfo() -> 1 remote call");
        System.out.println("  Returns: {firstName, lastName, email, phone}");
        System.out.println("  Total: 1 remote call");

        System.out.println("\nGuidelines:");
        System.out.println("  - Batch related data together");
        System.out.println("  - Use DTOs for data transfer");
        System.out.println("  - Provide coarse-grained operations");
        System.out.println("  - Cache when appropriate");
        System.out.println();
    }
}
