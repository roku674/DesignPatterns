package Cloud.FederatedIdentity;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.time.Instant;
import java.time.Duration;
import java.util.function.Function;

/**
 * FederatedIdentity Pattern Demonstration
 *
 * This pattern delegates authentication to an external identity provider,
 * enabling single sign-on (SSO) across multiple applications and services.
 * Users authenticate once with their identity provider and can access
 * multiple applications without re-authenticating. It demonstrates:
 * - External identity provider integration
 * - OAuth 2.0 and OpenID Connect flows
 * - Token-based authentication
 * - Single Sign-On (SSO)
 * - Multi-provider support
 * - Token validation and refresh
 * - Claims-based authorization
 * - Session management
 *
 * Key Benefits:
 * - Simplified authentication
 * - Enhanced security
 * - Better user experience
 * - Centralized identity management
 *
 * @author Design Patterns Collection
 * @version 2.0
 */
public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== FederatedIdentity Pattern Demo ===\n");

        // Scenario 1: Basic Federated Authentication
        demonstrateBasicFederatedAuth();

        // Scenario 2: OAuth 2.0 Authorization Flow
        demonstrateOAuth2Flow();

        // Scenario 3: Multi-Provider Support
        demonstrateMultiProvider();

        // Scenario 4: Token Validation and Claims
        demonstrateTokenValidation();

        // Scenario 5: Single Sign-On (SSO)
        demonstrateSingleSignOn();

        // Scenario 6: Token Refresh
        demonstrateTokenRefresh();

        // Scenario 7: Claims-Based Authorization
        demonstrateClaimsAuthorization();

        // Scenario 8: Session Management
        demonstrateSessionManagement();

        // Scenario 9: Async Authentication
        demonstrateAsyncAuthentication();

        // Scenario 10: Federation with Resilience
        demonstrateFederationResilience();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Demonstrates basic federated authentication
     */
    private static void demonstrateBasicFederatedAuth() {
        System.out.println("Scenario 1: Basic Federated Authentication");
        System.out.println("------------------------------------------");

        IdentityProvider idp = new IdentityProvider("GoogleIDP");
        FederatedAuthService authService = new FederatedAuthService(idp);

        // User authenticates via identity provider
        String userId = "user@example.com";
        AuthenticationResult result = authService.authenticate(userId, "password123");

        if (result.isSuccess()) {
            System.out.println("Authentication successful!");
            System.out.println("Access Token: " + result.getAccessToken().substring(0, 20) + "...");
            System.out.println("User ID: " + result.getUserId());
        } else {
            System.out.println("Authentication failed: " + result.getErrorMessage());
        }
        System.out.println();
    }

    /**
     * Scenario 2: Demonstrates OAuth 2.0 authorization flow
     */
    private static void demonstrateOAuth2Flow() {
        System.out.println("Scenario 2: OAuth 2.0 Authorization Flow");
        System.out.println("----------------------------------------");

        OAuth2Provider oauth2 = new OAuth2Provider("OAuth2-IDP");

        // Step 1: Get authorization URL
        String authUrl = oauth2.getAuthorizationUrl("client-123", "https://app.example.com/callback",
                                                    Arrays.asList("read", "write"));
        System.out.println("Step 1 - Authorization URL: " + authUrl);

        // Step 2: User authorizes (simulated)
        String authCode = oauth2.simulateUserAuthorization("user@example.com");
        System.out.println("Step 2 - Authorization Code: " + authCode);

        // Step 3: Exchange code for token
        TokenResponse tokenResponse = oauth2.exchangeCodeForToken(authCode, "client-123", "client-secret");
        System.out.println("Step 3 - Access Token: " + tokenResponse.getAccessToken().substring(0, 20) + "...");
        System.out.println("Token Type: " + tokenResponse.getTokenType());
        System.out.println("Expires In: " + tokenResponse.getExpiresIn() + " seconds");
        System.out.println();
    }

    /**
     * Scenario 3: Demonstrates multi-provider support
     */
    private static void demonstrateMultiProvider() {
        System.out.println("Scenario 3: Multi-Provider Support");
        System.out.println("----------------------------------");

        MultiProviderAuthService multiAuth = new MultiProviderAuthService();

        // Register multiple providers
        multiAuth.registerProvider("google", new IdentityProvider("Google"));
        multiAuth.registerProvider("microsoft", new IdentityProvider("Microsoft"));
        multiAuth.registerProvider("github", new IdentityProvider("GitHub"));

        // Authenticate with different providers
        AuthenticationResult googleAuth = multiAuth.authenticateWithProvider("google",
                                                                            "user@gmail.com", "pass123");
        System.out.println("Google auth: " + (googleAuth.isSuccess() ? "Success" : "Failed"));

        AuthenticationResult msAuth = multiAuth.authenticateWithProvider("microsoft",
                                                                         "user@outlook.com", "pass456");
        System.out.println("Microsoft auth: " + (msAuth.isSuccess() ? "Success" : "Failed"));

        System.out.println("Active providers: " + multiAuth.getProviderCount());
        System.out.println();
    }

    /**
     * Scenario 4: Demonstrates token validation and claims extraction
     */
    private static void demonstrateTokenValidation() {
        System.out.println("Scenario 4: Token Validation and Claims");
        System.out.println("---------------------------------------");

        TokenValidator validator = new TokenValidator();
        JwtToken token = JwtToken.create("user@example.com",
                                        Map.of("role", "admin", "department", "engineering"));

        // Validate token
        ValidationResult validationResult = validator.validate(token);
        System.out.println("Token valid: " + validationResult.isValid());

        if (validationResult.isValid()) {
            // Extract claims
            Map<String, String> claims = token.getClaims();
            System.out.println("Claims:");
            claims.forEach((key, value) ->
                System.out.println("  " + key + ": " + value)
            );
        }
        System.out.println();
    }

    /**
     * Scenario 5: Demonstrates Single Sign-On (SSO) across applications
     */
    private static void demonstrateSingleSignOn() {
        System.out.println("Scenario 5: Single Sign-On (SSO)");
        System.out.println("--------------------------------");

        SSOManager ssoManager = new SSOManager();
        IdentityProvider idp = new IdentityProvider("EnterpriseIDP");

        // User authenticates once
        String userId = "employee@company.com";
        SSOSession session = ssoManager.createSession(idp, userId, "password");
        System.out.println("SSO session created: " + session.getSessionId());

        // Access multiple applications with same session
        boolean app1Access = ssoManager.validateSessionForApp(session.getSessionId(), "App1");
        System.out.println("App1 access: " + app1Access);

        boolean app2Access = ssoManager.validateSessionForApp(session.getSessionId(), "App2");
        System.out.println("App2 access: " + app2Access);

        boolean app3Access = ssoManager.validateSessionForApp(session.getSessionId(), "App3");
        System.out.println("App3 access: " + app3Access);

        System.out.println("User authenticated to " + session.getAccessedApps().size() + " applications");
        System.out.println();
    }

    /**
     * Scenario 6: Demonstrates token refresh mechanism
     */
    private static void demonstrateTokenRefresh() throws InterruptedException {
        System.out.println("Scenario 6: Token Refresh");
        System.out.println("-------------------------");

        RefreshableTokenProvider tokenProvider = new RefreshableTokenProvider();

        // Get initial token with short expiry
        RefreshableToken token = tokenProvider.issueToken("user@example.com", 100); // 100ms expiry
        System.out.println("Initial token issued");
        System.out.println("Expires at: " + token.getExpiresAt());

        // Wait for token to expire
        Thread.sleep(150);
        System.out.println("Token expired: " + token.isExpired());

        // Refresh token
        RefreshableToken newToken = tokenProvider.refreshToken(token.getRefreshToken());
        System.out.println("Token refreshed");
        System.out.println("New token expired: " + newToken.isExpired());
        System.out.println();
    }

    /**
     * Scenario 7: Demonstrates claims-based authorization
     */
    private static void demonstrateClaimsAuthorization() {
        System.out.println("Scenario 7: Claims-Based Authorization");
        System.out.println("--------------------------------------");

        ClaimsAuthorizationService authzService = new ClaimsAuthorizationService();

        // Create user with claims
        JwtToken adminToken = JwtToken.create("admin@example.com",
            Map.of("role", "admin", "permissions", "read,write,delete"));

        JwtToken userToken = JwtToken.create("user@example.com",
            Map.of("role", "user", "permissions", "read"));

        // Check permissions
        boolean adminCanDelete = authzService.hasPermission(adminToken, "delete");
        System.out.println("Admin can delete: " + adminCanDelete);

        boolean userCanDelete = authzService.hasPermission(userToken, "delete");
        System.out.println("User can delete: " + userCanDelete);

        boolean userCanRead = authzService.hasPermission(userToken, "read");
        System.out.println("User can read: " + userCanRead);

        // Role-based checks
        boolean isAdmin = authzService.hasRole(adminToken, "admin");
        System.out.println("Is admin: " + isAdmin);
        System.out.println();
    }

    /**
     * Scenario 8: Demonstrates session management with timeout
     */
    private static void demonstrateSessionManagement() throws InterruptedException {
        System.out.println("Scenario 8: Session Management");
        System.out.println("------------------------------");

        SessionManager sessionManager = new SessionManager(200); // 200ms timeout

        // Create session
        String sessionId = sessionManager.createSession("user@example.com",
            Map.of("role", "user", "loginTime", Instant.now().toString()));
        System.out.println("Session created: " + sessionId);

        // Access session
        boolean valid1 = sessionManager.isSessionValid(sessionId);
        System.out.println("Session valid (immediate): " + valid1);

        // Wait for timeout
        Thread.sleep(250);
        boolean valid2 = sessionManager.isSessionValid(sessionId);
        System.out.println("Session valid (after timeout): " + valid2);

        System.out.println("Active sessions: " + sessionManager.getActiveSessionCount());
        System.out.println();
    }

    /**
     * Scenario 9: Demonstrates async authentication
     */
    private static void demonstrateAsyncAuthentication() throws InterruptedException {
        System.out.println("Scenario 9: Async Authentication");
        System.out.println("--------------------------------");

        AsyncAuthenticationService asyncAuth = new AsyncAuthenticationService();

        // Authenticate multiple users concurrently
        List<CompletableFuture<AuthenticationResult>> futures = new ArrayList<>();

        futures.add(asyncAuth.authenticateAsync("user1@example.com", "pass1"));
        futures.add(asyncAuth.authenticateAsync("user2@example.com", "pass2"));
        futures.add(asyncAuth.authenticateAsync("user3@example.com", "pass3"));

        CompletableFuture<Void> allOf = CompletableFuture.allOf(
            futures.toArray(new CompletableFuture[0])
        );

        allOf.join();

        System.out.println("All authentications completed:");
        for (int i = 0; i < futures.size(); i++) {
            AuthenticationResult result = futures.get(i).join();
            System.out.println("  User " + (i + 1) + ": " +
                             (result.isSuccess() ? "Success" : "Failed"));
        }

        asyncAuth.shutdown();
        System.out.println();
    }

    /**
     * Scenario 10: Demonstrates federation with circuit breaker for resilience
     */
    private static void demonstrateFederationResilience() {
        System.out.println("Scenario 10: Federation with Resilience");
        System.out.println("---------------------------------------");

        ResilientFederationService resilientAuth = new ResilientFederationService(3, 5);

        // Simulate multiple authentication attempts
        for (int i = 0; i < 10; i++) {
            AuthenticationResult result = resilientAuth.authenticate("user@example.com", "password");
            System.out.println("Attempt " + (i + 1) + ": " +
                             (result.isSuccess() ? "Success" : "Failed - " + result.getErrorMessage()));

            if (i == 7) {
                System.out.println("Circuit breaker state: " + resilientAuth.getCircuitBreakerState());
            }
        }

        System.out.println("Total failures: " + resilientAuth.getFailureCount());
        System.out.println("Circuit breaker triggered: " + resilientAuth.isCircuitOpen());
        System.out.println();
    }
}

