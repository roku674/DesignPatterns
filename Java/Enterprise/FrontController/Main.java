package Enterprise.FrontController;

import java.util.*;

/**
 * FrontController Pattern Demonstration
 *
 * Intent: Provides a centralized request handling mechanism that channels
 * all requests through a single handler, which then dispatches them to
 * appropriate handlers. This pattern consolidates all request handling
 * in one place.
 *
 * This pattern is particularly useful when:
 * - You need centralized request processing and authentication
 * - Common pre/post processing is required for all requests
 * - You want to separate routing logic from business logic
 * - Implementing security checks, logging, or auditing
 * - Managing complex request/response flow
 *
 * Real-world examples:
 * - Web application request handling
 * - API gateway implementations
 * - Authentication and authorization systems
 * - Request logging and monitoring
 * - Content management systems
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== FrontController Pattern Demo ===\n");

        // Scenario 1: Basic Web Application
        demonstrateBasicWebApp();

        // Scenario 2: REST API with Authentication
        demonstrateRestApiWithAuth();

        // Scenario 3: E-commerce Platform
        demonstrateEcommercePlatform();

        // Scenario 4: Content Management System
        demonstrateContentManagement();

        // Scenario 5: Admin Dashboard
        demonstrateAdminDashboard();

        // Scenario 6: Mobile App Backend
        demonstrateMobileBackend();

        // Scenario 7: Microservices Gateway
        demonstrateMicroservicesGateway();

        // Scenario 8: Single Sign-On System
        demonstrateSingleSignOn();

        // Scenario 9: Banking Application
        demonstrateBankingApplication();

        // Scenario 10: Healthcare Portal
        demonstrateHealthcarePortal();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic web application with routing
     */
    private static void demonstrateBasicWebApp() {
        System.out.println("--- Scenario 1: Basic Web Application ---");

        WebAppFrontController controller = new WebAppFrontController();

        controller.handleRequest("/", "GET", null);
        controller.handleRequest("/about", "GET", null);
        controller.handleRequest("/contact", "POST", createMap("name", "John", "email", "john@example.com"));
        controller.handleRequest("/unknown", "GET", null);

        System.out.println();
    }

    /**
     * Scenario 2: REST API with authentication
     */
    private static void demonstrateRestApiWithAuth() {
        System.out.println("--- Scenario 2: REST API with Authentication ---");

        RestApiFrontController controller = new RestApiFrontController();

        // Request without authentication
        HttpRequest request1 = new HttpRequest("/api/public/status", "GET", null, null);
        controller.handleRequest(request1);

        // Request with authentication
        HttpRequest request2 = new HttpRequest("/api/users/123", "GET", null, "Bearer token123");
        controller.handleRequest(request2);

        // Invalid token
        HttpRequest request3 = new HttpRequest("/api/users/123", "GET", null, "Bearer invalid");
        controller.handleRequest(request3);

        System.out.println();
    }

    /**
     * Scenario 3: E-commerce platform request handling
     */
    private static void demonstrateEcommercePlatform() {
        System.out.println("--- Scenario 3: E-commerce Platform ---");

        EcommerceFrontController controller = new EcommerceFrontController();

        controller.processRequest("/products/search", "GET", createMap("q", "laptop"));
        controller.processRequest("/cart/add", "POST", createMap("productId", "123", "quantity", "2"));
        controller.processRequest("/checkout", "POST", createMap("cartId", "cart-456"));
        controller.processRequest("/orders/789", "GET", null);

        System.out.println();
    }

    /**
     * Scenario 4: Content Management System
     */
    private static void demonstrateContentManagement() {
        System.out.println("--- Scenario 4: Content Management System ---");

        CMSFrontController controller = new CMSFrontController();

        controller.dispatch("/cms/articles", "GET", "editor", null);
        controller.dispatch("/cms/articles/create", "POST", "editor", createMap("title", "New Article"));
        controller.dispatch("/cms/articles/123/publish", "PUT", "editor", null);
        controller.dispatch("/cms/settings", "GET", "viewer", null); // Insufficient permissions

        System.out.println();
    }

    /**
     * Scenario 5: Admin Dashboard
     */
    private static void demonstrateAdminDashboard() {
        System.out.println("--- Scenario 5: Admin Dashboard ---");

        AdminDashboardFrontController controller = new AdminDashboardFrontController();

        controller.serve("/admin/dashboard", "GET", "admin");
        controller.serve("/admin/users", "GET", "admin");
        controller.serve("/admin/users/456/delete", "DELETE", "admin");
        controller.serve("/admin/settings", "POST", "moderator"); // Insufficient privileges

        System.out.println();
    }

    /**
     * Scenario 6: Mobile App Backend
     */
    private static void demonstrateMobileBackend() {
        System.out.println("--- Scenario 6: Mobile App Backend ---");

        MobileBackendFrontController controller = new MobileBackendFrontController();

        MobileRequest req1 = new MobileRequest("/mobile/sync", "POST", "1.0.5", "iOS");
        controller.handle(req1);

        MobileRequest req2 = new MobileRequest("/mobile/profile", "GET", "1.0.5", "Android");
        controller.handle(req2);

        MobileRequest req3 = new MobileRequest("/mobile/notifications", "GET", "0.9.0", "iOS"); // Old version
        controller.handle(req3);

        System.out.println();
    }

    /**
     * Scenario 7: Microservices Gateway
     */
    private static void demonstrateMicroservicesGateway() {
        System.out.println("--- Scenario 7: Microservices Gateway ---");

        MicroservicesGateway gateway = new MicroservicesGateway();

        gateway.route("/api/users/profile", "user-service");
        gateway.route("/api/orders/recent", "order-service");
        gateway.route("/api/payments/process", "payment-service");
        gateway.route("/api/inventory/check", "inventory-service");

        System.out.println();
    }

    /**
     * Scenario 8: Single Sign-On System
     */
    private static void demonstrateSingleSignOn() {
        System.out.println("--- Scenario 8: Single Sign-On System ---");

        SSOFrontController sso = new SSOFrontController();

        sso.authenticate("/login", "POST", createMap("username", "alice", "password", "pass123"));
        sso.authenticate("/validate", "GET", createMap("token", "sso-token-abc"));
        sso.authenticate("/logout", "POST", createMap("token", "sso-token-abc"));

        System.out.println();
    }

    /**
     * Scenario 9: Banking Application
     */
    private static void demonstrateBankingApplication() {
        System.out.println("--- Scenario 9: Banking Application ---");

        BankingFrontController controller = new BankingFrontController();

        controller.process("/banking/login", "POST", createMap("accountNumber", "12345"));
        controller.process("/banking/balance", "GET", createMap("accountNumber", "12345"));
        controller.process("/banking/transfer", "POST", createMap("from", "12345", "to", "67890", "amount", "500"));
        controller.process("/banking/transactions", "GET", createMap("accountNumber", "12345"));

        System.out.println();
    }

    /**
     * Scenario 10: Healthcare Portal
     */
    private static void demonstrateHealthcarePortal() {
        System.out.println("--- Scenario 10: Healthcare Portal ---");

        HealthcareFrontController controller = new HealthcareFrontController();

        controller.handleHealthRequest("/patient/appointments", "GET", "PATIENT", "PAT-001");
        controller.handleHealthRequest("/patient/records", "GET", "PATIENT", "PAT-001");
        controller.handleHealthRequest("/doctor/schedule", "GET", "DOCTOR", "DOC-001");
        controller.handleHealthRequest("/admin/reports", "GET", "PATIENT", "PAT-001"); // Unauthorized

        System.out.println();
    }

    // Helper method to create maps
    private static Map<String, String> createMap(String... keyValues) {
        Map<String, String> map = new HashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            map.put(keyValues[i], keyValues[i + 1]);
        }
        return map;
    }
}

