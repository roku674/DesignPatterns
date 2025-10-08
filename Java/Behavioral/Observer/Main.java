/** Main class to demonstrate Observer pattern */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Observer Pattern Demo ===\n");

        Subject newsAgency = new Subject();

        Observer subscriber1 = new NewsSubscriber("Alice");
        Observer subscriber2 = new NewsSubscriber("Bob");
        Observer subscriber3 = new NewsSubscriber("Charlie");

        newsAgency.attach(subscriber1);
        newsAgency.attach(subscriber2);
        newsAgency.attach(subscriber3);

        System.out.println("--- Publishing news ---");
        newsAgency.setState("Breaking: Design Patterns are awesome!");

        System.out.println("\n--- Bob unsubscribes ---");
        newsAgency.detach(subscriber2);

        System.out.println("\n--- Publishing more news ---");
        newsAgency.setState("Update: Observer pattern in action!");

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nObserver Pattern Benefits:");
        System.out.println("- Loose coupling between subject and observers");
        System.out.println("- Dynamic relationships");
        System.out.println("- Broadcast communication");
    }
}
