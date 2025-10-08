using System;

namespace Integration.MessageConstruction.RequestReply;

/// <summary>
/// Implementation of RequestReply pattern.
/// Enables two-way communication
/// </summary>
public class RequestReplyImplementation : IRequestReply
{
    public void Execute()
    {
        Console.WriteLine("RequestReply pattern executing...");
    }
}
