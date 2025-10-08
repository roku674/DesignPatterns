/**
 * Client class - works with factories and products through abstract interfaces
 */
public class Application {

    private Button button;
    private Checkbox checkbox;

    /**
     * Constructs the application with a specific GUI factory
     *
     * @param factory the GUI factory to use for creating components
     */
    public Application(GUIFactory factory) {
        button = factory.createButton();
        checkbox = factory.createCheckbox();
    }

    /**
     * Renders the application UI
     */
    public void render() {
        System.out.println("\nRendering Application UI:");
        button.render();
        checkbox.render();
    }

    /**
     * Simulates user interaction with the UI
     */
    public void interact() {
        System.out.println("\nSimulating User Interaction:");
        button.onClick();
        checkbox.toggle();
        checkbox.toggle();
    }
}
