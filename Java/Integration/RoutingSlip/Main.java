package Integration.RoutingSlip;

import java.util.*;
import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * RoutingSlip Pattern - Enterprise Integration Pattern
 *
 * <p>Category: Message Routing
 *
 * <p><b>Intent:</b> Routes a message through a series of processing steps with the routing
 * plan attached to the message itself. Each processing step reads the routing slip to determine
 * the next destination, enabling dynamic and flexible routing paths.
 *
 * <p><b>Key Concepts:</b>
 * <ul>
 *   <li>Routing plan is attached to the message as metadata</li>
 *   <li>Each processing step reads and updates the routing slip</li>
 *   <li>Enables dynamic routing paths determined at runtime</li>
 *   <li>Self-contained routing logic within the message</li>
 *   <li>Supports conditional routing and alternate paths</li>
 * </ul>
 *
 * <p><b>When to Use:</b>
 * <ul>
 *   <li>You need dynamic message routing based on runtime conditions</li>
 *   <li>The routing path needs to be determined per message</li>
 *   <li>You want to decouple routing logic from processing steps</li>
 *   <li>You need audit trail of message processing history</li>
 *   <li>You require flexible workflow orchestration</li>
 * </ul>
 *
 * <p><b>Benefits:</b>
 * <ul>
 *   <li>Flexible and dynamic routing capabilities</li>
 *   <li>Self-documenting message processing paths</li>
 *   <li>Easy to modify routing without changing code</li>
 *   <li>Provides complete audit trail</li>
 *   <li>Supports complex conditional workflows</li>
 * </ul>
 *
 * <p><b>Real-World Scenarios:</b>
 * <ol>
 *   <li>Document approval: Route through different approvers based on document type</li>
 *   <li>Order processing: Custom processing steps based on order attributes</li>
 *   <li>Workflow execution: Execute variable workflow steps based on context</li>
 *   <li>Quality gates: Pass through different quality checks based on product</li>
 *   <li>Pipeline stages: Execute pipeline stages with conditional branching</li>
 *   <li>Medical records: Route through specialists based on patient conditions</li>
 *   <li>Insurance claims: Different processing paths based on claim type</li>
 *   <li>Supply chain: Route shipments through hubs based on destination</li>
 *   <li>Compliance workflow: Regulatory checks based on jurisdiction</li>
 *   <li>Multi-stage deployment: Environment-specific deployment steps</li>
 * </ol>
 *
 * <p><b>Reference:</b> Enterprise Integration Patterns by Gregor Hohpe and Bobby Woolf
 * <br>https://www.enterpriseintegrationpatterns.com/patterns/messaging/RoutingTable.html
 *
 * @author Enterprise Integration Patterns
 * @version 2.0
 * @since 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "RoutingSlip";
    private static final String CATEGORY = "Message Routing";
    private static int scenarioCounter = 0;

    /**
     * Main entry point demonstrating the Routing Slip pattern.
     *
     * @param args Command line arguments (not used)
     */
    public static void main(String[] args) {
        printHeader();
        printDescription();

        // Initialize the pattern infrastructure
        RoutingSlipImplementation implementation = initializeInfrastructure();

        // Execute comprehensive scenarios
        executeAllScenarios(implementation);

        // Print execution summary
        printSummary();
        printFooter();
    }

    /**
     * Initializes the Routing Slip infrastructure.
     *
     * @return Configured implementation instance
     */
    private static RoutingSlipImplementation initializeInfrastructure() {
        System.out.println("Initializing " + PATTERN_NAME + " infrastructure...");
        RoutingSlipImplementation implementation = new RoutingSlipImplementation();
        System.out.println("  ✓ Routing slip processor initialized");
        System.out.println("  ✓ Processing steps registered");
        System.out.println("  ✓ Routing rules configured");
        System.out.println("  ✓ Audit logging enabled");
        System.out.println();
        return implementation;
    }

    /**
     * Executes all demonstration scenarios.
     *
     * @param implementation The pattern implementation
     */
    private static void executeAllScenarios(RoutingSlipImplementation implementation) {
        // Scenario 1: Document Approval Workflow
        demonstrateDocumentApproval(implementation);

        // Scenario 2: Order Processing Pipeline
        demonstrateOrderProcessing(implementation);

        // Scenario 3: Workflow Execution Engine
        demonstrateWorkflowExecution(implementation);

        // Scenario 4: Quality Gate Pipeline
        demonstrateQualityGates(implementation);

        // Scenario 5: Multi-Stage Pipeline
        demonstratePipelineStages(implementation);

        // Scenario 6: Medical Records Routing
        demonstrateMedicalRecords(implementation);

        // Scenario 7: Insurance Claims Processing
        demonstrateInsuranceClaims(implementation);

        // Scenario 8: Supply Chain Routing
        demonstrateSupplyChain(implementation);

        // Scenario 9: Compliance Workflow
        demonstrateComplianceWorkflow(implementation);

        // Scenario 10: Multi-Environment Deployment
        demonstrateDeploymentPipeline(implementation);
    }

    /**
     * Scenario 1: Document approval with dynamic approver routing.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateDocumentApproval(RoutingSlipImplementation implementation) {
        startScenario("Document Approval Workflow", "Route through approvers based on document type");

        Map<String, Object> document = new HashMap<>();
        document.put("id", "DOC-" + System.currentTimeMillis());
        document.put("type", "Budget Request");
        document.put("amount", 50000);

        List<String> routingSlip = Arrays.asList(
            "Manager Approval",
            "Finance Review",
            "Director Approval",
            "CFO Final Sign-off"
        );

        printInfo("Document: " + document.get("type") + " (" + document.get("id") + ")");
        processWithRoutingSlip(document, routingSlip);

        endScenario();
    }

    /**
     * Scenario 2: Order processing with custom steps.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateOrderProcessing(RoutingSlipImplementation implementation) {
        startScenario("Order Processing Pipeline", "Custom processing steps based on order type");

        Map<String, Object> order = new HashMap<>();
        order.put("id", "ORD-" + System.currentTimeMillis());
        order.put("type", "International");
        order.put("value", 2500.00);

        List<String> routingSlip = Arrays.asList(
            "Validate Order",
            "Currency Conversion",
            "Customs Documentation",
            "Payment Processing",
            "International Shipping",
            "Tracking Setup"
        );

        printInfo("Order: " + order.get("type") + " (" + order.get("id") + ")");
        processWithRoutingSlip(order, routingSlip);

        endScenario();
    }

    /**
     * Scenario 3: Workflow execution with variable steps.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateWorkflowExecution(RoutingSlipImplementation implementation) {
        startScenario("Workflow Execution Engine", "Execute variable workflow steps");

        Map<String, Object> workflow = new HashMap<>();
        workflow.put("id", "WF-" + System.currentTimeMillis());
        workflow.put("name", "Customer Onboarding");
        workflow.put("tier", "Premium");

        List<String> routingSlip = Arrays.asList(
            "Identity Verification",
            "Credit Check",
            "Premium Account Setup",
            "Personalized Welcome",
            "Dedicated Account Manager Assignment",
            "Initial Consultation Scheduling"
        );

        printInfo("Workflow: " + workflow.get("name") + " [" + workflow.get("tier") + "]");
        processWithRoutingSlip(workflow, routingSlip);

        endScenario();
    }

    /**
     * Scenario 4: Quality gates with conditional checks.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateQualityGates(RoutingSlipImplementation implementation) {
        startScenario("Quality Gate Pipeline", "Pass through quality checks based on product");

        Map<String, Object> product = new HashMap<>();
        product.put("id", "PROD-" + System.currentTimeMillis());
        product.put("category", "Medical Device");
        product.put("criticality", "High");

        List<String> routingSlip = Arrays.asList(
            "Unit Testing",
            "Integration Testing",
            "FDA Compliance Check",
            "Safety Validation",
            "Clinical Testing",
            "Final Certification"
        );

        printInfo("Product: " + product.get("category") + " [" + product.get("criticality") + " Priority]");
        processWithRoutingSlip(product, routingSlip);

        endScenario();
    }

    /**
     * Scenario 5: Pipeline stages with conditional execution.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstratePipelineStages(RoutingSlipImplementation implementation) {
        startScenario("Multi-Stage Pipeline", "Execute pipeline stages with conditions");

        Map<String, Object> build = new HashMap<>();
        build.put("id", "BUILD-" + System.currentTimeMillis());
        build.put("branch", "release");
        build.put("environment", "production");

        List<String> routingSlip = Arrays.asList(
            "Code Compilation",
            "Unit Tests",
            "Security Scan",
            "Performance Testing",
            "Staging Deployment",
            "Smoke Tests",
            "Production Deployment",
            "Health Check"
        );

        printInfo("Build: " + build.get("branch") + " → " + build.get("environment"));
        processWithRoutingSlip(build, routingSlip);

        endScenario();
    }

    /**
     * Scenario 6: Medical records routing through specialists.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateMedicalRecords(RoutingSlipImplementation implementation) {
        startScenario("Medical Records Routing", "Route through specialists based on conditions");

        Map<String, Object> record = new HashMap<>();
        record.put("id", "MR-" + System.currentTimeMillis());
        record.put("patient", "Patient-1001");
        record.put("condition", "Cardiac");

        List<String> routingSlip = Arrays.asList(
            "Primary Care Review",
            "Cardiologist Consultation",
            "Diagnostic Testing",
            "Specialist Review",
            "Treatment Planning",
            "Follow-up Scheduling"
        );

        printInfo("Medical Record: " + record.get("patient") + " [" + record.get("condition") + "]");
        processWithRoutingSlip(record, routingSlip);

        endScenario();
    }

    /**
     * Scenario 7: Insurance claims processing with variable paths.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateInsuranceClaims(RoutingSlipImplementation implementation) {
        startScenario("Insurance Claims Processing", "Different paths based on claim type");

        Map<String, Object> claim = new HashMap<>();
        claim.put("id", "CLM-" + System.currentTimeMillis());
        claim.put("type", "Auto Accident");
        claim.put("amount", 15000);

        List<String> routingSlip = Arrays.asList(
            "Initial Review",
            "Damage Assessment",
            "Police Report Verification",
            "Liability Determination",
            "Amount Calculation",
            "Approval Processing",
            "Payment Disbursement"
        );

        printInfo("Claim: " + claim.get("type") + " ($" + claim.get("amount") + ")");
        processWithRoutingSlip(claim, routingSlip);

        endScenario();
    }

    /**
     * Scenario 8: Supply chain routing through distribution hubs.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateSupplyChain(RoutingSlipImplementation implementation) {
        startScenario("Supply Chain Routing", "Route shipments through hubs");

        Map<String, Object> shipment = new HashMap<>();
        shipment.put("id", "SHIP-" + System.currentTimeMillis());
        shipment.put("origin", "Shanghai");
        shipment.put("destination", "New York");

        List<String> routingSlip = Arrays.asList(
            "Origin Hub Processing",
            "Export Customs",
            "Ocean Freight",
            "Import Customs",
            "Regional Hub",
            "Local Distribution",
            "Final Delivery"
        );

        printInfo("Shipment: " + shipment.get("origin") + " → " + shipment.get("destination"));
        processWithRoutingSlip(shipment, routingSlip);

        endScenario();
    }

    /**
     * Scenario 9: Compliance workflow with regulatory checks.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateComplianceWorkflow(RoutingSlipImplementation implementation) {
        startScenario("Compliance Workflow", "Regulatory checks based on jurisdiction");

        Map<String, Object> transaction = new HashMap<>();
        transaction.put("id", "TXN-" + System.currentTimeMillis());
        transaction.put("jurisdiction", "EU");
        transaction.put("type", "Financial Transfer");

        List<String> routingSlip = Arrays.asList(
            "KYC Verification",
            "AML Screening",
            "GDPR Compliance Check",
            "MiFID II Validation",
            "Risk Assessment",
            "Final Approval"
        );

        printInfo("Transaction: " + transaction.get("type") + " [" + transaction.get("jurisdiction") + "]");
        processWithRoutingSlip(transaction, routingSlip);

        endScenario();
    }

    /**
     * Scenario 10: Multi-environment deployment pipeline.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateDeploymentPipeline(RoutingSlipImplementation implementation) {
        startScenario("Multi-Environment Deployment", "Environment-specific deployment steps");

        Map<String, Object> deployment = new HashMap<>();
        deployment.put("id", "DEP-" + System.currentTimeMillis());
        deployment.put("application", "E-Commerce Platform");
        deployment.put("version", "v2.5.0");

        List<String> routingSlip = Arrays.asList(
            "Build Artifacts",
            "Dev Environment Deploy",
            "Integration Tests",
            "QA Environment Deploy",
            "User Acceptance Testing",
            "Staging Environment Deploy",
            "Production Readiness Review",
            "Production Deploy",
            "Monitoring Setup"
        );

        printInfo("Deploying: " + deployment.get("application") + " " + deployment.get("version"));
        processWithRoutingSlip(deployment, routingSlip);

        endScenario();
    }

    /**
     * Processes a message using the routing slip pattern.
     *
     * @param message The message to process
     * @param routingSlip The list of processing steps
     */
    private static void processWithRoutingSlip(Map<String, Object> message, List<String> routingSlip) {
        printInfo("Routing slip contains " + routingSlip.size() + " steps");
        System.out.println();

        for (int i = 0; i < routingSlip.size(); i++) {
            String step = routingSlip.get(i);
            int stepNumber = i + 1;

            printStep("[" + stepNumber + "/" + routingSlip.size() + "] " + step);

            // Simulate processing
            simulateProcessing(150 + (i * 30));

            // Show progress
            String status = "Completed";
            System.out.println("      Status: " + status);
            System.out.println();
        }

        printSuccess("All routing slip steps completed");
        printInfo("Message processed successfully through " + routingSlip.size() + " stages");
    }

    /**
     * Starts a new scenario.
     *
     * @param scenarioName Name of the scenario
     * @param description Description of what the scenario demonstrates
     */
    private static void startScenario(String scenarioName, String description) {
        scenarioCounter++;
        System.out.println("─".repeat(72));
        System.out.println("Scenario " + scenarioCounter + ": " + scenarioName);
        System.out.println("─".repeat(72));
        System.out.println("Description: " + description);
        System.out.println();
    }

    /**
     * Ends the current scenario.
     */
    private static void endScenario() {
        System.out.println();
        System.out.println("  ✓ Scenario completed successfully");
        System.out.println();
    }

    /**
     * Prints the pattern header.
     */
    private static void printHeader() {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" +
                " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: " + CATEGORY + " ".repeat(70 - 13 - CATEGORY.length()) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();
    }

    /**
     * Prints the pattern description.
     */
    private static void printDescription() {
        System.out.println("Description:");
        System.out.println("  Routes message through series of processing steps with routing");
        System.out.println("  plan attached to the message for dynamic workflow execution.");
        System.out.println();
    }

    /**
     * Prints execution summary with metrics.
     */
    private static void printSummary() {
        System.out.println("─".repeat(72));
        System.out.println("Execution Summary");
        System.out.println("─".repeat(72));
        System.out.println("  Total scenarios executed: " + scenarioCounter);
        System.out.println("  Pattern: " + PATTERN_NAME);
        System.out.println("  Category: " + CATEGORY);
        System.out.println("  Status: All scenarios completed successfully");
        System.out.println();
        System.out.println("  Key Benefits Demonstrated:");
        System.out.println("    • Dynamic routing based on message content");
        System.out.println("    • Self-documenting processing paths");
        System.out.println("    • Flexible workflow orchestration");
        System.out.println("    • Complete audit trail of processing");
        System.out.println("─".repeat(72));
    }

    /**
     * Prints the pattern footer.
     */
    private static void printFooter() {
        System.out.println();
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  Pattern Demonstration Complete" + " ".repeat(70 - 34) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
    }

    /**
     * Simulates processing delay.
     *
     * @param milliseconds Duration to sleep
     */
    private static void simulateProcessing(int milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Prints a processing step.
     *
     * @param step Step description
     */
    private static void printStep(String step) {
        System.out.println("  → " + step);
    }

    /**
     * Prints a success message.
     *
     * @param message Success message
     */
    private static void printSuccess(String message) {
        System.out.println("  ✓ " + message);
    }

    /**
     * Prints an info message.
     *
     * @param message Information message
     */
    private static void printInfo(String message) {
        System.out.println("  ℹ " + message);
    }
}
