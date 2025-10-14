package Cloud.Retry;

/**
 * Simulates a cloud service (S3, Service Bus, etc.) with potential failures.
 */
public class CloudService {
    private final String serviceName;
    private final String region;
    private int failuresRemaining;

    public CloudService(String serviceName, String region, int initialFailures) {
        this.serviceName = serviceName;
        this.region = region;
        this.failuresRemaining = initialFailures;
    }

    public String upload(String key, String content) throws TransientException {
        if (failuresRemaining > 0) {
            failuresRemaining--;
            throw new TransientException(serviceName + " upload failed: network timeout");
        }
        return serviceName + " uploaded '" + key + "' to region " + region;
    }

    public String sendMessage(String queue, String message) throws TransientException {
        if (failuresRemaining > 0) {
            failuresRemaining--;
            throw new TransientException(serviceName + " send failed: connection reset");
        }
        return serviceName + " sent message to '" + queue + "' in region " + region;
    }

    public String publish(String topic, String message) throws TransientException {
        if (failuresRemaining > 0) {
            failuresRemaining--;
            throw new TransientException(serviceName + " publish failed: service unavailable");
        }
        return serviceName + " published to '" + topic + "' in region " + region;
    }
}
