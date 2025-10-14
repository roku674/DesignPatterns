package Concurrency.WrapperFacade;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== WrapperFacade Pattern Demo ===\n");
        WrapperFacadeImpl impl = new WrapperFacadeImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
