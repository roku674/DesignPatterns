package Cloud.GatewayRouting;

import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

/**
 * Gateway Routing Pattern Demonstration
 *
 * <p>The Gateway Routing pattern routes requests to different backend services using
 * a single endpoint based on request headers, HTTP method, path, or other criteria.</p>
 *
 * <p>Key Benefits:</p>
 * <ul>
 *   <li>Single entry point for multiple services</li>
 *   <li>Simplifies client configuration</li>
 *   <li>Enables service versioning and A/B testing</li>
 *   <li>Centralizes request routing logic</li>
 * </ul>
 *
 * @author Design Patterns Demo
 * @version 1.0
 */
public class Main {

    /**
     * HTTP Request representation.
     */
    static class HttpRequest {
        private String method;
        private String path;
        private Map<String, String> headers;
        private String body;

        public HttpRequest(String method, String path) {
            this.method = method;
            this.path = path;
            this.headers = new HashMap<>();
        }

        public String getMethod() { return method; }
        public String getPath() { return path; }
        public Map<String, String> getHeaders() { return headers; }
        public String getBody() { return body; }

        public void setBody(String body) { this.body = body; }
        public void addHeader(String key, String value) { headers.put(key, value); }

        @Override
        public String toString() {
            return String.format("%s %s", method, path);
        }
    }

    /**
     * HTTP Response representation.
     */
    static class HttpResponse {
        private int statusCode;
        private String body;
        private String serviceName;

        public HttpResponse(int statusCode, String body, String serviceName) {
            this.statusCode = statusCode;
            this.body = body;
            this.serviceName = serviceName;
        }

        public int getStatusCode() { return statusCode; }
        public String getBody() { return body; }
        public String getServiceName() { return serviceName; }

        @Override
        public String toString() {
            return String.format("[%s] %d: %s", serviceName, statusCode, body);
        }
    }

    /**
     * Backend service interface.
     */
    interface BackendService {
        HttpResponse handleRequest(HttpRequest request);
        String getServiceName();
        String getVersion();
    }

    /**
     * User service v1.
     */
    static class UserServiceV1 implements BackendService {
        @Override
        public HttpResponse handleRequest(HttpRequest request) {
            if (request.getPath().contains("/users")) {
                return new HttpResponse(200, "{\"users\": [\"Alice\", \"Bob\"], \"version\": \"v1\"}", getServiceName());
            }
            return new HttpResponse(404, "{\"error\": \"Not found\"}", getServiceName());
        }

        @Override
        public String getServiceName() { return "UserService-v1"; }

        @Override
        public String getVersion() { return "v1"; }
    }

    /**
     * User service v2 with enhanced features.
     */
    static class UserServiceV2 implements BackendService {
        @Override
        public HttpResponse handleRequest(HttpRequest request) {
            if (request.getPath().contains("/users")) {
                return new HttpResponse(200,
                    "{\"users\": [{\"id\":1,\"name\":\"Alice\"},{\"id\":2,\"name\":\"Bob\"}], \"version\": \"v2\"}",
                    getServiceName());
            }
            return new HttpResponse(404, "{\"error\": \"Not found\"}", getServiceName());
        }

        @Override
        public String getServiceName() { return "UserService-v2"; }

        @Override
        public String getVersion() { return "v2"; }
    }

    /**
     * Product catalog service.
     */
    static class ProductService implements BackendService {
        @Override
        public HttpResponse handleRequest(HttpRequest request) {
            if (request.getPath().contains("/products")) {
                return new HttpResponse(200,
                    "{\"products\": [{\"id\":1,\"name\":\"Laptop\"},{\"id\":2,\"name\":\"Mouse\"}]}",
                    getServiceName());
            }
            return new HttpResponse(404, "{\"error\": \"Not found\"}", getServiceName());
        }

        @Override
        public String getServiceName() { return "ProductService"; }

        @Override
        public String getVersion() { return "v1"; }
    }

