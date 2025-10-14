package Microservices.ServerSideDiscovery;
import java.util.*;
public class LoadBalancer {
    private ServiceRegistry registry;
    private Map<String, Integer> roundRobinCounters = new HashMap<>();
    
    public LoadBalancer(ServiceRegistry registry) {
        this.registry = registry;
    }
    
    public void forward(String serviceName, String endpoint) {
        List<String> instances = registry.getInstances(serviceName);
        if (instances.isEmpty()) {
            System.out.println("No instances available for: " + serviceName);
            return;
        }
        
        int counter = roundRobinCounters.getOrDefault(serviceName, 0);
        String instance = instances.get(counter % instances.size());
        roundRobinCounters.put(serviceName, counter + 1);
        
        System.out.println("Forwarding request to " + instance + endpoint);
    }
}