// ============= Scenario 1: Basic Web Application =============

/**
 * Front controller for basic web application
 */
class WebAppFrontController {
    private Dispatcher dispatcher;
    private Map<String, String> routes;

    public WebAppFrontController() {
        dispatcher = new Dispatcher();
        routes = new HashMap<>();
        routes.put("/", "HomeView");
        routes.put("/about", "AboutView");
        routes.put("/contact", "ContactView");
    }

    public void handleRequest(String url, String method, Map<String, String> params) {
        System.out.println("→ Incoming: " + method + " " + url);

        // Pre-processing
        logRequest(method, url);

        // Route to appropriate view
        String viewName = routes.getOrDefault(url, "NotFoundView");
        dispatcher.dispatch(viewName, params);

        // Post-processing
        System.out.println("  ✓ Request completed");
    }

    private void logRequest(String method, String url) {
        System.out.println("  [LOG] " + method + " " + url + " at " + new Date());
    }
}

/**
 * Dispatcher that forwards to appropriate view
 */
class Dispatcher {
    public void dispatch(String viewName, Map<String, String> params) {
        System.out.println("  → Dispatching to: " + viewName);
        renderView(viewName, params);
    }

    private void renderView(String viewName, Map<String, String> params) {
        switch (viewName) {
            case "HomeView":
                System.out.println("  [Rendering Home Page]");
                break;
            case "AboutView":
                System.out.println("  [Rendering About Page]");
                break;
            case "ContactView":
                System.out.println("  [Rendering Contact Form]");
                if (params != null) {
                    System.out.println("    Form data: " + params);
                }
                break;
            default:
                System.out.println("  [Rendering 404 Page]");
        }
    }
}

