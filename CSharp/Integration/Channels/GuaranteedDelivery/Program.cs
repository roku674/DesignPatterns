using System;

namespace Integration.Channels.GuaranteedDelivery;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== GuaranteedDelivery Pattern Demo ===\n");
        IGuaranteedDelivery pattern = new GuaranteedDeliveryImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
