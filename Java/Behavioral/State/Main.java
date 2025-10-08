/** Main class to demonstrate State pattern */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== State Pattern Demo ===\n");

        VendingMachine machine = new VendingMachine();

        System.out.println("--- Trying to dispense without coin ---");
        machine.dispense();

        System.out.println("\n--- Inserting coin ---");
        machine.insertCoin();

        System.out.println("\n--- Dispensing product ---");
        machine.dispense();

        System.out.println("\n--- Inserting coin and ejecting ---");
        machine.insertCoin();
        machine.ejectCoin();

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nState Pattern Benefits:");
        System.out.println("- Localizes state-specific behavior");
        System.out.println("- Makes state transitions explicit");
        System.out.println("- State objects can be shared");
    }
}