// ============= Scenario 2: REST API with Authentication =============

/**
 * HTTP Request representation
 */
class HttpRequest {
    String path;
    String method;
    Map<String, String> params;
    String authHeader;

    public HttpRequest(String path, String method, Map<String, String> params, String authHeader) {
        this.path = path;
        this.method = method;
        this.params = params;
        this.authHeader = authHeader;
    }
}

/**
 * REST API Front Controller with authentication
 */
class RestApiFrontController {
    private AuthenticationFilter authFilter;
    private ApiDispatcher apiDispatcher;

    public RestApiFrontController() {
        authFilter = new AuthenticationFilter();
        apiDispatcher = new ApiDispatcher();
    }

    public void handleRequest(HttpRequest request) {
        System.out.println("→ API Request: " + request.method + " " + request.path);

        // Authentication check
        if (requiresAuth(request.path)) {
            if (!authFilter.authenticate(request.authHeader)) {
                System.out.println("  ✗ Authentication failed");
                return;
            }
            System.out.println("  ✓ Authenticated");
        }

        // Dispatch to API handler
        apiDispatcher.dispatch(request);
    }

    private boolean requiresAuth(String path) {
        return !path.startsWith("/api/public");
    }
}

/**
 * Authentication filter
 */
class AuthenticationFilter {
    public boolean authenticate(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authHeader.substring(7);
        return token.equals("token123"); // Simplified validation
    }
}

/**
 * API request dispatcher
 */
class ApiDispatcher {
    public void dispatch(HttpRequest request) {
        System.out.println("  → Routing to API endpoint");

        if (request.path.contains("/users/")) {
            System.out.println("  [UserController] Fetching user data");
        } else if (request.path.contains("/status")) {
            System.out.println("  [StatusController] API is healthy");
        } else {
            System.out.println("  [404] Endpoint not found");
        }
    }
}

// ============= Scenario 3: E-commerce Platform =============

/**
 * E-commerce front controller
 */
class EcommerceFrontController {
    private SecurityManager securityManager;
    private Router router;

    public EcommerceFrontController() {
        securityManager = new SecurityManager();
        router = new Router();
    }

    public void processRequest(String path, String method, Map<String, String> params) {
        System.out.println("→ E-commerce Request: " + method + " " + path);

        // Security checks
        if (!securityManager.validateRequest(path, method)) {
            System.out.println("  ✗ Security validation failed");
            return;
        }

        // Route to appropriate handler
        router.route(path, method, params);

        System.out.println("  ✓ Request processed");
    }
}

/**
 * Security manager for e-commerce
 */
