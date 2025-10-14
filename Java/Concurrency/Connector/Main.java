package Concurrency.Connector;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Connector Pattern Demo ===\n");
        ConnectorImpl impl = new ConnectorImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
