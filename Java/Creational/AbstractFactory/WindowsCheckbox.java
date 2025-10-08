/**
 * Concrete Product B1 - Windows-style checkbox
 */
public class WindowsCheckbox implements Checkbox {

    private boolean checked = false;

    @Override
    public void render() {
        System.out.println("Rendering Windows-style checkbox (square with checkmark)");
    }

    @Override
    public void toggle() {
        checked = !checked;
        System.out.println("Windows checkbox toggled. Current state: " + (checked ? "CHECKED" : "UNCHECKED"));
    }
}