class SecurityManager {
    public boolean validateRequest(String path, String method) {
        // CSRF protection for POST/PUT/DELETE
        if (method.equals("POST") || method.equals("PUT") || method.equals("DELETE")) {
            System.out.println("  [Security] CSRF token validated");
        }
        return true;
    }
}

/**
 * Request router
 */
class Router {
    public void route(String path, String method, Map<String, String> params) {
        System.out.println("  → Routing to handler");

        if (path.contains("/products")) {
            System.out.println("  [ProductController] " + (params != null ? "Search: " + params.get("q") : ""));
        } else if (path.contains("/cart")) {
            System.out.println("  [CartController] Added to cart");
        } else if (path.contains("/checkout")) {
            System.out.println("  [CheckoutController] Processing checkout");
        } else if (path.contains("/orders")) {
            System.out.println("  [OrderController] Fetching order");
        }
    }
}

// ============= Scenario 4: Content Management System =============

/**
 * CMS Front Controller
 */
class CMSFrontController {
    private AccessControl accessControl;
    private CMSDispatcher cmsDispatcher;

    public CMSFrontController() {
        accessControl = new AccessControl();
        cmsDispatcher = new CMSDispatcher();
    }

    public void dispatch(String path, String method, String userRole, Map<String, String> data) {
        System.out.println("→ CMS Request: " + method + " " + path + " [Role: " + userRole + "]");

        // Check permissions
        if (!accessControl.hasPermission(path, userRole)) {
            System.out.println("  ✗ Access denied: Insufficient permissions");
            return;
        }

        // Dispatch to CMS handler
        cmsDispatcher.handle(path, method, data);
    }
}

/**
 * Access control for CMS
 */
class AccessControl {
    public boolean hasPermission(String path, String role) {
        if (path.contains("/settings") && !role.equals("admin")) {
            return false;
        }
        System.out.println("  ✓ Access granted");
        return true;
    }
}

/**
 * CMS request dispatcher
 */
class CMSDispatcher {
    public void handle(String path, String method, Map<String, String> data) {
        if (path.contains("/articles")) {
            if (method.equals("GET")) {
                System.out.println("  [ArticleService] Listing articles");
            } else if (method.equals("POST")) {
                System.out.println("  [ArticleService] Creating article: " + (data != null ? data.get("title") : ""));
            } else if (method.equals("PUT")) {
                System.out.println("  [ArticleService] Publishing article");
            }
        }
    }
}

// ============= Scenario 5: Admin Dashboard =============

/**
 * Admin Dashboard Front Controller
 */
class AdminDashboardFrontController {
    public void serve(String path, String method, String userRole) {
        System.out.println("→ Admin Request: " + method + " " + path + " [" + userRole + "]");

        // Authorization check
        if (!authorize(userRole, path)) {
            System.out.println("  ✗ Unauthorized: Admin privileges required");
            return;
        }

        // Log admin action
        auditLog(path, method, userRole);

        // Handle request
        handleAdminRequest(path, method);
    }

    private boolean authorize(String role, String path) {
        if (path.contains("/delete") && !role.equals("admin")) {
            return false;
        }
        return role.equals("admin") || role.equals("moderator");
    }

    private void auditLog(String path, String method, String userRole) {
        System.out.println("  [AUDIT] User " + userRole + " accessed " + method + " " + path);
    }

    private void handleAdminRequest(String path, String method) {
        if (path.contains("/dashboard")) {
            System.out.println("  [Dashboard] Loading analytics");
        } else if (path.contains("/users")) {
            if (method.equals("DELETE")) {
                System.out.println("  [UserManagement] User deleted");
            } else {
                System.out.println("  [UserManagement] Listing users");
            }
        } else if (path.contains("/settings")) {
            System.out.println("  [Settings] Updating configuration");
        }
    }
}

// ============= Scenario 6: Mobile App Backend =============

/**
 * Mobile request object
 */
class MobileRequest {
    String endpoint;
    String method;
    String appVersion;
    String platform;

    public MobileRequest(String endpoint, String method, String appVersion, String platform) {
        this.endpoint = endpoint;
        this.method = method;
        this.appVersion = appVersion;
        this.platform = platform;
    }
}

