using System;

namespace Microservices.Communication.RemoteProcedureInvocation;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== RemoteProcedureInvocation Pattern Demo ===\n");
        IRemoteProcedureInvocation pattern = new RemoteProcedureInvocationImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
