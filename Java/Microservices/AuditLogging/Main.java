package Microservices.AuditLogging;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Audit Logging Pattern ===\n");
        AuditLogger logger = new AuditLogger();
        
        logger.logAction("user123", "CREATE", "Order", "order-456", "Created new order");
        logger.logAction("user456", "UPDATE", "Product", "prod-789", "Updated price");
        logger.logAction("admin", "DELETE", "User", "user-999", "Deleted user account");
        logger.logAccess("user123", "/api/admin", "DENIED");
        
        logger.showAuditTrail();
    }
}
