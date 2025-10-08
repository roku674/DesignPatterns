using System;

namespace Integration.SystemManagement.MessageHistory;

/// <summary>
/// Implementation of MessageHistory pattern.
/// Lists components message traveled through
/// </summary>
public class MessageHistoryImplementation : IMessageHistory
{
    public void Execute()
    {
        Console.WriteLine("MessageHistory pattern executing...");
    }
}
