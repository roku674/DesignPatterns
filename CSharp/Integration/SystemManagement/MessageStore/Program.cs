using System;

namespace Integration.SystemManagement.MessageStore;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageStore Pattern Demo ===\n");
        IMessageStore pattern = new MessageStoreImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
