package Microservices.AccessToken;

import java.time.Instant;
import java.util.*;

/**
 * Access Token Pattern - Main Demonstration
 *
 * This pattern demonstrates secure authentication and authorization in microservices
 * using access tokens (JWT, OAuth2, etc.) to propagate user identity and permissions
 * across service boundaries without sharing session state.
 *
 * Key Concepts:
 * - Token-based authentication
 * - Stateless authorization
 * - JWT (JSON Web Tokens)
 * - Token validation and verification
 * - Permission-based access control
 * - Token expiration and refresh
 * - Token revocation
 * - Cross-service authentication
 *
 * Pattern Benefits:
 * - Stateless authentication across services
 * - Reduced database lookups for auth
 * - Scalable security architecture
 * - Fine-grained permission control
 * - Support for distributed systems
 * - Easy integration with API gateways
 * - Standard protocol support (OAuth2, OpenID Connect)
 * - Improved performance
 *
 * @author Design Patterns Collection
 * @version 2.0
 */
public class Main {

    /**
     * Main demonstration method showing various access token scenarios
     * in a microservices architecture.
     *
     * @param args Command line arguments (not used)
     */
    public static void main(String[] args) {
        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║          Access Token Pattern Demonstration                  ║");
        System.out.println("║      Secure Microservices Authentication & Authorization     ║");
        System.out.println("╚══════════════════════════════════════════════════════════════╝\n");

        // Initialize components
        TokenService tokenService = new TokenService();
        AuthorizationService authzService = new AuthorizationService();
        TokenValidator validator = new TokenValidator();
        RefreshTokenService refreshService = new RefreshTokenService();

        // Scenario 1: Basic Token Generation and Validation
        demonstrateBasicTokenOperations(tokenService, validator);

        // Scenario 2: Role-Based Access Control (RBAC)
        demonstrateRoleBasedAccess(tokenService, authzService);

        // Scenario 3: Permission-Based Access Control
        demonstratePermissionBasedAccess(tokenService, authzService);

        // Scenario 4: Token Expiration and Refresh
        demonstrateTokenRefresh(tokenService, refreshService);

        // Scenario 5: Service-to-Service Authentication
        demonstrateServiceToServiceAuth(tokenService);

        // Scenario 6: Token Revocation
        demonstrateTokenRevocation(tokenService, validator);

        // Scenario 7: Multi-Tenant Token Management
        demonstrateMultiTenantTokens(tokenService);

        // Scenario 8: API Gateway Token Validation
        demonstrateApiGatewayIntegration(tokenService, validator);

        // Scenario 9: Token Claims and Custom Attributes
        demonstrateCustomClaims(tokenService);

        // Scenario 10: Complete Authentication Flow
        demonstrateCompleteAuthFlow(tokenService, authzService, refreshService, validator);

        // Display security summary
        displaySecuritySummary();
    }

    /**
     * Scenario 1: Demonstrates basic token generation and validation
     */
    private static void demonstrateBasicTokenOperations(
            TokenService tokenService, TokenValidator validator) {

        System.out.println("\n" + "=".repeat(70));
        System.out.println("Scenario 1: Basic Token Generation and Validation");
        System.out.println("=".repeat(70));

        // Generate token for user
        String userId = "user123";
        String[] permissions = {"read:orders", "write:orders"};

        AccessToken token = tokenService.generateToken(userId, permissions);
        System.out.println("Generated Token:");
        System.out.println("  Token ID: " + token.getTokenId());
        System.out.println("  User ID: " + token.getUserId());
        System.out.println("  Permissions: " + Arrays.toString(token.getPermissions()));
        System.out.println("  Expires: " + token.getExpiryTime());

        // Validate token
        System.out.println("\nValidating token...");
        ValidationResult result = validator.validateToken(token.getTokenString());
        System.out.println("  Valid: " + result.isValid());
        System.out.println("  Reason: " + result.getMessage());

        System.out.println("\n✓ Basic token operations completed");
    }

    /**
     * Scenario 2: Demonstrates Role-Based Access Control (RBAC)
     */
    private static void demonstrateRoleBasedAccess(
            TokenService tokenService, AuthorizationService authzService) {

        System.out.println("\n" + "=".repeat(70));
        System.out.println("Scenario 2: Role-Based Access Control (RBAC)");
        System.out.println("=".repeat(70));

        // Define different user roles
        UserRole[] roles = {
            new UserRole("user456", "CUSTOMER", new String[]{"read:products", "write:cart"}),
            new UserRole("admin789", "ADMIN", new String[]{"read:*", "write:*", "delete:*"}),
            new UserRole("support101", "SUPPORT", new String[]{"read:orders", "update:orders"})
        };

        for (UserRole role : roles) {
            AccessToken token = tokenService.generateTokenWithRole(
                role.userId, role.role, role.permissions);

            System.out.println("\nUser: " + role.userId + " (Role: " + role.role + ")");

            // Test various operations
            testOperation(authzService, token, "read:products");
            testOperation(authzService, token, "delete:users");
            testOperation(authzService, token, "write:cart");
        }

        System.out.println("\n✓ Role-based access control demonstrated");
    }

