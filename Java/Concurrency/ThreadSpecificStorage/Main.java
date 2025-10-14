package Concurrency.ThreadSpecificStorage;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== ThreadSpecificStorage Pattern Demo ===\n");
        ThreadSpecificStorageImpl impl = new ThreadSpecificStorageImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
