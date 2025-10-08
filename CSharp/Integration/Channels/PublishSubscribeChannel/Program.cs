using System;

namespace Integration.Channels.PublishSubscribeChannel;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== PublishSubscribeChannel Pattern Demo ===\n");
        IPublishSubscribeChannel pattern = new PublishSubscribeChannelImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