/**
 * Identity provider that handles authentication
 */
class IdentityProvider {
    private final String name;
    private final Map<String, String> users;

    public IdentityProvider(String name) {
        this.name = name;
        this.users = new ConcurrentHashMap<>();
        // Prepopulate some users
        users.put("user@example.com", "password123");
        users.put("user@gmail.com", "pass123");
        users.put("user@outlook.com", "pass456");
        users.put("employee@company.com", "password");
    }

    public boolean authenticate(String userId, String password) {
        String storedPassword = users.get(userId);
        return storedPassword != null && storedPassword.equals(password);
    }

    public String getName() {
        return name;
    }
}

/**
 * Authentication result
 */
class AuthenticationResult {
    private final boolean success;
    private final String userId;
    private final String accessToken;
    private final String errorMessage;

    private AuthenticationResult(boolean success, String userId, String accessToken, String errorMessage) {
        this.success = success;
        this.userId = userId;
        this.accessToken = accessToken;
        this.errorMessage = errorMessage;
    }

    public static AuthenticationResult success(String userId, String accessToken) {
        return new AuthenticationResult(true, userId, accessToken, null);
    }

    public static AuthenticationResult failure(String errorMessage) {
        return new AuthenticationResult(false, null, null, errorMessage);
    }

    public boolean isSuccess() { return success; }
    public String getUserId() { return userId; }
    public String getAccessToken() { return accessToken; }
    public String getErrorMessage() { return errorMessage; }
}

