using System;

namespace Cloud.AsynchronousRequestReply;

/// <summary>
/// Implementation of AsynchronousRequestReply pattern.
/// Decouples backend processing from frontend
/// </summary>
public class AsynchronousRequestReplyImplementation : IAsynchronousRequestReply
{
    public void Execute()
    {
        Console.WriteLine("AsynchronousRequestReply pattern executing...");
    }
}
