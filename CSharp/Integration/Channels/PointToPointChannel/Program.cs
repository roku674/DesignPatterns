using System;

namespace Integration.Channels.PointToPointChannel;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== PointToPointChannel Pattern Demo ===\n");
        IPointToPointChannel pattern = new PointToPointChannelImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
