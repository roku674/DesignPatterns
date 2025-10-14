package Concurrency.ThreadSafeInterface;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== ThreadSafeInterface Pattern Demo ===\n");
        ThreadSafeInterfaceImpl impl = new ThreadSafeInterfaceImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