    /**
     * Order processing service.
     */
    static class OrderService implements BackendService {
        @Override
        public HttpResponse handleRequest(HttpRequest request) {
            if (request.getPath().contains("/orders")) {
                return new HttpResponse(200,
                    "{\"orders\": [{\"id\":\"ORD001\",\"total\":299.99}]}",
                    getServiceName());
            }
            return new HttpResponse(404, "{\"error\": \"Not found\"}", getServiceName());
        }

        @Override
        public String getServiceName() { return "OrderService"; }

        @Override
        public String getVersion() { return "v1"; }
    }

    /**
     * Payment processing service.
     */
    static class PaymentService implements BackendService {
        @Override
        public HttpResponse handleRequest(HttpRequest request) {
            if (request.getPath().contains("/payments")) {
                return new HttpResponse(200,
                    "{\"status\":\"processed\",\"transactionId\":\"TXN12345\"}",
                    getServiceName());
            }
            return new HttpResponse(404, "{\"error\": \"Not found\"}", getServiceName());
        }

        @Override
        public String getServiceName() { return "PaymentService"; }

        @Override
        public String getVersion() { return "v1"; }
    }

    /**
     * Analytics service.
     */
    static class AnalyticsService implements BackendService {
        @Override
        public HttpResponse handleRequest(HttpRequest request) {
            if (request.getPath().contains("/analytics")) {
                return new HttpResponse(200,
                    "{\"pageViews\":1523,\"uniqueVisitors\":432}",
                    getServiceName());
            }
            return new HttpResponse(404, "{\"error\": \"Not found\"}", getServiceName());
        }

        @Override
        public String getServiceName() { return "AnalyticsService"; }

        @Override
        public String getVersion() { return "v1"; }
    }

    /**
     * Route configuration.
     */
    static class Route {
        private Pattern pathPattern;
        private String method;
        private BackendService service;
        private Map<String, String> requiredHeaders;

        public Route(String pathPattern, String method, BackendService service) {
            this.pathPattern = Pattern.compile(pathPattern);
            this.method = method;
            this.service = service;
            this.requiredHeaders = new HashMap<>();
        }

        public void addRequiredHeader(String key, String value) {
            requiredHeaders.put(key, value);
        }

        public boolean matches(HttpRequest request) {
            if (!request.getMethod().equals(method)) {
                return false;
            }

            if (!pathPattern.matcher(request.getPath()).matches()) {
                return false;
            }

            for (Map.Entry<String, String> header : requiredHeaders.entrySet()) {
                String requestHeaderValue = request.getHeaders().get(header.getKey());
                if (!header.getValue().equals(requestHeaderValue)) {
                    return false;
                }
            }

            return true;
        }

        public BackendService getService() {
            return service;
        }
    }

    /**
     * Gateway Router that routes requests to appropriate backend services.
     */
    static class GatewayRouter {
        private List<Route> routes;
        private Map<String, Integer> serviceCallCounts;

        public GatewayRouter() {
            this.routes = new ArrayList<>();
            this.serviceCallCounts = new HashMap<>();
        }

        public void addRoute(Route route) {
            routes.add(route);
        }

        public HttpResponse routeRequest(HttpRequest request) {
            System.out.println("  [ROUTER] Processing: " + request);

            for (Route route : routes) {
                if (route.matches(request)) {
                    BackendService service = route.getService();
                    String serviceName = service.getServiceName();

                    serviceCallCounts.put(serviceName,
                        serviceCallCounts.getOrDefault(serviceName, 0) + 1);

                    System.out.println("  [ROUTER] Routing to: " + serviceName);
                    return service.handleRequest(request);
                }
            }

            System.out.println("  [ROUTER] No matching route found");
            return new HttpResponse(404, "{\"error\": \"No route found\"}", "Gateway");
        }

        public Map<String, Integer> getServiceCallCounts() {
            return new HashMap<>(serviceCallCounts);
        }

        public void resetStatistics() {
            serviceCallCounts.clear();
        }
    }

    /**
     * Load balancer for distributing requests across service instances.
     */
    static class LoadBalancingRouter {
        private List<BackendService> serviceInstances;
        private int currentIndex;