/**
 * Federated authentication service
 */
class FederatedAuthService {
    private final IdentityProvider identityProvider;

    public FederatedAuthService(IdentityProvider identityProvider) {
        this.identityProvider = identityProvider;
    }

    public AuthenticationResult authenticate(String userId, String password) {
        if (identityProvider.authenticate(userId, password)) {
            String token = generateAccessToken(userId);
            return AuthenticationResult.success(userId, token);
        } else {
            return AuthenticationResult.failure("Invalid credentials");
        }
    }

    private String generateAccessToken(String userId) {
        return Base64.getEncoder().encodeToString(
            (userId + ":" + UUID.randomUUID().toString()).getBytes()
        );
    }
}

/**
 * OAuth 2.0 provider
 */
class OAuth2Provider {
    private final String name;
    private final Map<String, String> authorizationCodes;
    private final Map<String, String> accessTokens;

    public OAuth2Provider(String name) {
        this.name = name;
        this.authorizationCodes = new ConcurrentHashMap<>();
        this.accessTokens = new ConcurrentHashMap<>();
    }

    public String getAuthorizationUrl(String clientId, String redirectUri, List<String> scopes) {
        return "https://" + name + "/authorize?client_id=" + clientId +
               "&redirect_uri=" + redirectUri +
               "&scope=" + String.join("+", scopes) +
               "&response_type=code";
    }

