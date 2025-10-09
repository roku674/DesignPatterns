import java.nio.charset.StandardCharsets;

/**
 * Main class to demonstrate the Decorator pattern with real I/O streams
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Decorator Pattern Demo - File I/O with Decorators ===\n");

        String testFile = System.getProperty("java.io.tmpdir") + "/decorator_test.dat";
        String testData = "This is a test message that will be processed by multiple decorators. " +
                "The Decorator pattern allows us to add functionality dynamically!";

        try {
            // Example 1: Basic file stream
            System.out.println("--- Example 1: Basic File Stream ---");
            Coffee basicStream = new SimpleCoffee(testFile);
            basicStream.write(testData.getBytes(StandardCharsets.UTF_8));
            System.out.println("Configuration: " + basicStream.getDescription());
            basicStream.close();

            basicStream = new SimpleCoffee(testFile);
            byte[] readData = basicStream.read();
            System.out.println("Read data: " + new String(readData, StandardCharsets.UTF_8));
            basicStream.close();

            // Example 2: Stream with compression
            System.out.println("\n--- Example 2: Stream with Compression ---");
            Coffee compressedStream = new MilkDecorator(new SimpleCoffee(testFile));
            System.out.println("Configuration: " + compressedStream.getDescription());
            compressedStream.write(testData.getBytes(StandardCharsets.UTF_8));
            compressedStream.close();

            compressedStream = new MilkDecorator(new SimpleCoffee(testFile));
            byte[] decompressedData = compressedStream.read();
            System.out.println("Read data: " + new String(decompressedData, StandardCharsets.UTF_8));
            compressedStream.close();

            // Example 3: Stream with compression and encoding
            System.out.println("\n--- Example 3: Stream with Compression + Encoding ---");
            Coffee encodedStream = new SugarDecorator(
                    new MilkDecorator(
                            new SimpleCoffee(testFile)));
            System.out.println("Configuration: " + encodedStream.getDescription());
            encodedStream.write(testData.getBytes(StandardCharsets.UTF_8));
            encodedStream.close();

            encodedStream = new SugarDecorator(
                    new MilkDecorator(
                            new SimpleCoffee(testFile)));
            byte[] decodedData = encodedStream.read();
            System.out.println("Read data: " + new String(decodedData, StandardCharsets.UTF_8));
            encodedStream.close();

            // Example 4: Full stack - Compression + Encoding + Encryption
            System.out.println("\n--- Example 4: Full Stack (Compression + Encoding + Encryption) ---");
            Coffee fullStream = new WhippedCreamDecorator(
                    new SugarDecorator(
                            new MilkDecorator(
                                    new SimpleCoffee(testFile))));
            System.out.println("Configuration: " + fullStream.getDescription());
            fullStream.write(testData.getBytes(StandardCharsets.UTF_8));
            fullStream.close();

            fullStream = new WhippedCreamDecorator(
                    new SugarDecorator(
                            new MilkDecorator(
                                    new SimpleCoffee(testFile))));
            byte[] finalData = fullStream.read();
            System.out.println("Read data: " + new String(finalData, StandardCharsets.UTF_8));
            fullStream.close();

            // Example 5: Different decorator combinations
            System.out.println("\n--- Example 5: Encryption Only ---");
            Coffee encryptedOnly = new WhippedCreamDecorator(new SimpleCoffee(testFile));
            System.out.println("Configuration: " + encryptedOnly.getDescription());
            encryptedOnly.write(testData.getBytes(StandardCharsets.UTF_8));
            encryptedOnly.close();

            encryptedOnly = new WhippedCreamDecorator(new SimpleCoffee(testFile));
            byte[] encryptedData = encryptedOnly.read();
            System.out.println("Read data: " + new String(encryptedData, StandardCharsets.UTF_8));
            encryptedOnly.close();

            System.out.println("\n" + "=".repeat(50));
            System.out.println("\nDecorator Pattern Benefits:");
            System.out.println("- Add responsibilities dynamically at runtime");
            System.out.println("- Combine decorators in any order (encryption + compression, etc.)");
            System.out.println("- More flexible than static subclassing");
            System.out.println("- Each decorator has single responsibility");
            System.out.println("\nReal-world usage:");
            System.out.println("- Java I/O streams (BufferedInputStream, GZIPInputStream)");
            System.out.println("- UI components (scrollable, bordered windows)");
            System.out.println("- HTTP middleware (logging, authentication, compression)");
            System.out.println("- Data transformation pipelines");

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
