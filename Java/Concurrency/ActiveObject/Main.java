package Concurrency.ActiveObject;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== ActiveObject Pattern Demo ===\n");
        ActiveObjectImpl activeObject = new ActiveObjectImpl();
        activeObject.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