    public String simulateUserAuthorization(String userId) {
        String code = UUID.randomUUID().toString();
        authorizationCodes.put(code, userId);
        return code;
    }

    public TokenResponse exchangeCodeForToken(String code, String clientId, String clientSecret) {
        String userId = authorizationCodes.get(code);
        if (userId != null) {
            String accessToken = Base64.getEncoder().encodeToString(
                (userId + ":" + UUID.randomUUID().toString()).getBytes()
            );
            accessTokens.put(accessToken, userId);
            return new TokenResponse(accessToken, "Bearer", 3600);
        }
        return null;
    }
}

/**
 * Token response from OAuth provider
 */
class TokenResponse {
    private final String accessToken;
    private final String tokenType;
    private final int expiresIn;

    public TokenResponse(String accessToken, String tokenType, int expiresIn) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
    }

    public String getAccessToken() { return accessToken; }
    public String getTokenType() { return tokenType; }
    public int getExpiresIn() { return expiresIn; }
}

/**
 * Multi-provider authentication service
 */
class MultiProviderAuthService {
    private final Map<String, IdentityProvider> providers;

    public MultiProviderAuthService() {
        this.providers = new ConcurrentHashMap<>();
    }

    public void registerProvider(String name, IdentityProvider provider) {
        providers.put(name, provider);
    }

    public AuthenticationResult authenticateWithProvider(String providerName, String userId, String password) {
        IdentityProvider provider = providers.get(providerName);
        if (provider == null) {
            return AuthenticationResult.failure("Provider not found: " + providerName);
        }

        FederatedAuthService authService = new FederatedAuthService(provider);
        return authService.authenticate(userId, password);
    }

    public int getProviderCount() {
        return providers.size();
    }
}

/**
 * JWT token with claims
 */
class JwtToken {
    private final String subject;
    private final Map<String, String> claims;
    private final Instant issuedAt;
    private final Instant expiresAt;

    private JwtToken(String subject, Map<String, String> claims, Instant issuedAt, Instant expiresAt) {
        this.subject = subject;
        this.claims = claims;
        this.issuedAt = issuedAt;
        this.expiresAt = expiresAt;
    }

