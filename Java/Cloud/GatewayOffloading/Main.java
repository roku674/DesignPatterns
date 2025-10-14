package Cloud.GatewayOffloading;

import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * Gateway Offloading Pattern Demonstration
 *
 * <p>The Gateway Offloading pattern offloads shared or specialized service functionality
 * to a gateway proxy. This includes SSL termination, authentication, IP whitelisting,
 * rate limiting, caching, and logging.</p>
 *
 * <p>Key Benefits:</p>
 * <ul>
 *   <li>Simplifies backend services by removing cross-cutting concerns</li>
 *   <li>Centralizes security and authentication</li>
 *   <li>Reduces code duplication across services</li>
 *   <li>Improves scalability and maintenance</li>
 * </ul>
 *
 * @author Design Patterns Demo
 * @version 1.0
 */
public class Main {

    /**
     * Request object containing client request data.
     */
    static class Request {
        private String clientIp;
        private String authToken;
        private String path;
        private Map<String, String> headers;
        private String method;

        public Request(String clientIp, String authToken, String path, String method) {
            this.clientIp = clientIp;
            this.authToken = authToken;
            this.path = path;
            this.method = method;
            this.headers = new HashMap<>();
        }

        public String getClientIp() { return clientIp; }
        public String getAuthToken() { return authToken; }
        public String getPath() { return path; }
        public String getMethod() { return method; }
        public Map<String, String> getHeaders() { return headers; }

        public void addHeader(String key, String value) {
            headers.put(key, value);
        }

        @Override
        public String toString() {
            return String.format("%s %s from %s", method, path, clientIp);
        }
    }

    /**
     * Response object containing service response data.
     */
    static class Response {
        private int statusCode;
        private String body;
        private Map<String, String> headers;

        public Response(int statusCode, String body) {
            this.statusCode = statusCode;
            this.body = body;
            this.headers = new HashMap<>();
        }

        public int getStatusCode() { return statusCode; }
        public String getBody() { return body; }
        public Map<String, String> getHeaders() { return headers; }

        public void addHeader(String key, String value) {
            headers.put(key, value);
        }

        @Override
        public String toString() {
            return String.format("Response[%d]: %s", statusCode, body);
        }
    }

    /**
     * SSL Termination handler.
     */
    static class SslTerminationHandler {
        public boolean validateSsl(Request request) {
            boolean hasSecureConnection = request.getHeaders().getOrDefault("X-Forwarded-Proto", "http").equals("https");
            System.out.println("  [SSL] Connection type: " + (hasSecureConnection ? "HTTPS" : "HTTP"));
            return true;
        }

        public void addSecurityHeaders(Response response) {
            response.addHeader("Strict-Transport-Security", "max-age=31536000");
            response.addHeader("X-Content-Type-Options", "nosniff");
            response.addHeader("X-Frame-Options", "DENY");
            System.out.println("  [SSL] Security headers added");
        }
    }

    /**
     * Authentication handler.
     */
    static class AuthenticationHandler {
        private Set<String> validTokens;

        public AuthenticationHandler() {
            validTokens = new HashSet<>(Arrays.asList(
                "token-abc-123",
                "token-def-456",
                "token-ghi-789"
            ));
        }

        public boolean authenticate(Request request) {
            String token = request.getAuthToken();
            if (token == null || token.isEmpty()) {
                System.out.println("  [AUTH] No token provided");
                return false;
            }

            boolean isValid = validTokens.contains(token);
            System.out.println("  [AUTH] Token validation: " + (isValid ? "SUCCESS" : "FAILED"));
            return isValid;
        }

        public String extractUserId(String token) {
            return "user-" + token.hashCode();
        }
    }

    /**
     * IP Whitelisting handler.
     */
    static class IpWhitelistingHandler {
        private Set<String> whitelistedIps;
        private Set<String> blacklistedIps;

        public IpWhitelistingHandler() {
            whitelistedIps = new HashSet<>(Arrays.asList(
                "192.168.1.100",
                "192.168.1.101",
                "10.0.0.50"
            ));
            blacklistedIps = new HashSet<>(Arrays.asList(
                "203.0.113.0"
            ));
        }

