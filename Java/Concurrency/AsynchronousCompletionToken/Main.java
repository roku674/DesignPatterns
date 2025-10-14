package Concurrency.AsynchronousCompletionToken;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== AsynchronousCompletionToken Pattern Demo ===\n");
        AsynchronousCompletionTokenImpl impl = new AsynchronousCompletionTokenImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
