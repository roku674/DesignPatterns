/** Main class to demonstrate Facade pattern */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Facade Pattern Demo ===");

        ComputerFacade computer = new ComputerFacade();
        computer.start();

        System.out.println("Facade Pattern Benefits:");
        System.out.println("- Simplified interface to complex subsystem");
        System.out.println("- Reduces dependencies on subsystem classes");
        System.out.println("- Client code is easier to understand and maintain");
    }
}