/**
 * Mobile Backend Front Controller
 */
class MobileBackendFrontController {
    private String minVersion = "1.0.0";

    public void handle(MobileRequest request) {
        System.out.println("→ Mobile Request: " + request.method + " " + request.endpoint);
        System.out.println("  Platform: " + request.platform + ", Version: " + request.appVersion);

        // Version check
        if (!checkVersion(request.appVersion)) {
            System.out.println("  ✗ App version too old, please update");
            return;
        }

        // Platform-specific handling
        if (request.platform.equals("iOS")) {
            System.out.println("  [iOS Handler] Processing request");
        } else {
            System.out.println("  [Android Handler] Processing request");
        }

        // Route to service
        routeMobileRequest(request.endpoint);
    }

    private boolean checkVersion(String version) {
        return version.compareTo(minVersion) >= 0;
    }

    private void routeMobileRequest(String endpoint) {
        if (endpoint.contains("/sync")) {
            System.out.println("  [SyncService] Synchronizing data");
        } else if (endpoint.contains("/profile")) {
            System.out.println("  [ProfileService] Fetching profile");
        } else if (endpoint.contains("/notifications")) {
            System.out.println("  [NotificationService] Getting notifications");
        }
    }
}

// ============= Scenario 7: Microservices Gateway =============

/**
 * Microservices Gateway (API Gateway pattern)
 */
class MicroservicesGateway {
    private Map<String, String> serviceRegistry;
    private LoadBalancer loadBalancer;

    public MicroservicesGateway() {
        serviceRegistry = new HashMap<>();
        serviceRegistry.put("user-service", "http://users:8081");
        serviceRegistry.put("order-service", "http://orders:8082");
        serviceRegistry.put("payment-service", "http://payments:8083");
        serviceRegistry.put("inventory-service", "http://inventory:8084");
        loadBalancer = new LoadBalancer();
    }

    public void route(String path, String serviceName) {
        System.out.println("→ Gateway routing: " + path + " → " + serviceName);

        // Service discovery
        String serviceUrl = serviceRegistry.get(serviceName);
        if (serviceUrl == null) {
            System.out.println("  ✗ Service not found");
            return;
        }

        // Load balancing
        String instance = loadBalancer.getNextInstance(serviceName);
        System.out.println("  → Forwarding to: " + serviceUrl + instance);

        // Circuit breaker check
        if (checkCircuitBreaker(serviceName)) {
            System.out.println("  ✓ Request forwarded to " + serviceName);
        }
    }

    private boolean checkCircuitBreaker(String serviceName) {
        // Simplified circuit breaker logic
        System.out.println("  [Circuit Breaker] " + serviceName + " is healthy");
        return true;
    }
}

/**
 * Load balancer for microservices
 */
class LoadBalancer {
    private int counter = 0;

    public String getNextInstance(String service) {
        counter++;
        return "/instance-" + (counter % 3 + 1);
    }
}

// ============= Scenario 8: Single Sign-On System =============

/**
 * SSO Front Controller
 */
class SSOFrontController {
    private Map<String, String> tokenStore;

    public SSOFrontController() {
        tokenStore = new HashMap<>();
    }

    public void authenticate(String path, String method, Map<String, String> credentials) {
        System.out.println("→ SSO Request: " + method + " " + path);

        if (path.equals("/login")) {
            handleLogin(credentials);
        } else if (path.equals("/validate")) {
            handleValidation(credentials);
        } else if (path.equals("/logout")) {
            handleLogout(credentials);
        }
    }

    private void handleLogin(Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        System.out.println("  [Auth] Validating credentials for: " + username);

        // Generate SSO token
        String token = "sso-token-abc";
        tokenStore.put(token, username);
        System.out.println("  ✓ Login successful, token: " + token);
    }

    private void handleValidation(Map<String, String> credentials) {
        String token = credentials.get("token");
        if (tokenStore.containsKey(token)) {
            System.out.println("  ✓ Token valid for user: " + tokenStore.get(token));
        } else {
            System.out.println("  ✗ Invalid token");
        }
    }

