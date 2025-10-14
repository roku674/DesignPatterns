package Microservices.MultipleServicesPerHost;
import java.util.*;
public class Host {
    private String hostname;
    private Map<String, ServiceInstance> services = new HashMap<>();
    
    public Host(String hostname) {
        this.hostname = hostname;
    }
    
    public void deployService(String serviceName, int port) {
        ServiceInstance instance = new ServiceInstance(serviceName, port);
        services.put(serviceName, instance);
        System.out.println("Deployed " + serviceName + " on " + hostname + ":" + port);
    }
    
    public void stopService(String serviceName) {
        services.remove(serviceName);
        System.out.println("Stopped " + serviceName);
    }
    
    public void showStatus() {
        System.out.println("\n=== Host Status: " + hostname + " ===");
        System.out.println("Services running: " + services.size());
        services.forEach((name, instance) -> 
            System.out.println("  " + name + " on port " + instance.port)
        );
    }
}
class ServiceInstance {
    String name;
    int port;
    ServiceInstance(String name, int port) {
        this.name = name;
        this.port = port;
    }
}
