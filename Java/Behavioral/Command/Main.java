/**
 * Main class to demonstrate Command pattern
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Command Pattern Demo ===\n");

        // Receiver
        Light livingRoomLight = new Light();

        // Commands
        Command lightOn = new LightOnCommand(livingRoomLight);
        Command lightOff = new LightOffCommand(livingRoomLight);

        // Invoker
        RemoteControl remote = new RemoteControl();

        // Turn light on
        System.out.println("--- Pressing ON button ---");
        remote.setCommand(lightOn);
        remote.pressButton();

        // Turn light off
        System.out.println("\n--- Pressing OFF button ---");
        remote.setCommand(lightOff);
        remote.pressButton();

        // Undo last command
        System.out.println("\n--- Pressing UNDO button ---");
        remote.pressUndo();

        // Undo again
        System.out.println("\n--- Pressing UNDO button again ---");
        remote.pressUndo();

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nCommand Pattern Benefits:");
        System.out.println("- Decouples invoker from receiver");
        System.out.println("- Supports undo/redo operations");
        System.out.println("- Commands can be queued and logged");
    }
}
