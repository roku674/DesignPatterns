/**
 * Concrete Product A2 - Mac-style button
 */
public class MacButton implements Button {

    @Override
    public void render() {
        System.out.println("Rendering Mac-style button with rounded corners and subtle shadow");
    }

    @Override
    public void onClick() {
        System.out.println("Mac button clicked - Smooth animation effect");
    }
}
