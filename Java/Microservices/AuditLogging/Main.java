package Microservices.AuditLogging;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Audit Logging Pattern - Main Demonstration
 *
 * Purpose:
 * The Audit Logging pattern captures and records all significant actions, events, and data
 * changes within a system for security, compliance, debugging, and forensic analysis purposes.
 *
 * Key Components:
 * - AuditLogger: Centralized logging system for audit events
 * - AuditEvent: Represents a single auditable action or event
 * - AuditStore: Persistent storage for audit logs
 * - AuditQuery: Interface for searching and analyzing audit trails
 *
 * Microservices Architecture Benefits:
 * - Distributed tracing across service boundaries
 * - Compliance with regulatory requirements (GDPR, HIPAA, SOX)
 * - Security incident investigation
 * - User activity monitoring
 * - Change tracking and accountability
 *
 * Real-World Use Cases:
 * 1. Financial transactions - track all money movements
 * 2. Healthcare records - HIPAA compliance for patient data access
 * 3. Administrative actions - track configuration changes
 * 4. Security events - failed login attempts, permission changes
 * 5. Data modifications - who changed what and when
 *
 * Best Practices:
 * - Log immutably (append-only, never modify/delete)
 * - Include comprehensive context (user, timestamp, IP, action, resource)
 * - Protect audit logs from tampering (encryption, write-once storage)
 * - Implement log retention policies
 * - Enable efficient querying and analysis
 * - Separate audit storage from application data
 *
 * @author Design Patterns Implementation
 * @version 2.0
 */
public class Main {

    /**
     * Main entry point demonstrating comprehensive Audit Logging scenarios.
     *
     * Scenarios demonstrated:
     * 1. Basic audit logging for CRUD operations
     * 2. Security audit logging (authentication and authorization)
     * 3. Data modification tracking with before/after values
     * 4. Compliance audit trail for regulated data
     * 5. Administrative action logging
     * 6. Failed operation and error logging
     * 7. Cross-service audit correlation
     * 8. Audit log querying and analysis
     * 9. Audit log retention and archival
     * 10. Real-time audit alerting for suspicious activities
     *
     * @param args Command line arguments (not used)
     */
    public static void main(String[] args) {
        System.out.println("=".repeat(80));
        System.out.println("AUDIT LOGGING PATTERN - MICROSERVICES DEMONSTRATION");
        System.out.println("=".repeat(80));
        System.out.println();

        // Scenario 1: Basic CRUD Audit Logging
        demonstrateBasicAuditLogging();

        // Scenario 2: Security Audit Logging
        demonstrateSecurityAuditLogging();

        // Scenario 3: Data Modification Tracking
        demonstrateDataModificationTracking();

        // Scenario 4: Compliance Audit Trail
        demonstrateComplianceAuditTrail();

        // Scenario 5: Administrative Action Logging
        demonstrateAdministrativeAuditLogging();

        // Scenario 6: Failed Operation Logging
        demonstrateFailedOperationLogging();

        // Scenario 7: Cross-Service Audit Correlation
        demonstrateCrossServiceAuditCorrelation();

        // Scenario 8: Audit Log Querying
        demonstrateAuditLogQuerying();

        // Scenario 9: Audit Log Retention
        demonstrateAuditLogRetention();

        // Scenario 10: Real-Time Audit Alerting
        demonstrateRealTimeAuditAlerting();

        System.out.println("\n" + "=".repeat(80));
        System.out.println("AUDIT LOGGING PATTERN DEMONSTRATION COMPLETED");
        System.out.println("=".repeat(80));
    }

    /**
     * Scenario 1: Basic CRUD Audit Logging
     * Demonstrates logging of Create, Read, Update, Delete operations.
     */
    private static void demonstrateBasicAuditLogging() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 1: Basic CRUD Audit Logging");
        System.out.println("-".repeat(80));

        AuditLogger logger = new AuditLogger();

