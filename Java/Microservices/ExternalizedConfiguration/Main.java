package Microservices.ExternalizedConfiguration;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Externalized Configuration Pattern ===\n");
        
        ConfigServer configServer = new ConfigServer();
        configServer.loadConfig("application.properties");
        
        ServiceInstance orderService = new ServiceInstance("OrderService", configServer);
        orderService.start();
        
        System.out.println("\nUpdating configuration...");
        configServer.updateConfig("db.pool.size", "20");
        orderService.reloadConfig();
    }
}