    public static JwtToken create(String subject, Map<String, String> claims) {
        Instant now = Instant.now();
        return new JwtToken(subject, new HashMap<>(claims), now, now.plus(Duration.ofHours(1)));
    }

    public String getSubject() { return subject; }
    public Map<String, String> getClaims() { return new HashMap<>(claims); }
    public Instant getIssuedAt() { return issuedAt; }
    public Instant getExpiresAt() { return expiresAt; }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}

/**
 * Token validation result
 */
class ValidationResult {
    private final boolean valid;
    private final String reason;

    private ValidationResult(boolean valid, String reason) {
        this.valid = valid;
        this.reason = reason;
    }

    public static ValidationResult valid() {
        return new ValidationResult(true, null);
    }

    public static ValidationResult invalid(String reason) {
        return new ValidationResult(false, reason);
    }

    public boolean isValid() { return valid; }
    public String getReason() { return reason; }
}

/**
 * Token validator
 */
class TokenValidator {
    public ValidationResult validate(JwtToken token) {
        if (token.isExpired()) {
            return ValidationResult.invalid("Token expired");
        }
        if (token.getSubject() == null || token.getSubject().isEmpty()) {
            return ValidationResult.invalid("Invalid subject");
        }
        return ValidationResult.valid();
    }
}

/**
 * SSO session
 */
class SSOSession {
    private final String sessionId;
    private final String userId;
    private final Instant createdAt;
    private final Set<String> accessedApps;

    public SSOSession(String sessionId, String userId) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.createdAt = Instant.now();
        this.accessedApps = ConcurrentHashMap.newKeySet();
    }

    public String getSessionId() { return sessionId; }
    public String getUserId() { return userId; }
    public Instant getCreatedAt() { return createdAt; }
    public Set<String> getAccessedApps() { return new HashSet<>(accessedApps); }

    public void addAccessedApp(String appName) {
        accessedApps.add(appName);
    }
}

/**
 * SSO manager
 */
class SSOManager {
    private final Map<String, SSOSession> sessions;

    public SSOManager() {
        this.sessions = new ConcurrentHashMap<>();
    }

    public SSOSession createSession(IdentityProvider idp, String userId, String password) {
        if (idp.authenticate(userId, password)) {
            String sessionId = UUID.randomUUID().toString();
            SSOSession session = new SSOSession(sessionId, userId);
            sessions.put(sessionId, session);
            return session;
        }
        return null;
    }

    public boolean validateSessionForApp(String sessionId, String appName) {
        SSOSession session = sessions.get(sessionId);
        if (session != null) {
            session.addAccessedApp(appName);
            return true;
        }
        return false;
    }
}

/**
 * Refreshable token with refresh token support
 */
class RefreshableToken extends JwtToken {
    private final String refreshToken;

    private RefreshableToken(String subject, Map<String, String> claims, Instant issuedAt,
                            Instant expiresAt, String refreshToken) {
        super(subject, claims, issuedAt, expiresAt);
        this.refreshToken = refreshToken;
    }

    private RefreshableToken(String subject, Map<String, String> claims, long expiryMs, String refreshToken) {
        super(subject, claims, Instant.now(), Instant.now().plusMillis(expiryMs));
        this.refreshToken = refreshToken;
    }

    public static RefreshableToken create(String subject, long expiryMs) {
        String refreshToken = UUID.randomUUID().toString();
        return new RefreshableToken(subject, new HashMap<>(), expiryMs, refreshToken);
    }

    public String getRefreshToken() { return refreshToken; }
}

/**
 * Refreshable token provider
 */
class RefreshableTokenProvider {
    private final Map<String, String> refreshTokenToUser;

    public RefreshableTokenProvider() {
        this.refreshTokenToUser = new ConcurrentHashMap<>();
    }

    public RefreshableToken issueToken(String userId, long expiryMs) {
        RefreshableToken token = RefreshableToken.create(userId, expiryMs);
        refreshTokenToUser.put(token.getRefreshToken(), userId);
        return token;
    }

    public RefreshableToken refreshToken(String refreshToken) {
        String userId = refreshTokenToUser.get(refreshToken);
        if (userId != null) {
            // Issue new token with longer expiry
            return issueToken(userId, 3600000); // 1 hour
        }
        return null;
    }
}

/**
 * Claims-based authorization service
 */
