package Concurrency.ReadWriteLock;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== ReadWriteLock Pattern Demo ===\n");
        ReadWriteLockImpl impl = new ReadWriteLockImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
