/**
 * Receiver - knows how to perform the operations
 */
public class Light {
    private boolean isOn = false;

    public void turnOn() {
        isOn = true;
        System.out.println("Light is ON");
    }

    public void turnOff() {
        isOn = false;
        System.out.println("Light is OFF");
    }

    public boolean isOn() {
        return isOn;
    }
}
