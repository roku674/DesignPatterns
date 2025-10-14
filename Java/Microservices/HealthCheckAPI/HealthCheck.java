package Microservices.HealthCheckAPI;
public interface HealthCheck {
    boolean isHealthy();
    String getName();
}
class DatabaseCheck implements HealthCheck {
    private String name;
    private boolean healthy;

    public DatabaseCheck(String name, boolean healthy) {
        this.name = name;
        this.healthy = healthy;
    }

    public boolean isHealthy() {
        return healthy;
    }
    public String getName() {
        return name;
    }
}
class CacheCheck implements HealthCheck {
    private String name;
    private boolean healthy;

    public CacheCheck(String name, boolean healthy) {
        this.name = name;
        this.healthy = healthy;
    }

    public boolean isHealthy() {
        return healthy;
    }
    public String getName() {
        return name;
    }
}
class ExternalAPICheck implements HealthCheck {
    private String name;
    private boolean healthy;

    public ExternalAPICheck(String name, boolean healthy) {
        this.name = name;
        this.healthy = healthy;
    }

    public boolean isHealthy() {
        return healthy;
    }
    public String getName() {
        return name;
    }
}
