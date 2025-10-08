/**
 * Main class to demonstrate the Prototype pattern
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Prototype Pattern Demo ===\n");

        // Create a registry for document prototypes
        DocumentRegistry registry = new DocumentRegistry();

        // Create and configure prototype documents
        System.out.println("--- Creating Prototype Templates ---\n");

        // Create a monthly report template
        ReportDocument monthlyReportTemplate = new ReportDocument();
        monthlyReportTemplate.setTitle("Monthly Report Template");
        monthlyReportTemplate.setAuthor("System Generated");
        monthlyReportTemplate.setDepartment("Sales");
        monthlyReportTemplate.setReportType("Monthly");
        monthlyReportTemplate.setContent("This is a template for monthly reports.");
        monthlyReportTemplate.addTag("monthly");
        monthlyReportTemplate.addTag("sales");
        monthlyReportTemplate.addTag("report");

        // Create a project proposal template
        ProposalDocument proposalTemplate = new ProposalDocument();
        proposalTemplate.setTitle("Project Proposal Template");
        proposalTemplate.setAuthor("Project Manager");
        proposalTemplate.setContent("Standard project proposal template.");
        proposalTemplate.addTag("proposal");
        proposalTemplate.addTag("project");

        // Register the templates
        registry.addPrototype("monthly-report", monthlyReportTemplate);
        registry.addPrototype("project-proposal", proposalTemplate);

        System.out.println("Templates registered in the registry.\n");

        // Clone and customize documents from templates
        System.out.println("--- Creating Documents from Templates ---\n");

        // Create January report from template
        System.out.println("Creating January Report:");
        ReportDocument januaryReport = (ReportDocument) registry.getPrototype("monthly-report");
        januaryReport.setTitle("January 2024 Sales Report");
        januaryReport.setContent("Sales data for January 2024: Revenue increased by 15%");
        januaryReport.display();

        // Create February report from template
        System.out.println("Creating February Report:");
        ReportDocument februaryReport = (ReportDocument) registry.getPrototype("monthly-report");
        februaryReport.setTitle("February 2024 Sales Report");
        februaryReport.setContent("Sales data for February 2024: Revenue increased by 12%");
        februaryReport.addTag("Q1");
        februaryReport.display();

        // Create proposal for Client A
        System.out.println("Creating Proposal for Client A:");
        ProposalDocument proposalA = (ProposalDocument) registry.getPrototype("project-proposal");
        proposalA.setTitle("Website Redesign Proposal");
        proposalA.setClientName("Acme Corporation");
        proposalA.setEstimatedBudget(50000.00);
        proposalA.setDurationInDays(90);
        proposalA.setContent("Comprehensive website redesign including UX improvements and mobile optimization.");
        proposalA.display();

        // Create proposal for Client B
        System.out.println("Creating Proposal for Client B:");
        ProposalDocument proposalB = (ProposalDocument) registry.getPrototype("project-proposal");
        proposalB.setTitle("Mobile App Development Proposal");
        proposalB.setClientName("TechStart Inc.");
        proposalB.setEstimatedBudget(120000.00);
        proposalB.setDurationInDays(180);
        proposalB.setContent("Native mobile application for iOS and Android platforms.");
        proposalB.addTag("mobile");
        proposalB.addTag("ios");
        proposalB.addTag("android");
        proposalB.display();

        // Demonstrate that prototypes are independent
        System.out.println("--- Demonstrating Prototype Independence ---\n");
        System.out.println("Original monthly report template:");
        monthlyReportTemplate.display();

        System.out.println("January report (modified clone):");
        januaryReport.display();

        System.out.println("Notice: Changes to the clone don't affect the original template!\n");

        // Performance comparison
        System.out.println("--- Performance Benefit ---");
        System.out.println("Cloning is faster than creating and initializing new objects from scratch.");
        System.out.println("Especially useful when object creation is expensive (database calls, file I/O, etc.)");
    }
}
