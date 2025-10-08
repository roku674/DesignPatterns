using System;

namespace Cloud.AsynchronousRequestReply;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== AsynchronousRequestReply Pattern Demo ===\n");
        IAsynchronousRequestReply pattern = new AsynchronousRequestReplyImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
