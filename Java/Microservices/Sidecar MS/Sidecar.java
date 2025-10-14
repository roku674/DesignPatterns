package Microservices.SidecarMS;

public class Sidecar {
    private int requestCount = 0;
    
    public void attachLoggingProxy() {
        System.out.println("  ✓ Logging proxy attached");
    }
    
    public void attachMetricsCollector() {
        System.out.println("  ✓ Metrics collector attached");
    }
    
    public void attachConfigWatcher() {
        System.out.println("  ✓ Config watcher attached");
    }
    
    public void attachServiceMeshProxy() {
        System.out.println("  ✓ Service mesh proxy attached");
    }
    
    public void interceptRequest(String request) {
        requestCount++;
        System.out.println("  [Sidecar] Intercepting request: " + request);
        System.out.println("  [Sidecar] Logging request");
        System.out.println("  [Sidecar] Recording metrics");
    }
    
    public void interceptResponse(String response) {
        System.out.println("  [Sidecar] Intercepting response: " + response);
        System.out.println("  [Sidecar] Logging response");
    }
    
    public void showMetrics() {
        System.out.println("Sidecar Metrics:");
        System.out.println("  Total requests: " + requestCount);
        System.out.println("  Status: Healthy");
    }
}
