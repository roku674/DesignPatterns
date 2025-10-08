using System;

namespace Microservices.DataManagement.DatabasePerService;

/// <summary>
/// Implementation of DatabasePerService pattern.
/// Each service has its own private database
/// </summary>
public class DatabasePerServiceImplementation : IDatabasePerService
{
    public void Execute()
    {
        Console.WriteLine("DatabasePerService pattern executing...");
    }
}
