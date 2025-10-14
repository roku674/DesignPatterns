package Concurrency.StrategyPattern;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== StrategyPattern (Concurrency) Demo ===\n");
        StrategyPatternImpl impl = new StrategyPatternImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
