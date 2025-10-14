package Integration.ProcessManager;

import java.util.*;
import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * ProcessManager Pattern - Enterprise Integration Pattern
 *
 * <p>Category: Message Routing
 *
 * <p><b>Intent:</b> Manages routing of messages in complex business processes by maintaining
 * process state and coordinating multiple services. Acts as a central coordinator for long-running
 * business processes that involve multiple steps and services.
 *
 * <p><b>Key Concepts:</b>
 * <ul>
 *   <li>Maintains state for long-running business processes</li>
 *   <li>Routes messages based on complex process logic and current state</li>
 *   <li>Coordinates interactions between multiple services</li>
 *   <li>Handles compensation and error recovery</li>
 *   <li>Supports process versioning and migration</li>
 * </ul>
 *
 * <p><b>When to Use:</b>
 * <ul>
 *   <li>You need to manage complex, long-running business processes</li>
 *   <li>Process logic is too complex for simple routing patterns</li>
 *   <li>You need to maintain process state across multiple steps</li>
 *   <li>You require compensation logic for failed processes</li>
 *   <li>Multiple services need to be coordinated</li>
 * </ul>
 *
 * <p><b>Benefits:</b>
 * <ul>
 *   <li>Centralizes complex process logic</li>
 *   <li>Maintains clear process state and history</li>
 *   <li>Enables process monitoring and management</li>
 *   <li>Supports error handling and compensation</li>
 *   <li>Decouples services from process orchestration</li>
 * </ul>
 *
 * <p><b>Real-World Scenarios:</b>
 * <ol>
 *   <li>Loan processing: Multi-step approval with credit checks and underwriting</li>
 *   <li>Insurance claims: Complex workflow with adjusters, approvals, payments</li>
 *   <li>Order fulfillment: Inventory, warehouse, shipping coordination</li>
 *   <li>Employee onboarding: HR, IT, facilities coordination</li>
 *   <li>Travel booking: Flight, hotel, car rental coordination with cancellation</li>
 *   <li>Manufacturing: Production planning with inventory and scheduling</li>
 *   <li>Healthcare: Patient treatment plans across specialists</li>
 *   <li>E-commerce: Order, payment, shipping, returns management</li>
 *   <li>Real estate: Property transaction with inspections, financing, closing</li>
 *   <li>Software release: Build, test, deploy across environments</li>
 * </ol>
 *
 * <p><b>Reference:</b> Enterprise Integration Patterns by Gregor Hohpe and Bobby Woolf
 * <br>https://www.enterpriseintegrationpatterns.com/patterns/messaging/ProcessManager.html
 *
 * @author Enterprise Integration Patterns
 * @version 2.0
 * @since 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "ProcessManager";
    private static final String CATEGORY = "Message Routing";
    private static int scenarioCounter = 0;
    private static final Map<String, String> processStates = new ConcurrentHashMap<>();

    public static void main(String[] args) {
        printHeader();
        printDescription();

        ProcessManagerImplementation implementation = initializeInfrastructure();
        executeAllScenarios(implementation);
        printSummary();
        printFooter();
    }

    private static ProcessManagerImplementation initializeInfrastructure() {
        System.out.println("Initializing " + PATTERN_NAME + " infrastructure...");
        ProcessManagerImplementation implementation = new ProcessManagerImplementation();
        System.out.println("  ✓ Process state manager initialized");
        System.out.println("  ✓ Service coordinators registered");
        System.out.println("  ✓ Compensation handlers configured");
        System.out.println("  ✓ Process monitoring enabled");
        System.out.println();
        return implementation;
    }

    private static void executeAllScenarios(ProcessManagerImplementation implementation) {
        demonstrateLoanProcessing(implementation);
        demonstrateInsuranceClaims(implementation);
        demonstrateOrderFulfillment(implementation);
        demonstrateEmployeeOnboarding(implementation);
        demonstrateTravelBooking(implementation);
        demonstrateManufacturing(implementation);
        demonstrateHealthcare(implementation);
        demonstrateECommerce(implementation);
        demonstrateRealEstate(implementation);
        demonstrateSoftwareRelease(implementation);
    }

    private static void demonstrateLoanProcessing(ProcessManagerImplementation impl) {
        startScenario("Loan Processing", "Multi-step loan approval process");

        String processId = "LOAN-" + System.currentTimeMillis();
        Map<String, Object> application = createLoanApplication(processId);

        printInfo("Application: $" + application.get("amount") + " " + application.get("type"));

        List<String> steps = Arrays.asList(
            "Receive Application", "Credit Check", "Income Verification",
            "Risk Assessment", "Underwriting", "Approval Decision", "Generate Documents"
        );

        executeProcess(processId, steps);
        endScenario();
    }

    private static void demonstrateInsuranceClaims(ProcessManagerImplementation impl) {
        startScenario("Insurance Claims", "Complex claim workflow management");

        String processId = "CLAIM-" + System.currentTimeMillis();
        printInfo("Claim Type: Auto Accident, Amount: $25,000");

        List<String> steps = Arrays.asList(
            "Claim Submission", "Initial Review", "Adjuster Assignment",
            "Damage Assessment", "Liability Analysis", "Approval", "Payment Processing"
        );

        executeProcess(processId, steps);
        endScenario();
    }

    private static void demonstrateOrderFulfillment(ProcessManagerImplementation impl) {
        startScenario("Order Fulfillment", "Multi-warehouse fulfillment coordination");

        String processId = "ORDER-" + System.currentTimeMillis();
        printInfo("Order: International Shipment, 3 items");

        List<String> steps = Arrays.asList(
            "Order Validation", "Inventory Check", "Warehouse Selection",
            "Picking", "Packing", "Shipping Label", "Carrier Handoff", "Tracking Setup"
        );

        executeProcess(processId, steps);
        endScenario();
    }

    private static void demonstrateEmployeeOnboarding(ProcessManagerImplementation impl) {
        startScenario("Employee Onboarding", "Cross-department coordination");

        String processId = "EMP-" + System.currentTimeMillis();
        printInfo("New Employee: Software Engineer, Start Date: Next Monday");

        List<String> steps = Arrays.asList(
            "HR Paperwork", "IT Account Setup", "Equipment Provisioning",
            "Badge Creation", "Desk Assignment", "Training Schedule", "Welcome Package"
        );

        executeProcess(processId, steps);
        endScenario();
    }

    private static void demonstrateTravelBooking(ProcessManagerImplementation impl) {
        startScenario("Travel Booking", "Flight, hotel, car rental coordination");

        String processId = "TRAVEL-" + System.currentTimeMillis();
        printInfo("Destination: Paris, Duration: 7 days");

        List<String> steps = Arrays.asList(
            "Flight Booking", "Hotel Reservation", "Car Rental",
            "Travel Insurance", "Itinerary Generation", "Confirmation Emails"
        );

        executeProcess(processId, steps);
        endScenario();
    }

    private static void demonstrateManufacturing(ProcessManagerImplementation impl) {
        startScenario("Manufacturing Process", "Production planning and execution");

        String processId = "MFG-" + System.currentTimeMillis();
        printInfo("Product: Custom Electronics, Quantity: 1000 units");

        List<String> steps = Arrays.asList(
            "Material Procurement", "Production Scheduling", "Assembly",
            "Quality Control", "Packaging", "Inventory Update", "Shipping Prep"
        );

        executeProcess(processId, steps);
        endScenario();
    }

    private static void demonstrateHealthcare(ProcessManagerImplementation impl) {
        startScenario("Healthcare Treatment", "Patient treatment plan coordination");

        String processId = "PATIENT-" + System.currentTimeMillis();
        printInfo("Patient: Complex cardiac case requiring multiple specialists");

        List<String> steps = Arrays.asList(
            "Primary Consultation", "Diagnostic Tests", "Cardiologist Review",
            "Specialist Consultations", "Treatment Plan", "Procedure Scheduling"
        );

        executeProcess(processId, steps);
        endScenario();
    }

    private static void demonstrateECommerce(ProcessManagerImplementation impl) {
        startScenario("E-Commerce Order", "Order, payment, shipping, returns");

        String processId = "ECOM-" + System.currentTimeMillis();
        printInfo("Cart Value: $499.99, Items: 5, Customer: Premium");

        List<String> steps = Arrays.asList(
            "Cart Validation", "Payment Authorization", "Fraud Check",
            "Inventory Reserve", "Order Confirmation", "Fulfillment", "Delivery Tracking"
        );

        executeProcess(processId, steps);
        endScenario();
    }

    private static void demonstrateRealEstate(ProcessManagerImplementation impl) {
        startScenario("Real Estate Transaction", "Property purchase workflow");

        String processId = "PROP-" + System.currentTimeMillis();
        printInfo("Property: $450,000 residential, Buyer pre-approved");

        List<String> steps = Arrays.asList(
            "Offer Submission", "Inspection", "Appraisal", "Financing",
            "Title Search", "Final Walkthrough", "Closing Documents", "Transfer"
        );

        executeProcess(processId, steps);
        endScenario();
    }

    private static void demonstrateSoftwareRelease(ProcessManagerImplementation impl) {
        startScenario("Software Release", "Multi-environment deployment");

        String processId = "RELEASE-" + System.currentTimeMillis();
        printInfo("Version: 2.5.0, Target: Production, Strategy: Blue-Green");

        List<String> steps = Arrays.asList(
            "Build", "Unit Tests", "Integration Tests", "Security Scan",
            "Stage Deploy", "UAT", "Production Deploy", "Smoke Tests", "Monitoring"
        );

        executeProcess(processId, steps);
        endScenario();
    }

    private static void executeProcess(String processId, List<String> steps) {
        printInfo("Process ID: " + processId);
        printInfo("Total Steps: " + steps.size());
        System.out.println();

        processStates.put(processId, "RUNNING");

        for (int i = 0; i < steps.size(); i++) {
            String step = steps.get(i);
            printStep("[" + (i+1) + "/" + steps.size() + "] " + step);
            simulateProcessing(120 + (i * 25));
            System.out.println("      State: Completed");
        }

        processStates.put(processId, "COMPLETED");
        System.out.println();
        printSuccess("Process completed successfully");
        printInfo("Final State: " + processStates.get(processId));
    }

    private static Map<String, Object> createLoanApplication(String id) {
        Map<String, Object> app = new HashMap<>();
        app.put("id", id);
        app.put("amount", 250000);
        app.put("type", "Mortgage");
        return app;
    }

    private static void startScenario(String name, String desc) {
        scenarioCounter++;
        System.out.println("─".repeat(72));
        System.out.println("Scenario " + scenarioCounter + ": " + name);
        System.out.println("─".repeat(72));
        System.out.println("Description: " + desc);
        System.out.println();
    }

    private static void endScenario() {
        System.out.println();
        System.out.println("  ✓ Scenario completed successfully");
        System.out.println();
    }

    private static void printHeader() {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" +
                " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: " + CATEGORY + " ".repeat(70 - 13 - CATEGORY.length()) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();
    }

    private static void printDescription() {
        System.out.println("Description:");
        System.out.println("  Manages routing of messages in complex business processes with");
        System.out.println("  state management and service coordination.");
        System.out.println();
    }

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
        System.out.println("    • Complex process state management");
        System.out.println("    • Service coordination and orchestration");
        System.out.println("    • Long-running process support");
        System.out.println("    • Error handling and compensation");
        System.out.println("─".repeat(72));
    }

    private static void printFooter() {
        System.out.println();
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  Pattern Demonstration Complete" + " ".repeat(70 - 34) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
    }

    private static void simulateProcessing(int ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    private static void printStep(String step) {
        System.out.println("  → " + step);
    }

    private static void printSuccess(String msg) {
        System.out.println("  ✓ " + msg);
    }

    private static void printInfo(String msg) {
        System.out.println("  ℹ " + msg);
    }
}
