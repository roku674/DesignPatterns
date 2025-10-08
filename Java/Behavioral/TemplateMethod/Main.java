/** Main class to demonstrate Template Method pattern */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Template Method Pattern Demo ===\n");

        System.out.println("--- Processing CSV Data ---");
        DataProcessor csvProcessor = new CSVDataProcessor();
        csvProcessor.process();

        System.out.println("\n--- Processing JSON Data ---");
        DataProcessor jsonProcessor = new JSONDataProcessor();
        jsonProcessor.process();

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nTemplate Method Pattern Benefits:");
        System.out.println("- Defines algorithm skeleton in base class");
        System.out.println("- Subclasses override specific steps");
        System.out.println("- Code reuse and consistency");
    }
}