    private void handleLogout(Map<String, String> credentials) {
        String token = credentials.get("token");
        tokenStore.remove(token);
        System.out.println("  ✓ Logged out successfully");
    }
}

// ============= Scenario 9: Banking Application =============

/**
 * Banking Front Controller
 */
class BankingFrontController {
    private SessionManager sessionManager;
    private FraudDetection fraudDetection;

    public BankingFrontController() {
        sessionManager = new SessionManager();
        fraudDetection = new FraudDetection();
    }

    public void process(String path, String method, Map<String, String> data) {
        System.out.println("→ Banking Request: " + method + " " + path);

        // Session management
        String sessionId = sessionManager.createSession(data.get("accountNumber"));

        // Fraud detection
        if (!fraudDetection.checkFraud(path, data)) {
            System.out.println("  ✗ Suspicious activity detected");
            return;
        }

        // Route to banking service
        routeBankingRequest(path, data);
    }

    private void routeBankingRequest(String path, Map<String, String> data) {
        if (path.contains("/login")) {
            System.out.println("  [AuthService] Login successful");
        } else if (path.contains("/balance")) {
            System.out.println("  [AccountService] Balance: $12,345.67");
        } else if (path.contains("/transfer")) {
            System.out.println("  [TransferService] Transfer $" + data.get("amount") +
                " from " + data.get("from") + " to " + data.get("to"));
        } else if (path.contains("/transactions")) {
            System.out.println("  [TransactionService] Fetching recent transactions");
        }
    }
}

/**
 * Session manager for banking
 */
class SessionManager {
    public String createSession(String accountNumber) {
        String sessionId = "session-" + System.currentTimeMillis();
        System.out.println("  [Session] Created: " + sessionId);
        return sessionId;
    }
}

/**
 * Fraud detection system
 */
class FraudDetection {
    public boolean checkFraud(String path, Map<String, String> data) {
        System.out.println("  [Fraud Detection] Analyzing transaction");
        // Simplified fraud check
        return true;
    }
}

// ============= Scenario 10: Healthcare Portal =============

/**
 * Healthcare Front Controller
 */
class HealthcareFrontController {
    private HIPAACompliance hipaaCompliance;
    private HealthcareRouter healthcareRouter;

    public HealthcareFrontController() {
        hipaaCompliance = new HIPAACompliance();
        healthcareRouter = new HealthcareRouter();
    }

    public void handleHealthRequest(String path, String method, String userType, String userId) {
        System.out.println("→ Healthcare Request: " + method + " " + path);
        System.out.println("  User: " + userId + " [" + userType + "]");

        // HIPAA compliance check
        if (!hipaaCompliance.validateAccess(path, userType, userId)) {
            System.out.println("  ✗ HIPAA Violation: Unauthorized access attempt");
            return;
        }

        // Audit logging (required by HIPAA)
        hipaaCompliance.auditLog(userId, path, method);

        // Route to appropriate service
        healthcareRouter.route(path, userType);
    }
}

/**
 * HIPAA compliance manager
 */
class HIPAACompliance {
    public boolean validateAccess(String path, String userType, String userId) {
        if (path.contains("/admin") && !userType.equals("ADMIN")) {
            return false;
        }
        System.out.println("  [HIPAA] Access validated");
        return true;
    }

    public void auditLog(String userId, String path, String method) {
        System.out.println("  [AUDIT] " + userId + " accessed " + method + " " + path + " at " + new Date());
    }
}

/**
 * Healthcare request router
 */
class HealthcareRouter {
    public void route(String path, String userType) {
        if (path.contains("/appointments")) {
            System.out.println("  [AppointmentService] Fetching appointments");
        } else if (path.contains("/records")) {
            System.out.println("  [MedicalRecordsService] Retrieving patient records (encrypted)");
        } else if (path.contains("/schedule")) {
            System.out.println("  [SchedulingService] Getting doctor schedule");
        } else if (path.contains("/reports")) {
            System.out.println("  [ReportingService] Generating reports");
        }
    }
}
