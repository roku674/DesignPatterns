package Concurrency.Balking;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Balking Pattern Demo ===\n");
        BalkingImpl impl = new BalkingImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