    /**
     * Scenario 3: Demonstrates fine-grained permission-based access control
     */
    private static void demonstratePermissionBasedAccess(
            TokenService tokenService, AuthorizationService authzService) {

        System.out.println("\n" + "=".repeat(70));
        System.out.println("Scenario 3: Permission-Based Access Control");
        System.out.println("=".repeat(70));

        // Create token with specific permissions
        String userId = "user789";
        String[] permissions = {
            "read:orders:own",
            "write:orders:own",
            "read:products:all",
            "read:inventory:warehouse1"
        };

        AccessToken token = tokenService.generateToken(userId, permissions);

        // Test resource-specific permissions
        System.out.println("\nTesting resource-specific permissions:");
        testResourcePermission(authzService, token, "orders", "123", "read");
        testResourcePermission(authzService, token, "orders", "123", "write");
        testResourcePermission(authzService, token, "orders", "456", "delete");
        testResourcePermission(authzService, token, "inventory", "warehouse1", "read");
        testResourcePermission(authzService, token, "inventory", "warehouse2", "read");

        System.out.println("\n✓ Permission-based access control demonstrated");
    }

    /**
     * Scenario 4: Demonstrates token expiration and refresh mechanism
     */
    private static void demonstrateTokenRefresh(
            TokenService tokenService, RefreshTokenService refreshService) {

        System.out.println("\n" + "=".repeat(70));
        System.out.println("Scenario 4: Token Expiration and Refresh");
        System.out.println("=".repeat(70));

        String userId = "user999";
        String[] permissions = {"read:data", "write:data"};

        // Generate short-lived access token
        AccessToken accessToken = tokenService.generateShortLivedToken(
            userId, permissions, 5); // 5 minute expiry

        // Generate long-lived refresh token
        RefreshToken refreshToken = refreshService.generateRefreshToken(
            userId, 30); // 30 day expiry

        System.out.println("Generated tokens:");
        System.out.println("  Access Token expires in: 5 minutes");
        System.out.println("  Refresh Token expires in: 30 days");

        // Simulate token expiration
        System.out.println("\nSimulating token expiration...");
        accessToken.simulateExpiration();

        System.out.println("Access token expired: " + accessToken.isExpired());

        // Refresh the access token
        System.out.println("\nRefreshing access token using refresh token...");
        AccessToken newAccessToken = refreshService.refreshAccessToken(refreshToken);

        System.out.println("New access token generated:");
        System.out.println("  Token ID: " + newAccessToken.getTokenId());
        System.out.println("  Valid: " + !newAccessToken.isExpired());

        System.out.println("\n✓ Token refresh mechanism demonstrated");
    }

    /**
     * Scenario 5: Demonstrates service-to-service authentication
     */
    private static void demonstrateServiceToServiceAuth(TokenService tokenService) {

        System.out.println("\n" + "=".repeat(70));
        System.out.println("Scenario 5: Service-to-Service Authentication");
        System.out.println("=".repeat(70));

        // Service tokens for internal communication
        String[][] services = {
            {"OrderService", "read:inventory,write:payments"},
            {"PaymentService", "read:orders,write:transactions"},
            {"InventoryService", "read:products,write:stock"}
        };

        System.out.println("Generating service tokens:");
        for (String[] service : services) {
            String serviceName = service[0];
            String[] perms = service[1].split(",");

            ServiceToken serviceToken = tokenService.generateServiceToken(
                serviceName, perms);

            System.out.println("\n" + serviceName + ":");
            System.out.println("  Service Token: " + serviceToken.getTokenId());
            System.out.println("  Scope: " + Arrays.toString(perms));
            System.out.println("  Type: " + serviceToken.getType());
        }

        System.out.println("\n✓ Service-to-service authentication demonstrated");
    }

