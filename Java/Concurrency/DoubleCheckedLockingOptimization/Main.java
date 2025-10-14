package Concurrency.DoubleCheckedLockingOptimization;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== DoubleCheckedLockingOptimization Pattern Demo ===\n");
        DoubleCheckedLockingOptimizationImpl impl = 
            DoubleCheckedLockingOptimizationImpl.getInstance();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