        logger.logAction("user123", "CREATE", "Order", "order-456", "Created new order for $299.99");
        logger.logAction("user123", "READ", "Order", "order-456", "Viewed order details");
        logger.logAction("user456", "UPDATE", "Product", "prod-789", "Updated price from $99.99 to $89.99");
        logger.logAction("admin", "DELETE", "User", "user-999", "Deleted inactive user account");

        System.out.println("\nAudit trail created successfully");
    }

    /**
     * Scenario 2: Security Audit Logging
     * Shows authentication and authorization event logging.
     */
    private static void demonstrateSecurityAuditLogging() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 2: Security Audit Logging");
        System.out.println("-".repeat(80));

        SecurityAuditLogger secLogger = new SecurityAuditLogger();

        secLogger.logLogin("user123", "192.168.1.100", true);
        secLogger.logLoginFailure("user456", "192.168.1.200", "Invalid password");
        secLogger.logLoginFailure("user456", "192.168.1.200", "Invalid password");
        secLogger.logLoginFailure("user456", "192.168.1.200", "Account locked after 3 failed attempts");
        secLogger.logPermissionChange("admin", "user789", "ROLE_USER", "ROLE_ADMIN");
        secLogger.logAccessDenied("user123", "/api/admin/users", "Insufficient permissions");
        secLogger.logLogout("user123", "192.168.1.100");

        System.out.println("\nSecurity audit trail completed");
    }

    /**
     * Scenario 3: Data Modification Tracking
     * Demonstrates tracking data changes with before/after values.
     */
    private static void demonstrateDataModificationTracking() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 3: Data Modification Tracking");
        System.out.println("-".repeat(80));

        DataChangeTracker tracker = new DataChangeTracker();

        Map<String, String> beforeValues = new HashMap<>();
        beforeValues.put("email", "user@example.com");
        beforeValues.put("phone", "555-0100");
        beforeValues.put("address", "123 Main St");

        Map<String, String> afterValues = new HashMap<>();
        afterValues.put("email", "newemail@example.com");
        afterValues.put("phone", "555-0200");
        afterValues.put("address", "456 Oak Ave");

        tracker.trackChanges("user123", "Profile", "profile-123", beforeValues, afterValues);

        System.out.println("\nData modification tracking completed");
    }

    /**
     * Scenario 4: Compliance Audit Trail
     * Shows GDPR/HIPAA compliant audit logging for regulated data.
     */
    private static void demonstrateComplianceAuditTrail() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 4: Compliance Audit Trail (GDPR/HIPAA)");
        System.out.println("-".repeat(80));

        ComplianceAuditLogger complianceLogger = new ComplianceAuditLogger();

        complianceLogger.logDataAccess("doctor123", "PatientRecord", "patient-456",
            "Viewed medical history for treatment purposes", "HIPAA");
        complianceLogger.logDataExport("user789", "PersonalData", "user-789",
            "GDPR data export request", "GDPR");
        complianceLogger.logDataDeletion("admin", "PersonalData", "user-999",
            "GDPR right to be forgotten request", "GDPR");
        complianceLogger.logConsentChange("user123", "MarketingConsent", "consent-123",
            "Opted out of marketing emails", "GDPR");

        System.out.println("\nCompliance audit trail documented");
    }

    /**
     * Scenario 5: Administrative Action Logging
     * Demonstrates logging of system administration activities.
     */
    private static void demonstrateAdministrativeAuditLogging() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 5: Administrative Action Logging");
        System.out.println("-".repeat(80));

        AdminAuditLogger adminLogger = new AdminAuditLogger();

        adminLogger.logConfigChange("admin", "OrderService", "db.connection.pool.size", "10", "50");
        adminLogger.logServiceRestart("admin", "PaymentService", "Applying security patch");
        adminLogger.logDatabaseMigration("dba", "OrderDB", "V1.5.0", "Added audit_log table");
        adminLogger.logBackupOperation("system", "UserDB", "daily-backup-2024-01-15.sql", true);
        adminLogger.logSecurityPatchApplied("admin", "All Services", "CVE-2024-0001", "Critical");

        System.out.println("\nAdministrative actions logged");
    }

    /**
     * Scenario 6: Failed Operation Logging
     * Shows logging of failures and errors for troubleshooting.
     */
    private static void demonstrateFailedOperationLogging() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 6: Failed Operation Logging");
        System.out.println("-".repeat(80));

        FailureAuditLogger failureLogger = new FailureAuditLogger();

        failureLogger.logFailedPayment("user123", "order-456", "payment-789",
            "Insufficient funds", "Stripe");
        failureLogger.logFailedApiCall("OrderService", "InventoryService", "/api/inventory/check",
            "Connection timeout", 500);
        failureLogger.logFailedValidation("user456", "CreateOrder", "Invalid product ID: prod-999");
        failureLogger.logFailedDatabaseQuery("OrderService", "SELECT * FROM orders WHERE id = ?",
            "Deadlock detected");

        System.out.println("\nFailure audit trail created for troubleshooting");
    }

    /**
     * Scenario 7: Cross-Service Audit Correlation
     * Demonstrates correlating audit logs across microservices.
     */
    private static void demonstrateCrossServiceAuditCorrelation() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 7: Cross-Service Audit Correlation");
        System.out.println("-".repeat(80));

        String correlationId = UUID.randomUUID().toString();
        CorrelatedAuditLogger corrLogger = new CorrelatedAuditLogger();

        corrLogger.logWithCorrelation(correlationId, "OrderService", "user123",
            "CREATE", "Order", "order-456", "Order created");
        corrLogger.logWithCorrelation(correlationId, "InventoryService", "system",
            "UPDATE", "Stock", "prod-123", "Reserved 2 units");
        corrLogger.logWithCorrelation(correlationId, "PaymentService", "system",
            "CREATE", "Payment", "payment-789", "Payment processed $299.99");
        corrLogger.logWithCorrelation(correlationId, "ShippingService", "system",
            "CREATE", "Shipment", "ship-321", "Shipment created");
        corrLogger.logWithCorrelation(correlationId, "NotificationService", "system",
            "SEND", "Email", "email-654", "Order confirmation sent");

        System.out.println("\nCorrelation ID: " + correlationId);
        System.out.println("Cross-service transaction audit trail completed");
    }

    /**
     * Scenario 8: Audit Log Querying
     * Shows querying and analyzing audit logs.
     */
    private static void demonstrateAuditLogQuerying() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 8: Audit Log Querying and Analysis");
        System.out.println("-".repeat(80));

        AuditQueryService queryService = new AuditQueryService();

        // Populate with sample data
        for (int i = 0; i < 20; i++) {
            queryService.addAuditEvent("user" + (i % 5), "READ", "Order", "order-" + i);
        }

        System.out.println("\nQuery 1: Find all actions by user123");
        queryService.findByUser("user123");

        System.out.println("\nQuery 2: Find all READ operations");
        queryService.findByAction("READ");

        System.out.println("\nQuery 3: Find all Order resource accesses");
        queryService.findByResourceType("Order");

        System.out.println("\nQuery 4: Activity summary");
        queryService.printActivitySummary();
    }

    /**
     * Scenario 9: Audit Log Retention
     * Demonstrates audit log retention and archival policies.
     */
    private static void demonstrateAuditLogRetention() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 9: Audit Log Retention and Archival");
        System.out.println("-".repeat(80));

        AuditRetentionManager retentionMgr = new AuditRetentionManager();

        retentionMgr.setRetentionPolicy("SecurityAudits", 2555); // 7 years (HIPAA requirement)
        retentionMgr.setRetentionPolicy("FinancialAudits", 2555); // 7 years (SOX requirement)
        retentionMgr.setRetentionPolicy("GeneralAudits", 90); // 90 days
        retentionMgr.setRetentionPolicy("DebugLogs", 30); // 30 days

        retentionMgr.archiveOldLogs("SecurityAudits");
        retentionMgr.archiveOldLogs("FinancialAudits");
        retentionMgr.purgeExpiredLogs("GeneralAudits");
        retentionMgr.purgeExpiredLogs("DebugLogs");

        retentionMgr.printRetentionStatus();
    }

    /**
     * Scenario 10: Real-Time Audit Alerting
     * Shows real-time monitoring and alerting on suspicious activities.
     */
    private static void demonstrateRealTimeAuditAlerting() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 10: Real-Time Audit Alerting");
        System.out.println("-".repeat(80));

        AuditAlertingSystem alertingSystem = new AuditAlertingSystem();

        // Configure alert rules
        alertingSystem.addRule("MultipleFailedLogins", 3, 300); // 3 failures in 5 minutes
        alertingSystem.addRule("UnusualDataExport", 1, 3600); // Any large export in 1 hour
        alertingSystem.addRule("PrivilegeEscalation", 1, 86400); // Any privilege change in 24 hours
        alertingSystem.addRule("AfterHoursAccess", 1, 0); // Immediate alert

        // Simulate suspicious activities
        alertingSystem.processEvent("user123", "LoginFailure", "192.168.1.100");
        alertingSystem.processEvent("user123", "LoginFailure", "192.168.1.100");
        alertingSystem.processEvent("user123", "LoginFailure", "192.168.1.100"); // Should trigger alert

        alertingSystem.processEvent("user456", "LargeDataExport", "10GB customer data"); // Should trigger alert

        alertingSystem.processEvent("admin", "PermissionChange", "user789: ROLE_USER -> ROLE_ADMIN"); // Should trigger alert

        System.out.println("\nReal-time audit alerting configured and active");
    }
}