        public boolean validateIp(Request request) {
            String ip = request.getClientIp();

            if (blacklistedIps.contains(ip)) {
                System.out.println("  [IP] Blocked (blacklisted): " + ip);
                return false;
            }

            if (!whitelistedIps.contains(ip)) {
                System.out.println("  [IP] Blocked (not whitelisted): " + ip);
                return false;
            }

            System.out.println("  [IP] Allowed: " + ip);
            return true;
        }
    }

    /**
     * Rate limiting handler.
     */
    static class RateLimitingHandler {
        private Map<String, List<Long>> requestTimestamps;
        private int maxRequestsPerMinute;

        public RateLimitingHandler(int maxRequestsPerMinute) {
            this.requestTimestamps = new ConcurrentHashMap<>();
            this.maxRequestsPerMinute = maxRequestsPerMinute;
        }

        public boolean checkRateLimit(Request request) {
            String key = request.getClientIp() + ":" + request.getAuthToken();
            long now = System.currentTimeMillis();
            long oneMinuteAgo = now - 60000;

            requestTimestamps.putIfAbsent(key, new ArrayList<>());
            List<Long> timestamps = requestTimestamps.get(key);

            timestamps.removeIf(timestamp -> timestamp < oneMinuteAgo);

            if (timestamps.size() >= maxRequestsPerMinute) {
                System.out.println("  [RATE] Limit exceeded: " + timestamps.size() + " requests");
                return false;
            }

            timestamps.add(now);
            System.out.println("  [RATE] Allowed: " + timestamps.size() + "/" + maxRequestsPerMinute + " requests");
            return true;
        }
    }

    /**
     * Caching handler.
     */
    static class CachingHandler {
        private Map<String, CacheEntry> cache;

        static class CacheEntry {
            String data;
            long timestamp;
            long ttlMs;

            CacheEntry(String data, long ttlMs) {
                this.data = data;
                this.timestamp = System.currentTimeMillis();
                this.ttlMs = ttlMs;
            }

            boolean isExpired() {
                return System.currentTimeMillis() - timestamp > ttlMs;
            }
        }

        public CachingHandler() {
            this.cache = new ConcurrentHashMap<>();
        }

        public String get(String key) {
            CacheEntry entry = cache.get(key);
            if (entry != null && !entry.isExpired()) {
                System.out.println("  [CACHE] HIT: " + key);
                return entry.data;
            }
            System.out.println("  [CACHE] MISS: " + key);
            return null;
        }

        public void put(String key, String data, long ttlMs) {
            cache.put(key, new CacheEntry(data, ttlMs));
            System.out.println("  [CACHE] Stored: " + key);
        }

        public void invalidate(String pattern) {
            Pattern p = Pattern.compile(pattern);
            cache.keySet().removeIf(key -> p.matcher(key).matches());
            System.out.println("  [CACHE] Invalidated: " + pattern);
        }
    }

    /**
     * Logging handler.
     */
    static class LoggingHandler {
        public void logRequest(Request request) {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            System.out.println("  [LOG] " + timestamp + " - Request: " + request);
        }

        public void logResponse(Response response, long durationMs) {
            System.out.println("  [LOG] Response: " + response.getStatusCode() + " (" + durationMs + "ms)");
        }

        public void logError(String message) {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            System.out.println("  [LOG] ERROR " + timestamp + " - " + message);
        }
    }

    /**
     * Backend service that handles business logic.
     */
    static class BackendService {
        public Response handleRequest(Request request) {
            if (request.getPath().equals("/api/users")) {
                return new Response(200, "{\"users\": [\"user1\", \"user2\"]}");
            } else if (request.getPath().equals("/api/products")) {
                return new Response(200, "{\"products\": [\"product1\", \"product2\"]}");
            } else if (request.getPath().equals("/api/orders")) {
                return new Response(200, "{\"orders\": [\"order1\", \"order2\"]}");
            }
            return new Response(404, "{\"error\": \"Not found\"}");
        }
    }

