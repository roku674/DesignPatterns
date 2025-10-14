package Concurrency.Reactor;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Reactor Pattern Demo ===\n");
        ReactorImpl impl = new ReactorImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
