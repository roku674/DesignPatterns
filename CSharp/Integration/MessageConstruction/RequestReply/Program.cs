using System;

namespace Integration.MessageConstruction.RequestReply;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== RequestReply Pattern Demo ===\n");
        IRequestReply pattern = new RequestReplyImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
