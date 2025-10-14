package Concurrency.Proactor;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Proactor Pattern Demo ===\n");
        ProactorImpl impl = new ProactorImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
