package Concurrency.ExtensionInterface;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== ExtensionInterface Pattern Demo ===\n");
        ExtensionInterfaceImpl impl = new ExtensionInterfaceImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