/**
 * Security-focused audit logger.
 */
class SecurityAuditLogger {
    public void logLogin(String userId, String ipAddress, boolean success) {
        System.out.println(String.format("[SECURITY] Login %s - User: %s, IP: %s",
            success ? "SUCCESS" : "FAILED", userId, ipAddress));
    }

    public void logLoginFailure(String userId, String ipAddress, String reason) {
        System.out.println(String.format("[SECURITY] Login FAILED - User: %s, IP: %s, Reason: %s",
            userId, ipAddress, reason));
    }

    public void logPermissionChange(String adminUser, String targetUser, String oldRole, String newRole) {
        System.out.println(String.format("[SECURITY] Permission Change - Admin: %s, User: %s, %s -> %s",
            adminUser, targetUser, oldRole, newRole));
    }

    public void logAccessDenied(String userId, String resource, String reason) {
        System.out.println(String.format("[SECURITY] Access DENIED - User: %s, Resource: %s, Reason: %s",
            userId, resource, reason));
    }

    public void logLogout(String userId, String ipAddress) {
        System.out.println(String.format("[SECURITY] Logout - User: %s, IP: %s", userId, ipAddress));
    }
}

/**
 * Data change tracker with before/after values.
 */
class DataChangeTracker {
    public void trackChanges(String userId, String resourceType, String resourceId,
                           Map<String, String> before, Map<String, String> after) {
        System.out.println(String.format("\n[DATA CHANGE] User: %s, Resource: %s/%s",
            userId, resourceType, resourceId));

        Set<String> allKeys = new HashSet<>();
        allKeys.addAll(before.keySet());
        allKeys.addAll(after.keySet());

        for (String key : allKeys) {
            String beforeVal = before.getOrDefault(key, "N/A");
            String afterVal = after.getOrDefault(key, "N/A");
            if (!beforeVal.equals(afterVal)) {
                System.out.println(String.format("  %s: '%s' -> '%s'", key, beforeVal, afterVal));
            }
        }
    }
}

