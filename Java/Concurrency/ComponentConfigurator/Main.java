package Concurrency.ComponentConfigurator;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== ComponentConfigurator Pattern Demo ===\n");
        ComponentConfiguratorImpl impl = new ComponentConfiguratorImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