    /**
     * Scenario 6: Demonstrates token revocation for security
     */
    private static void demonstrateTokenRevocation(
            TokenService tokenService, TokenValidator validator) {

        System.out.println("\n" + "=".repeat(70));
        System.out.println("Scenario 6: Token Revocation");
        System.out.println("=".repeat(70));

        String userId = "user666";
        AccessToken token = tokenService.generateToken(
            userId, new String[]{"read:data"});

        System.out.println("Token created: " + token.getTokenId());

        // Validate before revocation
        ValidationResult result1 = validator.validateToken(token.getTokenString());
        System.out.println("Validation before revocation: " + result1.isValid());

        // Revoke token (e.g., user logs out, security breach, etc.)
        System.out.println("\nRevoking token (user logout)...");
        tokenService.revokeToken(token.getTokenId());

        // Validate after revocation
        ValidationResult result2 = validator.validateToken(token.getTokenString());
        System.out.println("Validation after revocation: " + result2.isValid());
        System.out.println("Reason: " + result2.getMessage());

        // Revoke all tokens for user (e.g., password change)
        System.out.println("\nRevoking all tokens for user...");
        int revokedCount = tokenService.revokeAllUserTokens(userId);
        System.out.println("Tokens revoked: " + revokedCount);

        System.out.println("\n✓ Token revocation demonstrated");
    }

    /**
     * Scenario 7: Demonstrates multi-tenant token management
     */
    private static void demonstrateMultiTenantTokens(TokenService tokenService) {

        System.out.println("\n" + "=".repeat(70));
        System.out.println("Scenario 7: Multi-Tenant Token Management");
        System.out.println("=".repeat(70));

        // Different tenants with isolated data
        String[][] tenants = {
            {"tenant-A", "userA1", "read:orders:tenantA,write:orders:tenantA"},
            {"tenant-B", "userB1", "read:orders:tenantB,write:orders:tenantB"},
            {"tenant-C", "userC1", "read:orders:tenantC"}
        };

        for (String[] tenant : tenants) {
            String tenantId = tenant[0];
            String userId = tenant[1];
            String[] permissions = tenant[2].split(",");

            TenantToken token = tokenService.generateTenantToken(
                tenantId, userId, permissions);

            System.out.println("\nTenant: " + tenantId);
            System.out.println("  User: " + userId);
            System.out.println("  Token includes tenant context: " + token.getTenantId());
            System.out.println("  Data isolation enforced: Yes");
        }

        System.out.println("\n✓ Multi-tenant token management demonstrated");
    }

    /**
     * Scenario 8: Demonstrates API Gateway token validation
     */
    private static void demonstrateApiGatewayIntegration(
            TokenService tokenService, TokenValidator validator) {

        System.out.println("\n" + "=".repeat(70));
        System.out.println("Scenario 8: API Gateway Token Validation");
        System.out.println("=".repeat(70));

        // Simulate API Gateway validating incoming requests
        ApiGateway gateway = new ApiGateway(validator);

        // Valid request
        AccessToken validToken = tokenService.generateToken(
            "user111", new String[]{"api:access"});

        Request request1 = new Request("/api/products", "GET", validToken);
        gateway.processRequest(request1);

        // Invalid token
        Request request2 = new Request("/api/orders", "POST", null);
        gateway.processRequest(request2);

        // Expired token
        AccessToken expiredToken = tokenService.generateShortLivedToken(
            "user222", new String[]{"api:access"}, 0);
        expiredToken.simulateExpiration();

        Request request3 = new Request("/api/users", "GET", expiredToken);
        gateway.processRequest(request3);

        System.out.println("\n✓ API Gateway integration demonstrated");
    }

    /**
     * Scenario 9: Demonstrates custom claims and attributes in tokens
     */
    private static void demonstrateCustomClaims(TokenService tokenService) {

        System.out.println("\n" + "=".repeat(70));
        System.out.println("Scenario 9: Custom Claims and Attributes");
        System.out.println("=".repeat(70));

        Map<String, Object> customClaims = new HashMap<>();
        customClaims.put("department", "Engineering");
        customClaims.put("level", 5);
        customClaims.put("region", "US-West");
        customClaims.put("features", Arrays.asList("beta-feature", "premium-access"));

        AccessToken token = tokenService.generateTokenWithClaims(
            "user333",
            new String[]{"read:data"},
            customClaims
        );

        System.out.println("Token with custom claims:");
        System.out.println("  User ID: " + token.getUserId());
        System.out.println("  Custom Claims:");
        token.getCustomClaims().forEach((key, value) ->
            System.out.println("    " + key + ": " + value));

        System.out.println("\n✓ Custom claims demonstrated");
    }

