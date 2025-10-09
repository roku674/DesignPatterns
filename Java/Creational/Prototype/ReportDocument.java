import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Concrete Prototype - Report document implementation with real deep cloning
 */
public class ReportDocument extends Document {

    private static final long serialVersionUID = 1L;

    private String department;
    private String reportType;
    private Date reportDate;
    private ReportData data;

    public ReportDocument() {
        super();
        this.reportDate = new Date();
        this.data = new ReportData();
    }

    /**
     * Deep clone implementation using serialization
     */
    @Override
    public ReportDocument clone() {
        return (ReportDocument) deepClone();
    }

    @Override
    public void display() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        System.out.println("\n=== REPORT DOCUMENT ===");
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("Department: " + department);
        System.out.println("Report Type: " + reportType);
        System.out.println("Report Date: " + sdf.format(reportDate));
        System.out.println("Created: " + sdf.format(getCreatedDate()));
        System.out.println("Modified: " + sdf.format(getModifiedDate()));
        System.out.println("Content Preview: " + (content != null && content.length() > 100 ?
            content.substring(0, 100) + "..." : content));
        System.out.println("Tags: " + tags);
        System.out.println("Metadata: " + metadata);
        System.out.println("Report Data: " + data);
        System.out.println("Document Size: " + getSize() + " bytes");
        System.out.println("Valid: " + validate());
        System.out.println("========================\n");
    }

    public void setDepartment(String department) {
        this.department = department;
        this.modifiedDate = new Date();
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
        this.modifiedDate = new Date();
    }

    public String getDepartment() {
        return department;
    }

    public String getReportType() {
        return reportType;
    }

    public Date getReportDate() {
        return new Date(reportDate.getTime());
    }

    public ReportData getData() {
        return data;
    }

    /**
     * Inner class to hold report-specific data
     */
    public static class ReportData implements java.io.Serializable {
        private static final long serialVersionUID = 1L;

        private double revenue;
        private double expenses;
        private int totalSales;

        public ReportData() {
            this.revenue = 0.0;
            this.expenses = 0.0;
            this.totalSales = 0;
        }

        public void setRevenue(double revenue) {
            this.revenue = revenue;
        }

        public void setExpenses(double expenses) {
            this.expenses = expenses;
        }

        public void setTotalSales(int sales) {
            this.totalSales = sales;
        }

        public double getRevenue() {
            return revenue;
        }

        public double getExpenses() {
            return expenses;
        }

        public int getTotalSales() {
            return totalSales;
        }

        public double getProfit() {
            return revenue - expenses;
        }

        @Override
        public String toString() {
            return String.format("Revenue: $%.2f, Expenses: $%.2f, Sales: %d, Profit: $%.2f",
                revenue, expenses, totalSales, getProfit());
        }
    }
}
