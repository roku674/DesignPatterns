using System;

namespace Integration.SystemManagement.ChannelPurger;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ChannelPurger Pattern Demo ===\n");
        IChannelPurger pattern = new ChannelPurgerImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
