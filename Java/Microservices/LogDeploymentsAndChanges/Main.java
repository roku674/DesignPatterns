package Microservices.LogDeploymentsAndChanges;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Log Deployments and Changes Pattern ===\n");
        
        DeploymentLogger logger = new DeploymentLogger();
        
        logger.logDeployment("OrderService", "v1.2.3", "Production", "user-alice");
        logger.logConfigChange("OrderService", "db.pool.size", "10", "20", "user-bob");
        logger.logDeployment("PaymentService", "v2.0.0", "Production", "user-alice");
        logger.logRollback("PaymentService", "v2.0.0", "v1.9.5", "Critical bug found");
        
        logger.showHistory();
    }
}
