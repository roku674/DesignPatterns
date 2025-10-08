package Enterprise.TemplateView;

/**
 * TemplateView Pattern Demonstration
 *
 * Renders information into HTML by embedding markers in HTML
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== TemplateView Pattern Demo ===\n");

        // Create implementation
        TemplateViewImpl implementation = new TemplateViewImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
