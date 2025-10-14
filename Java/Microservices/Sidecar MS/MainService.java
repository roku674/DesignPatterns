package Microservices.SidecarMS;

public class MainService {
    private String serviceName;
    
    public MainService(String serviceName) {
        this.serviceName = serviceName;
    }
    
    public void processRequest(String request) {
        System.out.println("  [" + serviceName + "] Processing: " + request);
    }
}
