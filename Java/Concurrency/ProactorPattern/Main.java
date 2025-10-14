package Concurrency.ProactorPattern;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== ProactorPattern Demo ===\n");
        ProactorPatternImpl impl = new ProactorPatternImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