    /**
     * Scenario 10: Demonstrates complete authentication flow
     */
    private static void demonstrateCompleteAuthFlow(
            TokenService tokenService,
            AuthorizationService authzService,
            RefreshTokenService refreshService,
            TokenValidator validator) {

        System.out.println("\n" + "=".repeat(70));
        System.out.println("Scenario 10: Complete Authentication Flow");
        System.out.println("=".repeat(70));

        String username = "john.doe@example.com";
        String password = "securePassword123";

        // Step 1: User Login
        System.out.println("Step 1: User Login");
        System.out.println("  Username: " + username);
        AuthenticationResult authResult = authenticateUser(username, password);

        if (!authResult.isSuccess()) {
            System.out.println("  ✗ Authentication failed");
            return;
        }

        System.out.println("  ✓ Authentication successful");

        // Step 2: Generate Tokens
        System.out.println("\nStep 2: Generate Tokens");
        String userId = authResult.getUserId();
        String[] permissions = authResult.getPermissions();

        AccessToken accessToken = tokenService.generateToken(userId, permissions);
        RefreshToken refreshToken = refreshService.generateRefreshToken(userId, 30);

        System.out.println("  ✓ Access token generated");
        System.out.println("  ✓ Refresh token generated");

        // Step 3: Access Protected Resource
        System.out.println("\nStep 3: Access Protected Resource");
        ValidationResult validation = validator.validateToken(accessToken.getTokenString());

        if (validation.isValid()) {
            boolean authorized = authzService.checkPermission(
                accessToken, "read:protected-resource");
            System.out.println("  ✓ Token valid");
            System.out.println("  Authorization: " + (authorized ? "✓ GRANTED" : "✗ DENIED"));
        }

        // Step 4: Token Refresh
        System.out.println("\nStep 4: Token Refresh (after expiration)");
        accessToken.simulateExpiration();
        System.out.println("  Access token expired");

        AccessToken newAccessToken = refreshService.refreshAccessToken(refreshToken);
        System.out.println("  ✓ New access token generated");

        // Step 5: User Logout
        System.out.println("\nStep 5: User Logout");
        tokenService.revokeAllUserTokens(userId);
        System.out.println("  ✓ All tokens revoked");

        System.out.println("\n✓ Complete authentication flow demonstrated");
    }

    /**
     * Helper method to test authorization for an operation
     */
    private static void testOperation(AuthorizationService authzService,
                                      AccessToken token, String permission) {
        boolean allowed = authzService.checkPermission(token, permission);
        System.out.println("  " + permission + ": " + (allowed ? "✓ ALLOWED" : "✗ DENIED"));
    }

    /**
     * Helper method to test resource-specific permissions
     */
    private static void testResourcePermission(AuthorizationService authzService,
                                                AccessToken token, String resource,
                                                String resourceId, String action) {
        boolean allowed = authzService.checkResourcePermission(
            token, resource, resourceId, action);
        System.out.println("  " + action + ":" + resource + ":" + resourceId +
            " -> " + (allowed ? "✓ ALLOWED" : "✗ DENIED"));
    }

    /**
     * Simulates user authentication
     */
    private static AuthenticationResult authenticateUser(String username, String password) {
        // In real implementation, this would verify credentials against a database
        return new AuthenticationResult(true, "user-" + username.hashCode(),
            new String[]{"read:data", "write:data"});
    }

    /**
     * Displays security best practices summary
     */
    private static void displaySecuritySummary() {
        System.out.println("\n" + "═".repeat(70));
        System.out.println("SECURITY SUMMARY");
        System.out.println("═".repeat(70));

        System.out.println("\nKey Security Practices:");
        System.out.println("  • Use short-lived access tokens (5-15 minutes)");
        System.out.println("  • Implement token refresh mechanism");
        System.out.println("  • Always validate tokens on each request");
        System.out.println("  • Use HTTPS for token transmission");
        System.out.println("  • Implement token revocation");
        System.out.println("  • Store tokens securely (HttpOnly cookies, secure storage)");
        System.out.println("  • Use strong signing algorithms (RS256, ES256)");
        System.out.println("  • Implement rate limiting on token endpoints");
        System.out.println("  • Log and monitor authentication events");
        System.out.println("  • Rotate signing keys regularly");

        System.out.println("\n" + "═".repeat(70));
        System.out.println("Pattern Benefits:");
        System.out.println("  • Stateless authentication improves scalability");
        System.out.println("  • No session storage required");
        System.out.println("  • Easy to implement across microservices");
        System.out.println("  • Standard protocols (OAuth2, JWT)");
        System.out.println("  • Fine-grained access control");
        System.out.println("═".repeat(70));
    }

    /**
     * Helper class for user role information
     */
    private static class UserRole {
        String userId;
        String role;
        String[] permissions;

        UserRole(String userId, String role, String[] permissions) {
            this.userId = userId;
            this.role = role;
            this.permissions = permissions;
        }
    }
}
