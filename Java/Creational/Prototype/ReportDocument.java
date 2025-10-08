import java.util.ArrayList;

/**
 * Concrete Prototype - Report document implementation
 */
public class ReportDocument extends Document {

    private String department;
    private String reportType;

    public ReportDocument() {
        super();
    }

    /**
     * Deep clone implementation for ReportDocument
     */
    @Override
    public ReportDocument clone() {
        ReportDocument cloned = new ReportDocument();
        cloned.title = this.title;
        cloned.content = this.content;
        cloned.author = this.author;
        cloned.department = this.department;
        cloned.reportType = this.reportType;

        // Deep copy of the tags list
        cloned.tags = new ArrayList<>(this.tags);

        return cloned;
    }

    @Override
    public void display() {
        System.out.println("\n=== REPORT DOCUMENT ===");
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("Department: " + department);
        System.out.println("Report Type: " + reportType);
        System.out.println("Content: " + content);
        System.out.println("Tags: " + tags);
        System.out.println("=======================\n");
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }
}
