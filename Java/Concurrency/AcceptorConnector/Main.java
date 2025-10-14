package Concurrency.AcceptorConnector;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== AcceptorConnector Pattern Demo ===\n");
        AcceptorConnectorImpl impl = new AcceptorConnectorImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
