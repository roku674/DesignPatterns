/** Main class to demonstrate Mediator pattern */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Mediator Pattern Demo ===\n");

        ChatMediator chatRoom = new ChatRoom();

        User alice = new User("Alice", chatRoom);
        User bob = new User("Bob", chatRoom);
        User charlie = new User("Charlie", chatRoom);

        chatRoom.addUser(alice);
        chatRoom.addUser(bob);
        chatRoom.addUser(charlie);

        alice.send("Hello everyone!");
        System.out.println();

        bob.send("Hi Alice!");
        System.out.println();

        System.out.println("=".repeat(50));
        System.out.println("\nMediator Pattern Benefits:");
        System.out.println("- Reduces coupling between colleagues");
        System.out.println("- Centralizes control logic");
        System.out.println("- Simplifies object protocols");
    }
}
