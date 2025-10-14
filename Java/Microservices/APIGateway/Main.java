package Microservices.APIGateway;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

/**
 * API Gateway Pattern Demonstration
 *
 * The API Gateway provides a single entry point for all clients. It handles requests
 * by routing them to appropriate microservices, aggregating results, and providing
 * cross-cutting concerns like authentication, logging, rate limiting, and load balancing.
 *
 * Key Components:
 * - Gateway Router: Routes requests to appropriate services
 * - Authentication/Authorization: Validates client requests
 * - Rate Limiter: Controls request rates to prevent abuse
 * - Load Balancer: Distributes load across service instances
 * - Response Aggregator: Combines responses from multiple services
 * - Cache: Improves performance by caching responses
 *
 * Benefits:
 * - Single entry point for clients
 * - Encapsulates internal microservices structure
 * - Reduces round trips
 * - Centralized cross-cutting concerns
 * - Protocol translation
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== API Gateway Pattern Demo ===\n");

        // Scenario 1: Basic request routing
        demonstrateBasicRouting();

        // Scenario 2: Authentication and authorization
        demonstrateAuthentication();

        // Scenario 3: Rate limiting
        demonstrateRateLimiting();

        // Scenario 4: Load balancing
        demonstrateLoadBalancing();

        // Scenario 5: Request aggregation
        demonstrateRequestAggregation();

        // Scenario 6: Response caching
        demonstrateCaching();

        // Scenario 7: Circuit breaker integration
        demonstrateCircuitBreaker();

        // Scenario 8: Request transformation
        demonstrateRequestTransformation();

        // Scenario 9: API versioning
        demonstrateAPIVersioning();

        // Scenario 10: Error handling
        demonstrateErrorHandling();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic request routing
     */
    private static void demonstrateBasicRouting() {
        System.out.println("1. Basic Request Routing");
        System.out.println("-".repeat(50));

        APIGateway gateway = new APIGateway();

        // Register services
        gateway.registerService("/api/users", new UserService());
        gateway.registerService("/api/products", new ProductService());
        gateway.registerService("/api/orders", new OrderService());

        // Route requests
        System.out.println(gateway.route("/api/users/123"));
        System.out.println(gateway.route("/api/products/456"));
        System.out.println(gateway.route("/api/orders/789"));
        System.out.println();
    }

    /**
     * Scenario 2: Authentication and authorization
     */
    private static void demonstrateAuthentication() {
        System.out.println("2. Authentication and Authorization");
        System.out.println("-".repeat(50));

        AuthenticatedGateway gateway = new AuthenticatedGateway();

        Request authenticatedRequest = new Request("/api/users/profile", "Bearer valid-token");
        Request unauthenticatedRequest = new Request("/api/users/profile", null);

        System.out.println(gateway.handleRequest(authenticatedRequest));
        System.out.println(gateway.handleRequest(unauthenticatedRequest));
        System.out.println();
    }

    /**
     * Scenario 3: Rate limiting
     */
    private static void demonstrateRateLimiting() {
        System.out.println("3. Rate Limiting");
        System.out.println("-".repeat(50));

        RateLimitedGateway gateway = new RateLimitedGateway(3); // 3 requests per window

        String clientId = "client-123";
        for (int i = 1; i <= 5; i++) {
            System.out.println("Request " + i + ": " + gateway.handleRequest(clientId, "/api/data"));
        }
        System.out.println();
    }

    /**
     * Scenario 4: Load balancing
     */
    private static void demonstrateLoadBalancing() {
        System.out.println("4. Load Balancing");
        System.out.println("-".repeat(50));

        LoadBalancedGateway gateway = new LoadBalancedGateway();

        // Register multiple instances
        gateway.registerInstance("user-service", "instance-1");
        gateway.registerInstance("user-service", "instance-2");
        gateway.registerInstance("user-service", "instance-3");

        // Distribute requests
        for (int i = 1; i <= 6; i++) {
            System.out.println("Request " + i + ": " + gateway.route("user-service"));
        }
        System.out.println();
    }

    /**
     * Scenario 5: Request aggregation
     */
    private static void demonstrateRequestAggregation() {
        System.out.println("5. Request Aggregation");
        System.out.println("-".repeat(50));

        AggregatingGateway gateway = new AggregatingGateway();

        Map<String, Object> aggregatedResponse = gateway.aggregateUserData("user-123");
        System.out.println("Aggregated Response:");
        aggregatedResponse.forEach((key, value) ->
            System.out.println("  " + key + ": " + value)
        );
        System.out.println();
    }

    /**
     * Scenario 6: Response caching
     */
    private static void demonstrateCaching() {
        System.out.println("6. Response Caching");
        System.out.println("-".repeat(50));

        CachingGateway gateway = new CachingGateway();

        System.out.println("First request (cache miss):");
        System.out.println(gateway.handleRequest("/api/products/123"));

        System.out.println("\nSecond request (cache hit):");
        System.out.println(gateway.handleRequest("/api/products/123"));
        System.out.println();
    }

    /**
     * Scenario 7: Circuit breaker integration
     */
    private static void demonstrateCircuitBreaker() {
        System.out.println("7. Circuit Breaker Integration");
        System.out.println("-".repeat(50));

        CircuitBreakerGateway gateway = new CircuitBreakerGateway();

        // Simulate multiple failures
        for (int i = 1; i <= 5; i++) {
            System.out.println("Attempt " + i + ": " + gateway.callService("failing-service"));
        }
        System.out.println();
    }

    /**
     * Scenario 8: Request transformation
     */
    private static void demonstrateRequestTransformation() {
        System.out.println("8. Request Transformation");
        System.out.println("-".repeat(50));

        TransformingGateway gateway = new TransformingGateway();

        Request xmlRequest = new Request("/api/data", "application/xml");
        Request jsonRequest = new Request("/api/data", "application/json");

        System.out.println(gateway.transform(xmlRequest));
        System.out.println(gateway.transform(jsonRequest));
        System.out.println();
    }

    /**
     * Scenario 9: API versioning
     */
    private static void demonstrateAPIVersioning() {
        System.out.println("9. API Versioning");
        System.out.println("-".repeat(50));

        VersionedGateway gateway = new VersionedGateway();

        System.out.println(gateway.route("/api/v1/users"));
        System.out.println(gateway.route("/api/v2/users"));
        System.out.println(gateway.route("/api/v3/users"));
        System.out.println();
    }

    /**
     * Scenario 10: Error handling
     */
    private static void demonstrateErrorHandling() {
        System.out.println("10. Error Handling");
        System.out.println("-".repeat(50));

        ErrorHandlingGateway gateway = new ErrorHandlingGateway();

        System.out.println(gateway.handleRequest("/api/valid"));
        System.out.println(gateway.handleRequest("/api/not-found"));
        System.out.println(gateway.handleRequest("/api/error"));
        System.out.println();
    }
}

