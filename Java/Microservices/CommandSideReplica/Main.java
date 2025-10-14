package Microservices.CommandSideReplica;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Command-Side Replica Pattern ===\n");
        
        WriteModel writeModel = new WriteModel();
        ReadReplica readReplica = new ReadReplica();
        
        System.out.println("=== Write Operations ===");
        writeModel.createOrder("order-1", "customer-123", 299.99);
        writeModel.updateOrder("order-1", "PROCESSING");
        
        System.out.println("\n=== Replication ===");
        readReplica.replicate(writeModel.getEvents());
        
        System.out.println("\n=== Read Operations ===");
        readReplica.queryOrder("order-1");
        readReplica.queryCustomerOrders("customer-123");
    }
}
