package Microservices.EventSourcingMS;

/**
 * Event Sourcing Pattern Demonstration
 *
 * Stores state changes as a sequence of events rather than current state.
 * Complete history is preserved and state can be reconstructed at any point.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Event Sourcing Pattern Demo ===\n");

        EventStore eventStore = new EventStore();
        AccountAggregate account = new AccountAggregate("ACC-123", eventStore);

        System.out.println("1. Account Operations");
        System.out.println("-".repeat(50));
        account.create("John Doe", 0.0);
        account.deposit(100.0);
        account.deposit(50.0);
        account.withdraw(30.0);

        System.out.println("\n2. Current State");
        System.out.println("-".repeat(50));
        account.printState();

        System.out.println("\n3. Event History");
        System.out.println("-".repeat(50));
        eventStore.printEvents("ACC-123");

        System.out.println("\n4. Rebuilding State from Events");
        System.out.println("-".repeat(50));
        AccountAggregate rebuiltAccount = new AccountAggregate("ACC-123", eventStore);
        rebuiltAccount.rebuildFromEvents();
        rebuiltAccount.printState();

        System.out.println("\n=== Pattern demonstration complete ===");
    }
}
