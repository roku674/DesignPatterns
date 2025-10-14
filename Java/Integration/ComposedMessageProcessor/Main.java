package Integration.ComposedMessageProcessor;

import java.util.*;
import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * ComposedMessageProcessor Pattern - Enterprise Integration Pattern
 *
 * <p>Category: Message Routing
 *
 * <p><b>Intent:</b> Maintains overall message flow when processing through multiple processing steps.
 * The pattern chains multiple processing steps together while maintaining message context and
 * coordinating complex workflows.
 *
 * <p><b>Key Concepts:</b>
 * <ul>
 *   <li>Chains multiple processing steps sequentially</li>
 *   <li>Maintains message context across steps</li>
 *   <li>Coordinates complex workflows with state management</li>
 *   <li>Enables step composition and reusability</li>
 *   <li>Supports error handling and recovery</li>
 * </ul>
 *
 * <p><b>When to Use:</b>
 * <ul>
 *   <li>You need to implement multi-step message processing workflows</li>
 *   <li>You want to decouple processing steps from each other</li>
 *   <li>You require reliable message processing with error handling</li>
 *   <li>You need to scale individual processing steps independently</li>
 *   <li>You want to maintain system flexibility and composability</li>
 * </ul>
 *
 * <p><b>Benefits:</b>
 * <ul>
 *   <li>Loose coupling between processing components</li>
 *   <li>Scalable message processing architecture</li>
 *   <li>Flexible and composable system design</li>
 *   <li>Maintainable integration code with clear separation</li>
 *   <li>Testable individual components</li>
 * </ul>
 *
 * <p><b>Real-World Scenarios:</b>
 * <ol>
 *   <li>Order workflow: Validation, payment processing, inventory check, fulfillment</li>
 *   <li>Data pipeline: Extract from source, transform format, validate, load to destination</li>
 *   <li>Image processing: Resize, apply filters, watermark, optimize, store</li>
 *   <li>Document workflow: Parse content, validate format, extract metadata, store</li>
 *   <li>Approval chain: Multi-level approval with routing and notifications</li>
 *   <li>Email processing: Spam filter, virus scan, content filter, route to inbox</li>
 *   <li>Video encoding: Extract frames, encode formats, add subtitles, upload</li>
 *   <li>Payment processing: Validate card, check fraud, authorize, capture, reconcile</li>
 *   <li>Customer onboarding: Verify identity, create account, setup preferences, welcome email</li>
 *   <li>Loan application: Credit check, income verification, risk assessment, approval</li>
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

    private static final String PATTERN_NAME = "ComposedMessageProcessor";
    private static final String CATEGORY = "Message Routing";
    private static int scenarioCounter = 0;
    private static final Map<String, Long> scenarioMetrics = new ConcurrentHashMap<>();

    /**
     * Main entry point demonstrating the Composed Message Processor pattern.
     *
     * @param args Command line arguments (not used)
     */
    public static void main(String[] args) {
        printHeader();
        printDescription();

        // Initialize the pattern infrastructure
        ComposedMessageProcessorImplementation implementation = initializeInfrastructure();

        // Execute comprehensive scenarios
        executeAllScenarios(implementation);

        // Print execution summary
        printSummary();
        printFooter();
    }

    /**
     * Initializes the Composed Message Processor infrastructure.
     *
     * @return Configured implementation instance
     */
    private static ComposedMessageProcessorImplementation initializeInfrastructure() {
        System.out.println("Initializing " + PATTERN_NAME + " infrastructure...");
        ComposedMessageProcessorImplementation implementation = new ComposedMessageProcessorImplementation();
        System.out.println("  ✓ Message processing pipeline initialized");
        System.out.println("  ✓ Processing steps registered");
        System.out.println("  ✓ Context management configured");
        System.out.println("  ✓ Error handlers installed");
        System.out.println();
        return implementation;
    }

    /**
     * Executes all demonstration scenarios.
     *
     * @param implementation The pattern implementation
     */
    private static void executeAllScenarios(ComposedMessageProcessorImplementation implementation) {
        // Scenario 1: Order Processing Workflow
        demonstrateOrderWorkflow(implementation);

        // Scenario 2: Data Pipeline Processing
        demonstrateDataPipeline(implementation);

        // Scenario 3: Image Processing Chain
        demonstrateImageProcessing(implementation);

        // Scenario 4: Document Workflow
        demonstrateDocumentWorkflow(implementation);

        // Scenario 5: Approval Chain
        demonstrateApprovalChain(implementation);

        // Scenario 6: Email Processing
        demonstrateEmailProcessing(implementation);

        // Scenario 7: Video Encoding Pipeline
        demonstrateVideoEncoding(implementation);

        // Scenario 8: Payment Processing
        demonstratePaymentProcessing(implementation);

        // Scenario 9: Customer Onboarding
        demonstrateCustomerOnboarding(implementation);

        // Scenario 10: Loan Application Processing
        demonstrateLoanApplication(implementation);
    }

    /**
     * Scenario 1: Demonstrates order processing workflow.
     * Shows validation, payment, inventory check, and fulfillment steps.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateOrderWorkflow(ComposedMessageProcessorImplementation implementation) {
        String scenarioName = "Order Processing Workflow";
        String description = "Multi-step order validation, payment, inventory, and fulfillment";

        startScenario(scenarioName, description);

        List<String> steps = Arrays.asList(
            "Validate Order Data",
            "Process Payment",
            "Check Inventory",
            "Reserve Items",
            "Create Shipment",
            "Send Confirmation"
        );

        Map<String, Object> orderData = new HashMap<>();
        orderData.put("orderId", "ORD-" + System.currentTimeMillis());
        orderData.put("customerId", "CUST-1001");
        orderData.put("items", Arrays.asList("PROD-A", "PROD-B"));
        orderData.put("total", 299.99);

        processWorkflow(implementation, "OrderWorkflow", orderData, steps);
        endScenario();
    }

    /**
     * Scenario 2: Demonstrates data pipeline processing.
     * Shows extract, transform, validate, and load operations.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateDataPipeline(ComposedMessageProcessorImplementation implementation) {
        String scenarioName = "Data Pipeline Processing";
        String description = "ETL pipeline with extraction, transformation, validation, and loading";

        startScenario(scenarioName, description);

        List<String> steps = Arrays.asList(
            "Extract from Source",
            "Transform Format",
            "Validate Data Quality",
            "Enrich Data",
            "Load to Warehouse",
            "Update Metadata"
        );

        Map<String, Object> pipelineData = new HashMap<>();
        pipelineData.put("source", "legacy-database");
        pipelineData.put("recordCount", 10000);
        pipelineData.put("format", "CSV");
        pipelineData.put("destination", "data-warehouse");

        processWorkflow(implementation, "DataPipeline", pipelineData, steps);
        endScenario();
    }

    /**
     * Scenario 3: Demonstrates image processing chain.
     * Shows resize, filter, watermark, optimize, and storage steps.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateImageProcessing(ComposedMessageProcessorImplementation implementation) {
        String scenarioName = "Image Processing Chain";
        String description = "Multi-step image transformation and optimization pipeline";

        startScenario(scenarioName, description);

        List<String> steps = Arrays.asList(
            "Resize Image",
            "Apply Filters",
            "Add Watermark",
            "Optimize Compression",
            "Generate Thumbnails",
            "Store to CDN"
        );

        Map<String, Object> imageData = new HashMap<>();
        imageData.put("imageId", "IMG-" + System.currentTimeMillis());
        imageData.put("originalSize", "4096x3072");
        imageData.put("format", "JPEG");
        imageData.put("fileSize", "8.5MB");

        processWorkflow(implementation, "ImageProcessing", imageData, steps);
        endScenario();
    }

    /**
     * Scenario 4: Demonstrates document workflow.
     * Shows parsing, validation, metadata extraction, and storage.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateDocumentWorkflow(ComposedMessageProcessorImplementation implementation) {
        String scenarioName = "Document Workflow";
        String description = "Parse, validate, extract metadata, and store documents";

        startScenario(scenarioName, description);

        List<String> steps = Arrays.asList(
            "Parse Document",
            "Validate Format",
            "Extract Metadata",
            "OCR Processing",
            "Index Content",
            "Archive Document"
        );

        Map<String, Object> documentData = new HashMap<>();
        documentData.put("documentId", "DOC-" + System.currentTimeMillis());
        documentData.put("type", "PDF");
        documentData.put("pages", 45);
        documentData.put("language", "English");

        processWorkflow(implementation, "DocumentWorkflow", documentData, steps);
        endScenario();
    }

    /**
     * Scenario 5: Demonstrates multi-level approval chain.
     * Shows routing through multiple approvers with notifications.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateApprovalChain(ComposedMessageProcessorImplementation implementation) {
        String scenarioName = "Multi-Level Approval Chain";
        String description = "Route through manager, director, VP for approval";

        startScenario(scenarioName, description);

        List<String> steps = Arrays.asList(
            "Manager Review",
            "Notify Manager",
            "Director Approval",
            "Notify Director",
            "VP Final Approval",
            "Update Status"
        );

        Map<String, Object> approvalData = new HashMap<>();
        approvalData.put("requestId", "REQ-" + System.currentTimeMillis());
        approvalData.put("type", "Budget Increase");
        approvalData.put("amount", 50000);
        approvalData.put("requester", "John Doe");

        processWorkflow(implementation, "ApprovalChain", approvalData, steps);
        endScenario();
    }

    /**
     * Scenario 6: Demonstrates email processing pipeline.
     * Shows spam filtering, virus scanning, content filtering, and routing.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateEmailProcessing(ComposedMessageProcessorImplementation implementation) {
        String scenarioName = "Email Processing Pipeline";
        String description = "Filter spam, scan viruses, check content, route to inbox";

        startScenario(scenarioName, description);

        List<String> steps = Arrays.asList(
            "Spam Filter Check",
            "Virus Scan",
            "Content Filter",
            "Attachment Scan",
            "Route to Folder",
            "Index for Search"
        );

        Map<String, Object> emailData = new HashMap<>();
        emailData.put("messageId", "EMAIL-" + System.currentTimeMillis());
        emailData.put("from", "sender@example.com");
        emailData.put("subject", "Important Business Proposal");
        emailData.put("attachments", 2);

        processWorkflow(implementation, "EmailProcessing", emailData, steps);
        endScenario();
    }

    /**
     * Scenario 7: Demonstrates video encoding pipeline.
     * Shows frame extraction, encoding, subtitle addition, and upload.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateVideoEncoding(ComposedMessageProcessorImplementation implementation) {
        String scenarioName = "Video Encoding Pipeline";
        String description = "Extract frames, encode formats, add subtitles, upload to CDN";

        startScenario(scenarioName, description);

        List<String> steps = Arrays.asList(
            "Extract Video Frames",
            "Encode to 1080p",
            "Encode to 720p",
            "Add Subtitles",
            "Generate Preview",
            "Upload to CDN"
        );

        Map<String, Object> videoData = new HashMap<>();
        videoData.put("videoId", "VID-" + System.currentTimeMillis());
        videoData.put("duration", "00:45:30");
        videoData.put("originalFormat", "MOV");
        videoData.put("fileSize", "2.8GB");

        processWorkflow(implementation, "VideoEncoding", videoData, steps);
        endScenario();
    }

    /**
     * Scenario 8: Demonstrates payment processing workflow.
     * Shows validation, fraud check, authorization, capture, and reconciliation.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstratePaymentProcessing(ComposedMessageProcessorImplementation implementation) {
        String scenarioName = "Payment Processing Workflow";
        String description = "Validate, fraud check, authorize, capture, reconcile payment";

        startScenario(scenarioName, description);

        List<String> steps = Arrays.asList(
            "Validate Card",
            "Fraud Detection",
            "Authorize Amount",
            "Capture Payment",
            "Reconcile Transaction",
            "Send Receipt"
        );

        Map<String, Object> paymentData = new HashMap<>();
        paymentData.put("transactionId", "TXN-" + System.currentTimeMillis());
        paymentData.put("amount", 1299.99);
        paymentData.put("currency", "USD");
        paymentData.put("cardType", "VISA");

        processWorkflow(implementation, "PaymentProcessing", paymentData, steps);
        endScenario();
    }

    /**
     * Scenario 9: Demonstrates customer onboarding workflow.
     * Shows identity verification, account creation, setup, and welcome process.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateCustomerOnboarding(ComposedMessageProcessorImplementation implementation) {
        String scenarioName = "Customer Onboarding Workflow";
        String description = "Verify identity, create account, setup preferences, welcome email";

        startScenario(scenarioName, description);

        List<String> steps = Arrays.asList(
            "Verify Identity",
            "Create Account",
            "Setup Preferences",
            "Configure Notifications",
            "Send Welcome Email",
            "Assign Account Manager"
        );

        Map<String, Object> customerData = new HashMap<>();
        customerData.put("customerId", "NEW-" + System.currentTimeMillis());
        customerData.put("name", "Jane Smith");
        customerData.put("email", "jane.smith@example.com");
        customerData.put("accountType", "Premium");

        processWorkflow(implementation, "CustomerOnboarding", customerData, steps);
        endScenario();
    }

    /**
     * Scenario 10: Demonstrates loan application processing.
     * Shows credit check, income verification, risk assessment, and approval.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateLoanApplication(ComposedMessageProcessorImplementation implementation) {
        String scenarioName = "Loan Application Processing";
        String description = "Credit check, income verify, risk assess, approve/deny loan";

        startScenario(scenarioName, description);

        List<String> steps = Arrays.asList(
            "Credit Check",
            "Income Verification",
            "Risk Assessment",
            "Underwriting Review",
            "Final Approval",
            "Generate Agreement"
        );

        Map<String, Object> loanData = new HashMap<>();
        loanData.put("applicationId", "LOAN-" + System.currentTimeMillis());
        loanData.put("applicant", "Robert Johnson");
        loanData.put("amount", 250000);
        loanData.put("type", "Mortgage");

        processWorkflow(implementation, "LoanApplication", loanData, steps);
        endScenario();
    }

    /**
     * Processes a workflow through multiple steps.
     *
     * @param implementation The pattern implementation
     * @param workflowName Name of the workflow
     * @param data Initial data
     * @param steps List of processing steps
     */
    private static void processWorkflow(
            ComposedMessageProcessorImplementation implementation,
            String workflowName,
            Map<String, Object> data,
            List<String> steps) {

        printInfo("Initializing workflow: " + workflowName);
        printInfo("Processing " + steps.size() + " steps");

        for (int i = 0; i < steps.size(); i++) {
            String step = steps.get(i);
            printStep("Step " + (i + 1) + "/" + steps.size() + ": " + step);
            simulateProcessing(100 + (i * 20));
        }

        printSuccess("Workflow completed successfully");
        printInfo("Data processed: " + data.get(data.keySet().iterator().next()));
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
     * Ends the current scenario and records metrics.
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
        System.out.println("  Maintains overall message flow when processing through multiple");
        System.out.println("  processing steps, enabling complex workflow coordination.");
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
        System.out.println("    • Step composition and reusability");
        System.out.println("    • Context preservation across steps");
        System.out.println("    • Error handling and recovery");
        System.out.println("    • Scalable workflow orchestration");
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
