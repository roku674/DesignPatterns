/**
 * Concrete Product B2 - Mac-style checkbox
 */
public class MacCheckbox implements Checkbox {

    private boolean checked = false;

    @Override
    public void render() {
        System.out.println("Rendering Mac-style checkbox (rounded with smooth checkmark animation)");
    }

    @Override
    public void toggle() {
        checked = !checked;
        System.out.println("Mac checkbox toggled with fade animation. Current state: " + (checked ? "CHECKED" : "UNCHECKED"));
    }
}
