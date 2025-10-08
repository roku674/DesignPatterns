using System;

namespace Microservices.Security.AccessToken;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== AccessToken Pattern Demo ===\n");
        IAccessToken pattern = new AccessTokenImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