        public LoadBalancingRouter() {
            this.serviceInstances = new ArrayList<>();
            this.currentIndex = 0;
        }

        public void addServiceInstance(BackendService service) {
            serviceInstances.add(service);
        }

        public HttpResponse routeRequest(HttpRequest request) {
            if (serviceInstances.isEmpty()) {
                return new HttpResponse(503, "{\"error\": \"No services available\"}", "LoadBalancer");
            }

            BackendService service = serviceInstances.get(currentIndex);
            currentIndex = (currentIndex + 1) % serviceInstances.size();

            System.out.println("  [LOAD BALANCER] Routing to: " + service.getServiceName() +
                " (instance " + (currentIndex == 0 ? serviceInstances.size() : currentIndex) + ")");

            return service.handleRequest(request);
        }
    }

    private static void printSection(String title) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println(title);
        System.out.println("=".repeat(60));
    }

    /**
     * Main method demonstrating the Gateway Routing pattern with 10 scenarios.
     *
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        System.out.println("=== Gateway Routing Pattern Demonstration ===\n");
        System.out.println("This pattern routes requests to different services using a single endpoint.");
        System.out.println("Timestamp: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        // Initialize services
        UserServiceV1 userV1 = new UserServiceV1();
        UserServiceV2 userV2 = new UserServiceV2();
        ProductService productService = new ProductService();
        OrderService orderService = new OrderService();
        PaymentService paymentService = new PaymentService();
        AnalyticsService analyticsService = new AnalyticsService();

        // Setup router
        GatewayRouter router = new GatewayRouter();

        // Configure routes
        router.addRoute(new Route("/api/users.*", "GET", userV1));
        router.addRoute(new Route("/api/products.*", "GET", productService));
        router.addRoute(new Route("/api/orders.*", "GET", orderService));
        router.addRoute(new Route("/api/orders.*", "POST", orderService));
        router.addRoute(new Route("/api/payments.*", "POST", paymentService));
        router.addRoute(new Route("/api/analytics.*", "GET", analyticsService));

        // Scenario 1: Basic routing to different services
        printSection("Scenario 1: Basic Path-Based Routing");
        HttpRequest req1 = new HttpRequest("GET", "/api/users");
        HttpResponse resp1 = router.routeRequest(req1);
        System.out.println("Response: " + resp1);

        HttpRequest req2 = new HttpRequest("GET", "/api/products");
        HttpResponse resp2 = router.routeRequest(req2);
        System.out.println("Response: " + resp2);

        // Scenario 2: HTTP method-based routing
        printSection("Scenario 2: Method-Based Routing");
        HttpRequest req3 = new HttpRequest("GET", "/api/orders");
        HttpResponse resp3 = router.routeRequest(req3);
        System.out.println("GET Response: " + resp3);

        HttpRequest req4 = new HttpRequest("POST", "/api/orders");
        req4.setBody("{\"productId\":1,\"quantity\":2}");
        HttpResponse resp4 = router.routeRequest(req4);
        System.out.println("POST Response: " + resp4);

        // Scenario 3: Version-based routing with headers
        printSection("Scenario 3: API Versioning with Headers");
        GatewayRouter versionRouter = new GatewayRouter();

        Route v1Route = new Route("/api/users.*", "GET", userV1);
        v1Route.addRequiredHeader("API-Version", "v1");
        versionRouter.addRoute(v1Route);

        Route v2Route = new Route("/api/users.*", "GET", userV2);
        v2Route.addRequiredHeader("API-Version", "v2");
        versionRouter.addRoute(v2Route);

        HttpRequest reqV1 = new HttpRequest("GET", "/api/users");
        reqV1.addHeader("API-Version", "v1");
        HttpResponse respV1 = versionRouter.routeRequest(reqV1);
        System.out.println("V1 Response: " + respV1);

        HttpRequest reqV2 = new HttpRequest("GET", "/api/users");
        reqV2.addHeader("API-Version", "v2");
        HttpResponse respV2 = versionRouter.routeRequest(reqV2);
        System.out.println("V2 Response: " + respV2);

        // Scenario 4: Path parameter routing
        printSection("Scenario 4: Path Parameter Routing");
        HttpRequest req5 = new HttpRequest("GET", "/api/users/123");
        HttpResponse resp5 = router.routeRequest(req5);
        System.out.println("Response: " + resp5);

        HttpRequest req6 = new HttpRequest("GET", "/api/products/456");
        HttpResponse resp6 = router.routeRequest(req6);
        System.out.println("Response: " + resp6);

        // Scenario 5: Service not found
        printSection("Scenario 5: No Matching Route");
        HttpRequest req7 = new HttpRequest("GET", "/api/nonexistent");
        HttpResponse resp7 = router.routeRequest(req7);
        System.out.println("Response: " + resp7);

        // Scenario 6: Load balancing across multiple instances
        printSection("Scenario 6: Load Balancing");
        LoadBalancingRouter loadBalancer = new LoadBalancingRouter();
        loadBalancer.addServiceInstance(new UserServiceV1());
        loadBalancer.addServiceInstance(new UserServiceV1());
        loadBalancer.addServiceInstance(new UserServiceV1());

        System.out.println("Making 5 requests to see round-robin distribution:");
        for (int i = 1; i <= 5; i++) {
            System.out.println("\nRequest " + i + ":");
            HttpRequest req = new HttpRequest("GET", "/api/users");
            loadBalancer.routeRequest(req);
        }

        // Scenario 7: Multiple service calls
        printSection("Scenario 7: Multiple Service Calls");
        String[] paths = {"/api/users", "/api/products", "/api/orders", "/api/analytics"};
        for (String path : paths) {
            HttpRequest req = new HttpRequest("GET", path);
            HttpResponse resp = router.routeRequest(req);
            System.out.println(path + " -> " + resp.getServiceName());
        }

        // Scenario 8: Statistics and monitoring
        printSection("Scenario 8: Request Statistics");
        System.out.println("Service call counts:");
        Map<String, Integer> stats = router.getServiceCallCounts();
        for (Map.Entry<String, Integer> entry : stats.entrySet()) {
            System.out.println("  " + entry.getKey() + ": " + entry.getValue() + " calls");
        }

        // Scenario 9: Payment processing
        printSection("Scenario 9: Payment Processing Route");
        HttpRequest paymentReq = new HttpRequest("POST", "/api/payments");
        paymentReq.setBody("{\"amount\":99.99,\"currency\":\"USD\"}");
        HttpResponse paymentResp = router.routeRequest(paymentReq);
        System.out.println("Response: " + paymentResp);

        // Scenario 10: Summary
        printSection("Scenario 10: Pattern Summary and Best Practices");
        System.out.println("Gateway Routing Features Demonstrated:");
        System.out.println("1. Path-based routing - Route by URL path");
        System.out.println("2. Method-based routing - Different handlers for GET/POST");
        System.out.println("3. Header-based routing - API versioning with headers");
        System.out.println("4. Pattern matching - Regex patterns for flexible routing");
        System.out.println("5. Load balancing - Distribute load across instances");
        System.out.println("6. Centralized routing - Single entry point for all services");
        System.out.println("\nBenefits:");
        System.out.println("- Simplified client configuration");
        System.out.println("- Easy service versioning and A/B testing");
        System.out.println("- Centralized request routing logic");
        System.out.println("- Enables gradual migration between service versions");
        System.out.println("- Better monitoring and analytics");
        System.out.println("\nBest Practices:");
        System.out.println("- Define clear routing rules and precedence");
        System.out.println("- Implement health checks for backend services");
        System.out.println("- Add circuit breakers for failing services");
        System.out.println("- Log all routing decisions for debugging");
        System.out.println("- Use consistent versioning strategy");
        System.out.println("- Monitor routing statistics and latency");

        System.out.println("\n=== Pattern Demonstration Complete ===");
    }
}