class ClaimsAuthorizationService {
    public boolean hasPermission(JwtToken token, String permission) {
        Map<String, String> claims = token.getClaims();
        String permissions = claims.get("permissions");
        if (permissions != null) {
            return Arrays.asList(permissions.split(",")).contains(permission);
        }
        return false;
    }

    public boolean hasRole(JwtToken token, String role) {
        Map<String, String> claims = token.getClaims();
        String userRole = claims.get("role");
        return role.equals(userRole);
    }
}

/**
 * Session with timeout
 */
class Session {
    private final String sessionId;
    private final String userId;
    private final Map<String, String> attributes;
    private final Instant createdAt;
    private final long timeoutMs;

    public Session(String sessionId, String userId, Map<String, String> attributes, long timeoutMs) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.attributes = new ConcurrentHashMap<>(attributes);
        this.createdAt = Instant.now();
        this.timeoutMs = timeoutMs;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(createdAt.plusMillis(timeoutMs));
    }

    public String getSessionId() { return sessionId; }
    public String getUserId() { return userId; }
}

/**
 * Session manager with timeout support
 */
class SessionManager {
    private final Map<String, Session> sessions;
    private final long timeoutMs;

    public SessionManager(long timeoutMs) {
        this.sessions = new ConcurrentHashMap<>();
        this.timeoutMs = timeoutMs;
    }

    public String createSession(String userId, Map<String, String> attributes) {
        String sessionId = UUID.randomUUID().toString();
        Session session = new Session(sessionId, userId, attributes, timeoutMs);
        sessions.put(sessionId, session);
        return sessionId;
    }

    public boolean isSessionValid(String sessionId) {
        Session session = sessions.get(sessionId);
        if (session != null && !session.isExpired()) {
            return true;
        }
        if (session != null && session.isExpired()) {
            sessions.remove(sessionId);
        }
        return false;
    }

    public int getActiveSessionCount() {
        return sessions.size();
    }
}

/**
 * Async authentication service
 */
class AsyncAuthenticationService {
    private final ExecutorService executor;
    private final IdentityProvider identityProvider;

    public AsyncAuthenticationService() {
        this.executor = Executors.newFixedThreadPool(4);
        this.identityProvider = new IdentityProvider("AsyncIDP");
    }

    public CompletableFuture<AuthenticationResult> authenticateAsync(String userId, String password) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Simulate network latency
                Thread.sleep(100);
                FederatedAuthService authService = new FederatedAuthService(identityProvider);
                return authService.authenticate(userId, password);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return AuthenticationResult.failure("Interrupted");
            }
        }, executor);
    }

    public void shutdown() {
        executor.shutdown();
    }
}

/**
 * Circuit breaker state
 */
enum CircuitState {
    CLOSED,
    OPEN,
    HALF_OPEN
}

/**
 * Resilient federation service with circuit breaker
 */
class ResilientFederationService {
    private final IdentityProvider identityProvider;
    private final AtomicInteger failureCount;
    private final int failureThreshold;
    private final int maxAttempts;
    private CircuitState circuitState;
    private final Random random;

    public ResilientFederationService(int failureThreshold, int maxAttempts) {
        this.identityProvider = new IdentityProvider("ResilientIDP");
        this.failureCount = new AtomicInteger(0);
        this.failureThreshold = failureThreshold;
        this.maxAttempts = maxAttempts;
        this.circuitState = CircuitState.CLOSED;
        this.random = new Random();
    }

    public AuthenticationResult authenticate(String userId, String password) {
        if (circuitState == CircuitState.OPEN) {
            return AuthenticationResult.failure("Circuit breaker is open");
        }

        // Simulate occasional failures
        if (random.nextDouble() < 0.3) {
            int failures = failureCount.incrementAndGet();
            if (failures >= failureThreshold) {
                circuitState = CircuitState.OPEN;
            }
            return AuthenticationResult.failure("Temporary failure");
        }

        FederatedAuthService authService = new FederatedAuthService(identityProvider);
        AuthenticationResult result = authService.authenticate(userId, password);

        if (result.isSuccess()) {
            failureCount.set(0); // Reset on success
            circuitState = CircuitState.CLOSED;
        }

        return result;
    }

    public int getFailureCount() {
        return failureCount.get();
    }

    public boolean isCircuitOpen() {
        return circuitState == CircuitState.OPEN;
    }

    public CircuitState getCircuitBreakerState() {
        return circuitState;
    }
}
