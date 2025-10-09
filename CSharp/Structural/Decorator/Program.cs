using System;
using System.IO;
using System.Threading.Tasks;

namespace Decorator;

/// <summary>
/// Demonstrates REAL Decorator pattern with actual Stream operations, compression, and encryption.
/// Shows how to dynamically add responsibilities to objects using composition.
/// </summary>
public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== REAL Decorator Pattern Demo ===");
        Console.WriteLine("Production-Ready Stream Decorators\n");

        string testFilePath = Path.Combine(Path.GetTempPath(), "decorator_test.dat");
        string testData = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
                         "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
                         "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. " +
                         "This is a test of the decorator pattern with real compression and encryption! " +
                         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";

        // Example 1: Basic file stream (no decorators)
        Console.WriteLine("--- Scenario 1: Basic File Stream (No Decorators) ---\n");
        await DemoBasicStream(testFilePath, testData);

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 2: File stream with logging
        Console.WriteLine("--- Scenario 2: File Stream with Logging Decorator ---\n");
        await DemoLoggedStream(testFilePath, testData);

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 3: File stream with compression
        Console.WriteLine("--- Scenario 3: File Stream with Compression Decorator ---\n");
        await DemoCompressedStream(testFilePath, testData);

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 4: File stream with encryption
        Console.WriteLine("--- Scenario 4: File Stream with Encryption Decorator ---\n");
        await DemoEncryptedStream(testFilePath, testData);

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 5: Multiple decorators stacked (compression + encryption + logging)
        Console.WriteLine("--- Scenario 5: Multiple Stacked Decorators ---\n");
        await DemoStackedDecorators(testFilePath, testData);

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 6: Buffering decorator
        Console.WriteLine("--- Scenario 6: Buffering Decorator ---\n");
        await DemoBufferedStream(testFilePath);

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 7: Different decorator combinations
        Console.WriteLine("--- Scenario 7: Different Decorator Combinations ---\n");
        await DemoDecoratorCombinations(testFilePath, testData);

        // Cleanup
        Console.WriteLine("\n" + new string('=', 70) + "\n");
        Console.WriteLine("--- Cleanup ---\n");
        CleanupTestFiles(testFilePath);

        Console.WriteLine("\n" + new string('=', 70));
        Console.WriteLine("\nDecorator pattern provides:");
        Console.WriteLine("  ✓ Dynamic addition of responsibilities");
        Console.WriteLine("  ✓ More flexible than static inheritance");
        Console.WriteLine("  ✓ Transparent wrapping of objects");
        Console.WriteLine("  ✓ Ability to combine multiple decorators");
        Console.WriteLine("  ✓ Single Responsibility Principle compliance");
        Console.WriteLine("  ✓ Open/Closed Principle compliance");
    }

    private static async Task DemoBasicStream(string filePath, string data)
    {
        IDataStream stream = new FileDataStream(filePath);

        Console.WriteLine($"Stream info: {stream.GetStreamInfo()}\n");

        await stream.WriteAsync(data);
        await stream.FlushAsync();
        await stream.CloseAsync();

        Console.WriteLine($"\nFile size: {stream.GetSize()} bytes");

        // Read back
        IDataStream readStream = new FileDataStream(filePath);
        string readData = await readStream.ReadAsync();
        await readStream.CloseAsync();

        Console.WriteLine($"\nRead back: {readData.Substring(0, Math.Min(50, readData.Length))}...");
        Console.WriteLine($"Data integrity: {(readData == data ? "PASS" : "FAIL")}");
    }

    private static async Task DemoLoggedStream(string filePath, string data)
    {
        IDataStream stream = new LoggingDecorator(
            new FileDataStream(filePath),
            "FileLog"
        );

        Console.WriteLine($"Stream info: {stream.GetStreamInfo()}\n");

        await stream.WriteAsync(data);
        await stream.FlushAsync();
        await stream.CloseAsync();

        // Read back
        IDataStream readStream = new LoggingDecorator(
            new FileDataStream(filePath),
            "ReadLog"
        );

        string readData = await readStream.ReadAsync();
        await readStream.CloseAsync();

        Console.WriteLine($"\nData integrity: {(readData == data ? "PASS" : "FAIL")}");
    }

    private static async Task DemoCompressedStream(string filePath, string data)
    {
        IDataStream stream = new CompressionDecorator(
            new FileDataStream(filePath)
        );

        Console.WriteLine($"Stream info: {stream.GetStreamInfo()}\n");

        await stream.WriteAsync(data);
        await stream.FlushAsync();
        await stream.CloseAsync();

        Console.WriteLine($"\nOriginal data size: {data.Length} characters");
        Console.WriteLine($"Compressed file size: {stream.GetSize()} bytes");
        double compressionRatio = (1.0 - ((double)stream.GetSize() / data.Length)) * 100;
        Console.WriteLine($"Compression ratio: {compressionRatio:F2}%");

        // Read back
        IDataStream readStream = new CompressionDecorator(
            new FileDataStream(filePath)
        );

        string readData = await readStream.ReadAsync();
        await readStream.CloseAsync();

        Console.WriteLine($"\nData integrity: {(readData == data ? "PASS" : "FAIL")}");
    }

    private static async Task DemoEncryptedStream(string filePath, string data)
    {
        string password = "SuperSecretPassword123!";

        IDataStream stream = new EncryptionDecorator(
            new FileDataStream(filePath),
            password
        );

        Console.WriteLine($"Stream info: {stream.GetStreamInfo()}\n");

        await stream.WriteAsync(data);
        await stream.FlushAsync();
        await stream.CloseAsync();

        Console.WriteLine($"\nEncrypted file size: {stream.GetSize()} bytes");

        // Read back with correct password
        IDataStream readStream = new EncryptionDecorator(
            new FileDataStream(filePath),
            password
        );

        string readData = await readStream.ReadAsync();
        await readStream.CloseAsync();

        Console.WriteLine($"\nData integrity: {(readData == data ? "PASS" : "FAIL")}");
    }

    private static async Task DemoStackedDecorators(string filePath, string data)
    {
        // Stack multiple decorators: Logging -> Compression -> Encryption -> File
        IDataStream stream = new LoggingDecorator(
            new CompressionDecorator(
                new EncryptionDecorator(
                    new FileDataStream(filePath),
                    "MyPassword"
                )
            ),
            "MultiDecorator"
        );

        Console.WriteLine($"Stream info: {stream.GetStreamInfo()}\n");

        await stream.WriteAsync(data);
        await stream.FlushAsync();
        await stream.CloseAsync();

        Console.WriteLine($"\nOriginal size: {data.Length} characters");
        Console.WriteLine($"Final file size: {stream.GetSize()} bytes");

        // Read back with same decorator stack
        IDataStream readStream = new LoggingDecorator(
            new CompressionDecorator(
                new EncryptionDecorator(
                    new FileDataStream(filePath),
                    "MyPassword"
                )
            ),
            "MultiRead"
        );

        string readData = await readStream.ReadAsync();
        await readStream.CloseAsync();

        Console.WriteLine($"\nData integrity: {(readData == data ? "PASS" : "FAIL")}");
    }

    private static async Task DemoBufferedStream(string filePath)
    {
        IDataStream stream = new LoggingDecorator(
            new BufferingDecorator(
                new FileDataStream(filePath),
                100 // Small buffer for demonstration
            ),
            "Buffered"
        );

        Console.WriteLine($"Stream info: {stream.GetStreamInfo()}\n");

        // Write multiple small chunks
        string[] chunks = { "Hello ", "World! ", "This ", "is ", "buffered ", "writing. " };

        foreach (string chunk in chunks)
        {
            await stream.WriteAsync(chunk);
            await Task.Delay(10); // Simulate some processing
        }

        await stream.CloseAsync();

        Console.WriteLine($"\nFinal file size: {stream.GetSize()} bytes");
    }

    private static async Task DemoDecoratorCombinations(string filePath, string data)
    {
        Console.WriteLine("Combination 1: Buffering + Logging + File\n");
        IDataStream combo1 = new BufferingDecorator(
            new LoggingDecorator(
                new FileDataStream(filePath + ".combo1"),
                "Combo1"
            ),
            512
        );
        await combo1.WriteAsync(data);
        await combo1.CloseAsync();
        Console.WriteLine($"Result: {combo1.GetSize()} bytes\n");

        Console.WriteLine("Combination 2: Logging + Compression + Buffering + File\n");
        IDataStream combo2 = new LoggingDecorator(
            new CompressionDecorator(
                new BufferingDecorator(
                    new FileDataStream(filePath + ".combo2"),
                    512
                )
            ),
            "Combo2"
        );
        await combo2.WriteAsync(data);
        await combo2.CloseAsync();
        Console.WriteLine($"Result: {combo2.GetSize()} bytes\n");

        Console.WriteLine("The same base component can be decorated in many different ways!");
    }

    private static void CleanupTestFiles(string basePath)
    {
        string[] patterns = { "", ".combo1", ".combo2" };

        foreach (string pattern in patterns)
        {
            string filePath = basePath + pattern;
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                Console.WriteLine($"Deleted: {filePath}");
            }
        }
    }
}
