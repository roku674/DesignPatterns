using System;

namespace Integration.MessageConstruction.CommandMessage;

/// <summary>
/// Implementation of CommandMessage pattern.
/// Invokes procedure in receiver
/// </summary>
public class CommandMessageImplementation : ICommandMessage
{
    public void Execute()
    {
        Console.WriteLine("CommandMessage pattern executing...");
    }
}