    /**
     * API Gateway that offloads cross-cutting concerns.
     */
    static class ApiGateway {
        private SslTerminationHandler sslHandler;
        private AuthenticationHandler authHandler;
        private IpWhitelistingHandler ipHandler;
        private RateLimitingHandler rateLimitHandler;
        private CachingHandler cacheHandler;
        private LoggingHandler logHandler;
        private BackendService backendService;

        public ApiGateway() {
            this.sslHandler = new SslTerminationHandler();
            this.authHandler = new AuthenticationHandler();
            this.ipHandler = new IpWhitelistingHandler();
            this.rateLimitHandler = new RateLimitingHandler(10);
            this.cacheHandler = new CachingHandler();
            this.logHandler = new LoggingHandler();
            this.backendService = new BackendService();
        }

        public Response processRequest(Request request) {
            long startTime = System.currentTimeMillis();
            logHandler.logRequest(request);

            // SSL Termination
            if (!sslHandler.validateSsl(request)) {
                Response response = new Response(400, "{\"error\": \"SSL required\"}");
                logHandler.logResponse(response, System.currentTimeMillis() - startTime);
                return response;
            }

            // IP Whitelisting
            if (!ipHandler.validateIp(request)) {
                Response response = new Response(403, "{\"error\": \"IP not allowed\"}");
                logHandler.logResponse(response, System.currentTimeMillis() - startTime);
                return response;
            }

            // Authentication
            if (!authHandler.authenticate(request)) {
                Response response = new Response(401, "{\"error\": \"Unauthorized\"}");
                logHandler.logResponse(response, System.currentTimeMillis() - startTime);
                return response;
            }

            // Rate Limiting
            if (!rateLimitHandler.checkRateLimit(request)) {
                Response response = new Response(429, "{\"error\": \"Rate limit exceeded\"}");
                logHandler.logResponse(response, System.currentTimeMillis() - startTime);
                return response;
            }

            // Caching
            String cacheKey = request.getMethod() + ":" + request.getPath();
            String cachedResponse = cacheHandler.get(cacheKey);
            if (cachedResponse != null) {
                Response response = new Response(200, cachedResponse);
                sslHandler.addSecurityHeaders(response);
                logHandler.logResponse(response, System.currentTimeMillis() - startTime);
                return response;
            }

            // Forward to backend
            Response response = backendService.handleRequest(request);

            // Cache successful GET requests
            if (request.getMethod().equals("GET") && response.getStatusCode() == 200) {
                cacheHandler.put(cacheKey, response.getBody(), 60000);
            }

            sslHandler.addSecurityHeaders(response);
            logHandler.logResponse(response, System.currentTimeMillis() - startTime);
            return response;
        }
    }

