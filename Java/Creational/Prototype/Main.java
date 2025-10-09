import java.util.Calendar;
import java.util.Date;

/**
 * Main class to demonstrate the Prototype pattern with real deep cloning
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Prototype Pattern - Real Deep Cloning Demo ===\n");

        // Create a registry for document prototypes
        DocumentRegistry registry = new DocumentRegistry();

        // Example 1: Create and register prototype templates
        System.out.println("--- Example 1: Creating Prototype Templates ---");
        createPrototypeTemplates(registry);
        System.out.println();

        // Example 2: Clone documents from templates
        System.out.println("--- Example 2: Cloning Documents from Templates ---");
        demonstrateBasicCloning(registry);
        System.out.println();

        // Example 3: Demonstrate deep cloning independence
        System.out.println("--- Example 3: Deep Cloning Independence ---");
        demonstrateDeepCloning();
        System.out.println();

        // Example 4: Clone with complex nested objects
        System.out.println("--- Example 4: Complex Object Cloning ---");
        demonstrateComplexCloning();
        System.out.println();

        // Example 5: Performance comparison
        System.out.println("--- Example 5: Performance Comparison ---");
        demonstratePerformance(registry);
        System.out.println();

        // Example 6: Serialization-based cloning
        System.out.println("--- Example 6: Serialization-Based Deep Cloning ---");
        demonstrateSerializationCloning();
        System.out.println();

        System.out.println("=== Prototype Pattern Demo Complete ===");
    }

    /**
     * Creates and registers prototype templates
     */
    private static void createPrototypeTemplates(DocumentRegistry registry) {
        // Create monthly report template
        ReportDocument reportTemplate = new ReportDocument();
        reportTemplate.setTitle("Monthly Report Template");
        reportTemplate.setAuthor("System Generated");
        reportTemplate.setDepartment("Sales");
        reportTemplate.setReportType("Monthly Summary");
        reportTemplate.setContent("This template provides a standard format for monthly sales reports including key metrics and analysis.");
        reportTemplate.addTag("monthly");
        reportTemplate.addTag("sales");
        reportTemplate.addTag("template");
        reportTemplate.getMetadata().setStatus("Template");
        registry.addPrototype("monthly-report", reportTemplate);

        // Create project proposal template
        ProposalDocument proposalTemplate = new ProposalDocument();
        proposalTemplate.setTitle("Project Proposal Template");
        proposalTemplate.setAuthor("Project Management Office");
        proposalTemplate.setContent("Standard template for project proposals including scope, timeline, and budget breakdown.");
        proposalTemplate.addTag("proposal");
        proposalTemplate.addTag("project");
        proposalTemplate.addTag("template");
        proposalTemplate.getMetadata().setStatus("Template");
        registry.addPrototype("project-proposal", proposalTemplate);

        System.out.println("Registered 2 prototype templates in the registry");
        System.out.println("Templates can now be cloned to create new documents quickly");
    }

    /**
     * Demonstrates basic cloning from templates
     */
    private static void demonstrateBasicCloning(DocumentRegistry registry) {
        // Clone and customize January report
        ReportDocument januaryReport = (ReportDocument) registry.getPrototype("monthly-report");
        januaryReport.setTitle("January 2024 Sales Report");
        januaryReport.setAuthor("Jane Smith");
        januaryReport.setContent("Q1 sales exceeded expectations with a 15% increase over December. Key wins include new enterprise clients and expanded product line.");
        januaryReport.getData().setRevenue(250000.00);
        januaryReport.getData().setExpenses(180000.00);
        januaryReport.getData().setTotalSales(450);
        januaryReport.getMetadata().setStatus("Published");
        januaryReport.getMetadata().incrementVersion();
        januaryReport.display();

        // Clone and customize February report
        ReportDocument februaryReport = (ReportDocument) registry.getPrototype("monthly-report");
        februaryReport.setTitle("February 2024 Sales Report");
        februaryReport.setAuthor("Jane Smith");
        februaryReport.setContent("February showed steady growth with a 12% increase. Focused on customer retention and upselling initiatives.");
        februaryReport.getData().setRevenue(280000.00);
        februaryReport.getData().setExpenses(190000.00);
        februaryReport.getData().setTotalSales(520);
        februaryReport.addTag("Q1");
        februaryReport.display();

        // Clone and customize proposal
        ProposalDocument websiteProposal = (ProposalDocument) registry.getPrototype("project-proposal");
        websiteProposal.setTitle("Corporate Website Redesign - Acme Corp");
        websiteProposal.setAuthor("John Doe");
        websiteProposal.setClientName("Acme Corporation");
        websiteProposal.setEstimatedBudget(75000.00);
        websiteProposal.setDurationInDays(120);
        websiteProposal.setContent("Complete redesign of corporate website including UX/UI improvements, mobile responsiveness, and SEO optimization.");

        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, 90);
        websiteProposal.setSubmissionDeadline(cal.getTime());

        cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, 30);
        websiteProposal.addMilestone("Design Phase", cal.getTime(), 25000.00);
        cal.add(Calendar.DAY_OF_MONTH, 30);
        websiteProposal.addMilestone("Development Phase", cal.getTime(), 35000.00);
        cal.add(Calendar.DAY_OF_MONTH, 30);
        websiteProposal.addMilestone("Testing & Launch", cal.getTime(), 15000.00);

        websiteProposal.display();
    }

    /**
     * Demonstrates that clones are truly independent (deep copy)
     */
    private static void demonstrateDeepCloning() {
        System.out.println("Creating original document with complex data...");
        ReportDocument original = new ReportDocument();
        original.setTitle("Q1 Financial Report");
        original.setAuthor("Alice Johnson");
        original.setDepartment("Finance");
        original.setReportType("Quarterly");
        original.setContent("Detailed financial analysis for Q1 2024");
        original.addTag("finance");
        original.addTag("Q1");
        original.getData().setRevenue(500000.00);
        original.getData().setExpenses(350000.00);
        original.getData().setTotalSales(1200);
        System.out.println("Original document created");
        System.out.println();

        // Clone the document
        System.out.println("Cloning the document...");
        ReportDocument cloned = original.clone();
        System.out.println("Clone created successfully");
        System.out.println();

        // Modify the clone
        System.out.println("Modifying cloned document...");
        cloned.setTitle("Q2 Financial Report");
        cloned.setAuthor("Bob Wilson");
        cloned.setContent("Detailed financial analysis for Q2 2024");
        cloned.addTag("Q2");
        cloned.getData().setRevenue(550000.00);
        cloned.getData().setExpenses(375000.00);
        cloned.getData().setTotalSales(1350);
        System.out.println("Clone modified");
        System.out.println();

        // Verify independence
        System.out.println("=== Verifying Deep Copy Independence ===");
        System.out.println("ORIGINAL:");
        System.out.println("  Title: " + original.getTitle());
        System.out.println("  Author: " + original.getAuthor());
        System.out.println("  Tags: " + original.getTags());
        System.out.println("  Data: " + original.getData());
        System.out.println();

        System.out.println("CLONED:");
        System.out.println("  Title: " + cloned.getTitle());
        System.out.println("  Author: " + cloned.getAuthor());
        System.out.println("  Tags: " + cloned.getTags());
        System.out.println("  Data: " + cloned.getData());
        System.out.println();

        System.out.println("Are they the same object? " + (original == cloned));
        System.out.println("Do they have equal content? " + original.equals(cloned));
        System.out.println("Conclusion: Changes to clone do NOT affect original (true deep copy)");
    }

    /**
     * Demonstrates cloning with complex nested objects
     */
    private static void demonstrateComplexCloning() {
        ProposalDocument complexProposal = new ProposalDocument();
        complexProposal.setTitle("Enterprise Software Implementation");
        complexProposal.setAuthor("Sarah Martinez");
        complexProposal.setClientName("GlobalTech Industries");
        complexProposal.setEstimatedBudget(500000.00);
        complexProposal.setDurationInDays(365);
        complexProposal.setContent("Comprehensive enterprise software solution with multiple phases and deliverables.");

        // Add multiple milestones
        Calendar cal = Calendar.getInstance();
        for (int i = 1; i <= 12; i++) {
            cal.add(Calendar.MONTH, 1);
            complexProposal.addMilestone("Phase " + i, cal.getTime(), 41666.67);
        }

        complexProposal.addTag("enterprise");
        complexProposal.addTag("software");
        complexProposal.addTag("long-term");

        System.out.println("Original complex proposal:");
        System.out.println("  Title: " + complexProposal.getTitle());
        System.out.println("  Client: " + complexProposal.getClientName());
        System.out.println("  Milestones: " + complexProposal.getMilestones().size());
        System.out.println();

        // Clone and verify all nested objects are copied
        ProposalDocument clonedProposal = complexProposal.clone();
        clonedProposal.setTitle("Enterprise Software Implementation - Phase 2");
        clonedProposal.setClientName("GlobalTech Industries - Division B");

        System.out.println("Cloned and modified proposal:");
        System.out.println("  Title: " + clonedProposal.getTitle());
        System.out.println("  Client: " + clonedProposal.getClientName());
        System.out.println("  Milestones: " + clonedProposal.getMilestones().size());
        System.out.println();

        System.out.println("Original remains unchanged:");
        System.out.println("  Title: " + complexProposal.getTitle());
        System.out.println("  Client: " + complexProposal.getClientName());
    }

    /**
     * Demonstrates performance benefits of cloning
     */
    private static void demonstratePerformance(DocumentRegistry registry) {
        long startTime, endTime;
        int iterations = 1000;

        // Measure cloning performance
        startTime = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            ReportDocument cloned = (ReportDocument) registry.getPrototype("monthly-report");
            cloned.setTitle("Report " + i);
        }
        endTime = System.nanoTime();
        long cloningTime = (endTime - startTime) / 1000000; // Convert to milliseconds

        // Measure creation from scratch performance
        startTime = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            ReportDocument newDoc = new ReportDocument();
            newDoc.setTitle("Report " + i);
            newDoc.setAuthor("System Generated");
            newDoc.setDepartment("Sales");
            newDoc.setReportType("Monthly Summary");
            newDoc.setContent("Standard content");
            newDoc.addTag("monthly");
            newDoc.addTag("sales");
        }
        endTime = System.nanoTime();
        long creationTime = (endTime - startTime) / 1000000; // Convert to milliseconds

        System.out.println("Performance test (" + iterations + " iterations):");
        System.out.println("  Cloning time: " + cloningTime + "ms");
        System.out.println("  Creation time: " + creationTime + "ms");
        System.out.println("  Speedup: " + String.format("%.2fx", (double)creationTime / cloningTime));
        System.out.println("Cloning is faster when objects have complex initialization!");
    }

    /**
     * Demonstrates serialization-based deep cloning
     */
    private static void demonstrateSerializationCloning() {
        ReportDocument original = new ReportDocument();
        original.setTitle("Serialization Test Document");
        original.setAuthor("Test Author");
        original.setDepartment("Engineering");
        original.setReportType("Technical");
        original.setContent("Testing serialization-based cloning mechanism");
        original.addTag("test");
        original.addTag("serialization");
        original.getData().setRevenue(100000.00);
        original.getData().setExpenses(75000.00);

        System.out.println("Original document size: " + original.getSize() + " bytes");
        System.out.println("Original created: " + original.getCreatedDate());

        // Clone using serialization
        ReportDocument clone = original.clone();

        // Wait a moment to show different modification times
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        clone.setTitle("Cloned Document");

        System.out.println("\nClone created: " + clone.getCreatedDate());
        System.out.println("Clone modified: " + clone.getModifiedDate());
        System.out.println("\nOriginal and clone have different creation/modification times");
        System.out.println("Serialization ensures complete deep copy of all object graphs");
    }
}
