package Microservices.SingleServicePerHost;
public class ServiceHost {
    private String hostname;
    private String serviceName;
    private int port;
    
    public ServiceHost(String hostname) {
        this.hostname = hostname;
    }
    
    public void deploy(String serviceName, int port) {
        this.serviceName = serviceName;
        this.port = port;
        System.out.println("Deployed " + serviceName + " on dedicated host " + hostname + ":" + port);
    }
    
    public void showResources() {
        System.out.println(hostname + ":");
        System.out.println("  Service: " + serviceName);
        System.out.println("  CPU: 100% dedicated");
        System.out.println("  Memory: 100% dedicated");
        System.out.println("  No resource contention!");
    }
}
