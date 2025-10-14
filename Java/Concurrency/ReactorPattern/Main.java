package Concurrency.ReactorPattern;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== ReactorPattern Demo ===\n");
        ReactorPatternImpl impl = new ReactorPatternImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
