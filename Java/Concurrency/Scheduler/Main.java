package Concurrency.Scheduler;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Scheduler Pattern Demo ===\n");
        SchedulerImpl impl = new SchedulerImpl();
        impl.demonstrate();
        System.out.println("\nPattern demonstration complete.");
    }
}
