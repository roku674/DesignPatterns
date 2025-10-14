package Concurrency.Interceptor;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Interceptor Pattern Demo ===\n");
        InterceptorImpl impl = new InterceptorImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