    private static void printSection(String title) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println(title);
        System.out.println("=".repeat(60));
    }

    /**
     * Main method demonstrating the Gateway Offloading pattern with 10 scenarios.
     *
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        System.out.println("=== Gateway Offloading Pattern Demonstration ===\n");
        System.out.println("This pattern offloads shared functionality to a gateway proxy.");
        System.out.println("Timestamp: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        ApiGateway gateway = new ApiGateway();

        // Scenario 1: Successful request with all validations
        printSection("Scenario 1: Valid Request with All Checks");
        Request req1 = new Request("192.168.1.100", "token-abc-123", "/api/users", "GET");
        req1.addHeader("X-Forwarded-Proto", "https");
        Response resp1 = gateway.processRequest(req1);
        System.out.println("Result: " + resp1);

        // Scenario 2: Request without authentication
        printSection("Scenario 2: Unauthenticated Request");
        Request req2 = new Request("192.168.1.100", "", "/api/users", "GET");
        req2.addHeader("X-Forwarded-Proto", "https");
        Response resp2 = gateway.processRequest(req2);
        System.out.println("Result: " + resp2);

        // Scenario 3: Request from blacklisted IP
        printSection("Scenario 3: Blocked IP Address");
        Request req3 = new Request("203.0.113.0", "token-abc-123", "/api/users", "GET");
        req3.addHeader("X-Forwarded-Proto", "https");
        Response resp3 = gateway.processRequest(req3);
        System.out.println("Result: " + resp3);

        // Scenario 4: Request with invalid token
        printSection("Scenario 4: Invalid Authentication Token");
        Request req4 = new Request("192.168.1.100", "invalid-token", "/api/users", "GET");
        req4.addHeader("X-Forwarded-Proto", "https");
        Response resp4 = gateway.processRequest(req4);
        System.out.println("Result: " + resp4);

        // Scenario 5: Cached response
        printSection("Scenario 5: Cache Hit on Second Request");
        System.out.println("First request (cache miss):");
        Request req5a = new Request("192.168.1.100", "token-abc-123", "/api/products", "GET");
        req5a.addHeader("X-Forwarded-Proto", "https");
        gateway.processRequest(req5a);

        System.out.println("\nSecond request (cache hit):");
        Request req5b = new Request("192.168.1.100", "token-abc-123", "/api/products", "GET");
        req5b.addHeader("X-Forwarded-Proto", "https");
        Response resp5 = gateway.processRequest(req5b);
        System.out.println("Result: " + resp5);

        // Scenario 6: Rate limiting
        printSection("Scenario 6: Rate Limiting in Action");
        System.out.println("Making 12 rapid requests (limit is 10/minute):");
        for (int i = 1; i <= 12; i++) {
            System.out.println("Request " + i + ":");
            Request req = new Request("192.168.1.100", "token-abc-123", "/api/orders", "GET");
            req.addHeader("X-Forwarded-Proto", "https");
            Response resp = gateway.processRequest(req);
            if (resp.getStatusCode() == 429) {
                System.out.println(">>> Rate limited at request " + i);
                break;
            }
        }

        // Scenario 7: Different endpoints
        printSection("Scenario 7: Multiple Endpoint Access");
        String[] endpoints = {"/api/users", "/api/products", "/api/orders", "/api/invalid"};
        for (String endpoint : endpoints) {
            System.out.println("\nAccessing: " + endpoint);
            Request req = new Request("192.168.1.101", "token-def-456", endpoint, "GET");
            req.addHeader("X-Forwarded-Proto", "https");
            Response resp = gateway.processRequest(req);
            System.out.println("Status: " + resp.getStatusCode());
        }

        // Scenario 8: SSL termination
        printSection("Scenario 8: SSL Termination and Security Headers");
        Request req8 = new Request("10.0.0.50", "token-ghi-789", "/api/users", "GET");
        req8.addHeader("X-Forwarded-Proto", "https");
        Response resp8 = gateway.processRequest(req8);
        System.out.println("Security headers: " + resp8.getHeaders());

        // Scenario 9: Non-whitelisted IP
        printSection("Scenario 9: Non-Whitelisted IP Access Attempt");
        Request req9 = new Request("172.16.0.1", "token-abc-123", "/api/users", "GET");
        req9.addHeader("X-Forwarded-Proto", "https");
        Response resp9 = gateway.processRequest(req9);
        System.out.println("Result: " + resp9);

        // Scenario 10: Summary
        printSection("Scenario 10: Pattern Summary");
        System.out.println("Gateway Offloading Features Demonstrated:");
        System.out.println("1. SSL Termination - Validates HTTPS and adds security headers");
        System.out.println("2. Authentication - Validates tokens before forwarding");
        System.out.println("3. IP Whitelisting - Blocks unauthorized IP addresses");
        System.out.println("4. Rate Limiting - Prevents abuse with request limits");
        System.out.println("5. Caching - Reduces backend load for repeated requests");
        System.out.println("6. Logging - Centralized request/response logging");
        System.out.println("\nBenefits:");
        System.out.println("- Backend services focus on business logic only");
        System.out.println("- Cross-cutting concerns handled in one place");
        System.out.println("- Easier to add new services without duplicating logic");
        System.out.println("- Improved security and consistency");
        System.out.println("- Better performance through caching and optimization");

        System.out.println("\n=== Pattern Demonstration Complete ===");
    }
}