/**
 * Basic API Gateway implementation
 */
class APIGateway {
    private final Map<String, Service> routes = new HashMap<>();

    public void registerService(String path, Service service) {
        routes.put(path, service);
        System.out.println("  Registered service at: " + path);
    }

    public String route(String path) {
        Service service = findService(path);
        if (service != null) {
            return service.handle(path);
        }
        return "404: Service not found for path: " + path;
    }

    private Service findService(String path) {
        for (Map.Entry<String, Service> entry : routes.entrySet()) {
            if (path.startsWith(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }
}

/**
 * Authenticated Gateway with token validation
 */
class AuthenticatedGateway {
    private final Set<String> validTokens = new HashSet<>(Arrays.asList("valid-token", "admin-token"));

    public String handleRequest(Request request) {
        System.out.println("  Processing: " + request.getPath());

        if (!isAuthenticated(request)) {
            return "401 Unauthorized: Invalid or missing token";
        }

        return "200 OK: Access granted to " + request.getPath();
    }

    private boolean isAuthenticated(Request request) {
        String token = request.getToken();
        return token != null && validTokens.contains(token.replace("Bearer ", ""));
    }
}

/**
 * Rate Limited Gateway
 */
class RateLimitedGateway {
    private final Map<String, Integer> requestCounts = new ConcurrentHashMap<>();
    private final int maxRequests;

    public RateLimitedGateway(int maxRequests) {
        this.maxRequests = maxRequests;
    }

    public String handleRequest(String clientId, String path) {
        int count = requestCounts.getOrDefault(clientId, 0);

        if (count >= maxRequests) {
            return "429 Too Many Requests: Rate limit exceeded";
        }

        requestCounts.put(clientId, count + 1);
        return "200 OK: Request processed (" + (count + 1) + "/" + maxRequests + ")";
    }
}

/**
 * Load Balanced Gateway using round-robin
 */
class LoadBalancedGateway {
    private final Map<String, List<String>> serviceInstances = new HashMap<>();
    private final Map<String, Integer> currentIndex = new HashMap<>();

    public void registerInstance(String service, String instance) {
        serviceInstances.computeIfAbsent(service, k -> new ArrayList<>()).add(instance);
        System.out.println("  Registered instance: " + instance + " for service: " + service);
    }

    public String route(String service) {
        List<String> instances = serviceInstances.get(service);
        if (instances == null || instances.isEmpty()) {
            return "No instances available for service: " + service;
        }

        int index = currentIndex.getOrDefault(service, 0);
        String instance = instances.get(index);

        // Round-robin
        currentIndex.put(service, (index + 1) % instances.size());

        return "Routed to: " + instance;
    }
}

/**
 * Aggregating Gateway that combines responses from multiple services
 */
class AggregatingGateway {
    public Map<String, Object> aggregateUserData(String userId) {
        System.out.println("  Aggregating data for user: " + userId);

        Map<String, Object> result = new HashMap<>();
        result.put("profile", fetchUserProfile(userId));
        result.put("orders", fetchUserOrders(userId));
        result.put("preferences", fetchUserPreferences(userId));

        return result;
    }

    private String fetchUserProfile(String userId) {
        System.out.println("    Fetching profile from User Service");
        return "Profile data for " + userId;
    }

    private String fetchUserOrders(String userId) {
        System.out.println("    Fetching orders from Order Service");
        return "Order data for " + userId;
    }

    private String fetchUserPreferences(String userId) {
        System.out.println("    Fetching preferences from Preference Service");
        return "Preferences for " + userId;
    }
}

/**
 * Caching Gateway
 */
class CachingGateway {
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public String handleRequest(String path) {
        if (cache.containsKey(path)) {
            System.out.println("  Cache HIT for: " + path);
            return cache.get(path);
        }

        System.out.println("  Cache MISS for: " + path);
        String response = fetchFromService(path);
        cache.put(path, response);
        return response;
    }

    private String fetchFromService(String path) {
        System.out.println("  Fetching from backend service");
        return "Data for " + path;
    }
}

/**
 * Circuit Breaker Gateway
 */
class CircuitBreakerGateway {
    private enum State { CLOSED, OPEN, HALF_OPEN }
    private State state = State.CLOSED;
    private int failureCount = 0;
    private final int threshold = 3;

    public String callService(String service) {
        if (state == State.OPEN) {
            System.out.println("  Circuit is OPEN - request rejected");
            return "503 Service Unavailable: Circuit breaker is open";
        }

        try {
            // Simulate service call
            simulateFailure();
            failureCount = 0;
            state = State.CLOSED;
            return "200 OK: Service responded";
        } catch (Exception e) {
            failureCount++;
            if (failureCount >= threshold) {
                state = State.OPEN;
                System.out.println("  Circuit breaker OPENED after " + failureCount + " failures");
            }
            return "500 Internal Server Error: Service failed";
        }
    }

    private void simulateFailure() throws Exception {
        throw new Exception("Service failure");
    }
}

/**
 * Transforming Gateway that handles protocol/format conversion
 */
class TransformingGateway {
    public String transform(Request request) {
        String contentType = request.getContentType();
        System.out.println("  Transforming request with content type: " + contentType);

        if ("application/xml".equals(contentType)) {
            return "Transformed XML to JSON";
        } else if ("application/json".equals(contentType)) {
            return "Passed through JSON";
        }

        return "Unsupported content type";
    }
}

/**
 * Versioned Gateway supporting multiple API versions
 */
class VersionedGateway {
    public String route(String path) {
        if (path.contains("/v1/")) {
            return "Routing to V1 API: " + path;
        } else if (path.contains("/v2/")) {
            return "Routing to V2 API (enhanced): " + path;
        } else if (path.contains("/v3/")) {
            return "Routing to V3 API (latest): " + path;
        }
        return "Unknown API version";
    }
}

/**
 * Error Handling Gateway
 */
class ErrorHandlingGateway {
    public String handleRequest(String path) {
        try {
            if (path.contains("not-found")) {
                throw new NotFoundException("Resource not found");
            } else if (path.contains("error")) {
                throw new ServiceException("Service error occurred");
            }
            return "200 OK: Request successful";
        } catch (NotFoundException e) {
            System.out.println("  Handling 404 error: " + e.getMessage());
            return "404 Not Found: " + e.getMessage();
        } catch (ServiceException e) {
            System.out.println("  Handling 500 error: " + e.getMessage());
            return "500 Internal Server Error: " + e.getMessage();
        }
    }
}

// Service interface and implementations
interface Service {
    String handle(String request);
}

class UserService implements Service {
    public String handle(String request) {
        return "User Service response for: " + request;
    }
}

class ProductService implements Service {
    public String handle(String request) {
        return "Product Service response for: " + request;
    }
}

class OrderService implements Service {
    public String handle(String request) {
        return "Order Service response for: " + request;
    }
}

// Supporting classes
class Request {
    private final String path;
    private final String token;
    private final String contentType;

    public Request(String path, String tokenOrContentType) {
        this.path = path;
        if (tokenOrContentType != null && tokenOrContentType.startsWith("Bearer")) {
            this.token = tokenOrContentType;
            this.contentType = null;
        } else {
            this.token = null;
            this.contentType = tokenOrContentType;
        }
    }

    public String getPath() { return path; }
    public String getToken() { return token; }
    public String getContentType() { return contentType; }
}

class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}

class ServiceException extends RuntimeException {
    public ServiceException(String message) {
        super(message);
    }
}
