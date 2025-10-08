/**
 * Concrete Product A1 - Windows-style button
 */
public class WindowsButton implements Button {

    @Override
    public void render() {
        System.out.println("Rendering Windows-style button with blue gradient");
    }

    @Override
    public void onClick() {
        System.out.println("Windows button clicked - Playing system sound");
    }
}
