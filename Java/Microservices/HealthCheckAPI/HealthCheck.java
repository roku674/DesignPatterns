package Microservices.HealthCheckAPI;
public interface HealthCheck {
    boolean isHealthy();
    String getName();
}
class DatabaseCheck implements HealthCheck {
    public boolean isHealthy() {
        return true;
    }
    public String getName() {
        return "Database";
    }
}
class CacheCheck implements HealthCheck {
    public boolean isHealthy() {
        return true;
    }
    public String getName() {
        return "Cache";
    }
}
class ExternalAPICheck implements HealthCheck {
    public boolean isHealthy() {
        return Math.random() > 0.3;
    }
    public String getName() {
        return "External API";
    }
}
