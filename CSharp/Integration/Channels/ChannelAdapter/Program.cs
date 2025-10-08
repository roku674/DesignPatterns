using System;

namespace Integration.Channels.ChannelAdapter;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ChannelAdapter Pattern Demo ===\n");
        IChannelAdapter pattern = new ChannelAdapterImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
