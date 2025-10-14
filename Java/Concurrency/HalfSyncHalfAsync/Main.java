package Concurrency.HalfSyncHalfAsync;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== HalfSyncHalfAsync Pattern Demo ===\n");
        HalfSyncHalfAsyncImpl impl = new HalfSyncHalfAsyncImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
