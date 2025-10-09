import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Concrete Prototype - Proposal document implementation with real deep cloning
 */
public class ProposalDocument extends Document {

    private static final long serialVersionUID = 1L;

    private String clientName;
    private double estimatedBudget;
    private int durationInDays;
    private Date submissionDeadline;
    private List<Milestone> milestones;

    public ProposalDocument() {
        super();
        this.milestones = new ArrayList<>();
    }

    /**
     * Deep clone implementation using serialization
     */
    @Override
    public ProposalDocument clone() {
        return (ProposalDocument) deepClone();
    }

    @Override
    public void display() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        System.out.println("\n=== PROPOSAL DOCUMENT ===");
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("Client: " + clientName);
        System.out.println("Budget: $" + String.format("%,.2f", estimatedBudget));
        System.out.println("Duration: " + durationInDays + " days");
        if (submissionDeadline != null) {
            System.out.println("Deadline: " + sdf.format(submissionDeadline));
        }
        System.out.println("Created: " + sdf.format(getCreatedDate()));
        System.out.println("Modified: " + sdf.format(getModifiedDate()));
        System.out.println("Content Preview: " + (content != null && content.length() > 100 ?
            content.substring(0, 100) + "..." : content));
        System.out.println("Tags: " + tags);
        System.out.println("Metadata: " + metadata);
        System.out.println("Milestones: " + milestones.size());
        for (Milestone m : milestones) {
            System.out.println("  - " + m);
        }
        System.out.println("Document Size: " + getSize() + " bytes");
        System.out.println("Valid: " + validate());
        System.out.println("===========================\n");
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
        this.modifiedDate = new Date();
    }

    public void setEstimatedBudget(double estimatedBudget) {
        this.estimatedBudget = estimatedBudget;
        this.modifiedDate = new Date();
    }

    public void setDurationInDays(int durationInDays) {
        this.durationInDays = durationInDays;
        this.modifiedDate = new Date();
    }

    public void setSubmissionDeadline(Date deadline) {
        this.submissionDeadline = deadline;
        this.modifiedDate = new Date();
    }

    public void addMilestone(String name, Date date, double payment) {
        milestones.add(new Milestone(name, date, payment));
        this.modifiedDate = new Date();
    }

    public String getClientName() {
        return clientName;
    }

    public double getEstimatedBudget() {
        return estimatedBudget;
    }

    public int getDurationInDays() {
        return durationInDays;
    }

    public Date getSubmissionDeadline() {
        return submissionDeadline != null ? new Date(submissionDeadline.getTime()) : null;
    }

    public List<Milestone> getMilestones() {
        return new ArrayList<>(milestones);
    }

    /**
     * Inner class to represent project milestones
     */
    public static class Milestone implements java.io.Serializable {
        private static final long serialVersionUID = 1L;

        private String name;
        private Date dueDate;
        private double paymentAmount;

        public Milestone(String name, Date dueDate, double paymentAmount) {
            this.name = name;
            this.dueDate = dueDate;
            this.paymentAmount = paymentAmount;
        }

        public String getName() {
            return name;
        }

        public Date getDueDate() {
            return new Date(dueDate.getTime());
        }

        public double getPaymentAmount() {
            return paymentAmount;
        }

        @Override
        public String toString() {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            return String.format("%s (Due: %s, Payment: $%.2f)",
                name, sdf.format(dueDate), paymentAmount);
        }
    }
}
