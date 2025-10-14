package Microservices.ClientSideDiscovery;
import java.util.*;
public class ServiceRegistry {
    private Map<String, List<String>> services = new HashMap<>();
    
    public void register(String serviceName, String address) {
        services.computeIfAbsent(serviceName, k -> new ArrayList<>()).add(address);
        System.out.println("Registered: " + serviceName + " at " + address);
    }
    
    public List<String> discover(String serviceName) {
        return services.getOrDefault(serviceName, new ArrayList<>());
    }
}
