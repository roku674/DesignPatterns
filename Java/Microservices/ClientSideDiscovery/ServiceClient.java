package Microservices.ClientSideDiscovery;
import java.util.*;
public class ServiceClient {
    private ServiceRegistry registry;
    private Random random = new Random();
    
    public ServiceClient(ServiceRegistry registry) {
        this.registry = registry;
    }
    
    public void callService(String serviceName, String endpoint) {
        List<String> instances = registry.discover(serviceName);
        if (instances.isEmpty()) {
            System.out.println("No instances found for: " + serviceName);
            return;
        }
        
        String instance = instances.get(random.nextInt(instances.size()));
        System.out.println("Calling " + serviceName + " at " + instance + endpoint);
        System.out.println("  Response: OK\n");
    }
}
