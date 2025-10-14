package Concurrency.ScopedLocking;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== ScopedLocking Pattern Demo ===\n");
        ScopedLockingImpl impl = new ScopedLockingImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
