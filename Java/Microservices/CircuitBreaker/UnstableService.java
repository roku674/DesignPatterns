package Microservices.CircuitBreaker;

import java.util.Random;

/**
 * Simulates an unstable external service
 */
public class UnstableService {
    private double failureRate;
    private Random random = new Random();

    public UnstableService(double failureRate) {
        this.failureRate = failureRate;
    }

    public String call(String request) throws ServiceException {
        simulateLatency();

        if (random.nextDouble() < failureRate) {
            throw new ServiceException("Service unavailable: " + request);
        }

        return "SUCCESS: " + request + " processed";
    }

    public void setFailureRate(double rate) {
        this.failureRate = rate;
    }

    private void simulateLatency() {
        try {
            Thread.sleep(50 + random.nextInt(100));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

class ServiceException extends Exception {
    public ServiceException(String message) {
        super(message);
    }
}
