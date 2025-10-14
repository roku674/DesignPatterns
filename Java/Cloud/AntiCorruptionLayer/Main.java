package Cloud.AntiCorruptionLayer;

/**
 * Anti-Corruption Layer Pattern
 * Prevents legacy system models from polluting new system architecture.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Anti-Corruption Layer Pattern ===\n");
        
        // Legacy system
        LegacyOrderSystem legacy = new LegacyOrderSystem();
        
        // ACL translates between modern and legacy
        OrderServiceAdapter adapter = new OrderServiceAdapter(legacy);
        
        // Modern application uses clean interface
        ModernApplication app = new ModernApplication(adapter);
        
        System.out.println("1. Creating order through ACL:");
        app.createOrder("ORD-001", "customer@email.com", 299.99);
        
        System.out.println("\n2. Getting order through ACL:");
        app.getOrderStatus("ORD-001");
        
        System.out.println("\n3. ACL shields modern code from legacy complexity");
    }
}
