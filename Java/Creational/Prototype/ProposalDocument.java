import java.util.ArrayList;

/**
 * Concrete Prototype - Proposal document implementation
 */
public class ProposalDocument extends Document {

    private String clientName;
    private double estimatedBudget;
    private int durationInDays;

    public ProposalDocument() {
        super();
    }

    /**
     * Deep clone implementation for ProposalDocument
     */
    @Override
    public ProposalDocument clone() {
        ProposalDocument cloned = new ProposalDocument();
        cloned.title = this.title;
        cloned.content = this.content;
        cloned.author = this.author;
        cloned.clientName = this.clientName;
        cloned.estimatedBudget = this.estimatedBudget;
        cloned.durationInDays = this.durationInDays;

        // Deep copy of the tags list
        cloned.tags = new ArrayList<>(this.tags);

        return cloned;
    }

    @Override
    public void display() {
        System.out.println("\n=== PROPOSAL DOCUMENT ===");
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("Client: " + clientName);
        System.out.println("Budget: $" + estimatedBudget);
        System.out.println("Duration: " + durationInDays + " days");
        System.out.println("Content: " + content);
        System.out.println("Tags: " + tags);
        System.out.println("=========================\n");
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public void setEstimatedBudget(double estimatedBudget) {
        this.estimatedBudget = estimatedBudget;
    }

    public void setDurationInDays(int durationInDays) {
        this.durationInDays = durationInDays;
    }
}