/**
 * Compliance audit logger for regulated industries.
 */
class ComplianceAuditLogger {
    public void logDataAccess(String userId, String dataType, String dataId, String purpose, String regulation) {
        System.out.println(String.format("[%s COMPLIANCE] Data Access - User: %s, Type: %s, ID: %s, Purpose: %s",
            regulation, userId, dataType, dataId, purpose));
    }

    public void logDataExport(String userId, String dataType, String dataId, String reason, String regulation) {
        System.out.println(String.format("[%s COMPLIANCE] Data Export - User: %s, Type: %s, ID: %s, Reason: %s",
            regulation, userId, dataType, dataId, reason));
    }

    public void logDataDeletion(String userId, String dataType, String dataId, String reason, String regulation) {
        System.out.println(String.format("[%s COMPLIANCE] Data Deletion - User: %s, Type: %s, ID: %s, Reason: %s",
            regulation, userId, dataType, dataId, reason));
    }

    public void logConsentChange(String userId, String consentType, String consentId, String action, String regulation) {
        System.out.println(String.format("[%s COMPLIANCE] Consent Change - User: %s, Type: %s, ID: %s, Action: %s",
            regulation, userId, consentType, consentId, action));
    }
}

/**
 * Administrative action audit logger.
 */
class AdminAuditLogger {
    public void logConfigChange(String adminUser, String service, String key, String oldValue, String newValue) {
        System.out.println(String.format("[ADMIN] Config Change - Admin: %s, Service: %s, %s: '%s' -> '%s'",
            adminUser, service, key, oldValue, newValue));
    }

