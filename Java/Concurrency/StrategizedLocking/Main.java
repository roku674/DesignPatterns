package Concurrency.StrategizedLocking;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== StrategizedLocking Pattern Demo ===\n");
        StrategizedLockingImpl impl = new StrategizedLockingImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
