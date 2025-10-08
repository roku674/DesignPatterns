/**
 * Abstract Factory interface - declares methods for creating abstract products
 */
public interface GUIFactory {

    /**
     * Creates a button component
     *
     * @return a Button instance
     */
    Button createButton();

    /**
     * Creates a checkbox component
     *
     * @return a Checkbox instance
     */
    Checkbox createCheckbox();
}
