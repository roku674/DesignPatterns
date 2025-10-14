package Microservices.ExternalizedConfiguration;
import java.util.*;
public class ServiceInstance {
    private String serviceName;
    private ConfigServer configServer;
    private Map<String, String> localConfig;
    
    public ServiceInstance(String serviceName, ConfigServer configServer) {
        this.serviceName = serviceName;
        this.configServer = configServer;
    }
    
    public void start() {
        localConfig = configServer.getAllConfig();
        System.out.println(serviceName + " started with configuration:");
        localConfig.forEach((k, v) -> System.out.println("  " + k + " = " + v));
    }
    
    public void reloadConfig() {
        localConfig = configServer.getAllConfig();
        System.out.println(serviceName + " configuration reloaded:");
        localConfig.forEach((k, v) -> System.out.println("  " + k + " = " + v));
    }
}