    public void logServiceRestart(String adminUser, String service, String reason) {
        System.out.println(String.format("[ADMIN] Service Restart - Admin: %s, Service: %s, Reason: %s",
            adminUser, service, reason));
    }

    public void logDatabaseMigration(String adminUser, String database, String version, String description) {
        System.out.println(String.format("[ADMIN] Database Migration - Admin: %s, DB: %s, Version: %s, Changes: %s",
            adminUser, database, version, description));
    }

    public void logBackupOperation(String userId, String database, String backupFile, boolean success) {
        System.out.println(String.format("[ADMIN] Backup %s - User: %s, DB: %s, File: %s",
            success ? "SUCCESS" : "FAILED", userId, database, backupFile));
    }

    public void logSecurityPatchApplied(String adminUser, String target, String cveId, String severity) {
        System.out.println(String.format("[ADMIN] Security Patch Applied - Admin: %s, Target: %s, CVE: %s, Severity: %s",
            adminUser, target, cveId, severity));
    }
}

/**
 * Failure audit logger for troubleshooting.
 */
class FailureAuditLogger {
    public void logFailedPayment(String userId, String orderId, String paymentId, String reason, String provider) {
        System.out.println(String.format("[FAILURE] Payment Failed - User: %s, Order: %s, Payment: %s, Reason: %s, Provider: %s",
            userId, orderId, paymentId, reason, provider));
    }

    public void logFailedApiCall(String sourceService, String targetService, String endpoint, String error, int statusCode) {
        System.out.println(String.format("[FAILURE] API Call Failed - %s -> %s, Endpoint: %s, Error: %s, Status: %d",
            sourceService, targetService, endpoint, error, statusCode));
    }

    public void logFailedValidation(String userId, String operation, String validationError) {
        System.out.println(String.format("[FAILURE] Validation Failed - User: %s, Operation: %s, Error: %s",
            userId, operation, validationError));
    }

    public void logFailedDatabaseQuery(String service, String query, String error) {
        System.out.println(String.format("[FAILURE] Database Query Failed - Service: %s, Query: %s, Error: %s",
            service, query, error));
    }
}

/**
 * Correlated audit logger for distributed tracing.
 */
class CorrelatedAuditLogger {
    public void logWithCorrelation(String correlationId, String service, String userId, String action,
                                  String resourceType, String resourceId, String description) {
        System.out.println(String.format("[AUDIT][%s] %s - User: %s, Action: %s, Resource: %s/%s, Details: %s",
            correlationId.substring(0, 8), service, userId, action, resourceType, resourceId, description));
    }
}

/**
 * Audit query service for log analysis.
 */
class AuditQueryService {
    private List<AuditEvent> events = new ArrayList<>();

    public void addAuditEvent(String userId, String action, String resourceType, String resourceId) {
        events.add(new AuditEvent(userId, action, resourceType, resourceId));
    }

    public void findByUser(String userId) {
        long count = events.stream().filter(e -> e.userId.equals(userId)).count();
        System.out.println("  Found " + count + " events for user: " + userId);
    }

