package Concurrency.Acceptor;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Acceptor Pattern Demo ===\n");
        AcceptorImpl impl = new AcceptorImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
