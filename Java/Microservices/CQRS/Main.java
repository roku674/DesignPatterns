package Microservices.CQRS;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CQRS Pattern ===\n");
        
        CommandService commandService = new CommandService();
        QueryService queryService = new QueryService();
        
        System.out.println("=== Command Side (Write) ===");
        commandService.createProduct("prod-1", "Laptop", 999.99);
        commandService.updatePrice("prod-1", 899.99);
        
        System.out.println("\n=== Query Side (Read) ===");
        queryService.getProduct("prod-1");
        queryService.searchProducts("Laptop");
    }
}