    public void findByAction(String action) {
        long count = events.stream().filter(e -> e.action.equals(action)).count();
        System.out.println("  Found " + count + " events for action: " + action);
    }

    public void findByResourceType(String resourceType) {
        long count = events.stream().filter(e -> e.resourceType.equals(resourceType)).count();
        System.out.println("  Found " + count + " events for resource type: " + resourceType);
    }

    public void printActivitySummary() {
        System.out.println("  Total audit events: " + events.size());
        System.out.println("  Unique users: " + events.stream().map(e -> e.userId).distinct().count());
        System.out.println("  Unique actions: " + events.stream().map(e -> e.action).distinct().count());
        System.out.println("  Unique resource types: " + events.stream().map(e -> e.resourceType).distinct().count());
    }

    static class AuditEvent {
        String userId, action, resourceType, resourceId;
        LocalDateTime timestamp;

        AuditEvent(String userId, String action, String resourceType, String resourceId) {
            this.userId = userId;
            this.action = action;
            this.resourceType = resourceType;
            this.resourceId = resourceId;
            this.timestamp = LocalDateTime.now();
        }
    }
}

/**
 * Audit retention manager for compliance.
 */
class AuditRetentionManager {
    private Map<String, Integer> retentionPolicies = new HashMap<>();

    public void setRetentionPolicy(String category, int days) {
        retentionPolicies.put(category, days);
        System.out.println(String.format("[RETENTION] Policy set for %s: %d days", category, days));
    }

    public void archiveOldLogs(String category) {
        System.out.println(String.format("[RETENTION] Archiving logs older than %d days for %s",
            retentionPolicies.getOrDefault(category, 90), category));
    }

    public void purgeExpiredLogs(String category) {
        System.out.println(String.format("[RETENTION] Purging logs older than %d days for %s",
            retentionPolicies.getOrDefault(category, 30), category));
    }

    public void printRetentionStatus() {
        System.out.println("\n[RETENTION] Current retention policies:");
        retentionPolicies.forEach((cat, days) ->
            System.out.println(String.format("  %s: %d days (%.1f years)", cat, days, days / 365.0)));
    }
}

/**
 * Real-time audit alerting system.
 */
class AuditAlertingSystem {
    private Map<String, AlertRule> rules = new HashMap<>();
    private Map<String, List<Long>> eventTimestamps = new HashMap<>();

    public void addRule(String ruleName, int threshold, int windowSeconds) {
        rules.put(ruleName, new AlertRule(ruleName, threshold, windowSeconds));
        System.out.println(String.format("[ALERT] Rule configured: %s (threshold: %d, window: %ds)",
            ruleName, threshold, windowSeconds));
    }

    public void processEvent(String userId, String eventType, String details) {
        String key = userId + ":" + eventType;
        eventTimestamps.putIfAbsent(key, new ArrayList<>());
        eventTimestamps.get(key).add(System.currentTimeMillis());

        System.out.println(String.format("[AUDIT EVENT] User: %s, Type: %s, Details: %s",
            userId, eventType, details));

        // Check if alert should be triggered (simplified logic)
        if (eventTimestamps.get(key).size() >= 3 && eventType.contains("Failure")) {
            triggerAlert("MultipleFailedLogins", userId, details);
        } else if (eventType.contains("Export")) {
            triggerAlert("UnusualDataExport", userId, details);
        } else if (eventType.contains("Permission")) {
            triggerAlert("PrivilegeEscalation", userId, details);
        }
    }

    private void triggerAlert(String ruleName, String userId, String details) {
        System.out.println(String.format("\n*** ALERT TRIGGERED: %s ***", ruleName));
        System.out.println(String.format("*** User: %s, Details: %s ***\n", userId, details));
    }

    static class AlertRule {
        String name;
        int threshold;
        int windowSeconds;

        AlertRule(String name, int threshold, int windowSeconds) {
            this.name = name;
            this.threshold = threshold;
            this.windowSeconds = windowSeconds;
        }
    }
}
