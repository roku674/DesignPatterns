using System;

namespace Microservices.ServiceCollaboration.CommandSideReplica;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== CommandSideReplica Pattern Demo ===\n");
        ICommandSideReplica pattern = new CommandSideReplicaImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
