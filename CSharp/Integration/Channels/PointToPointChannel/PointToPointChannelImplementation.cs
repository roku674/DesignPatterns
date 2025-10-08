using System;

namespace Integration.Channels.PointToPointChannel;

/// <summary>
/// Implementation of PointToPointChannel pattern.
/// Single receiver consumes message
/// </summary>
public class PointToPointChannelImplementation : IPointToPointChannel
{
    public void Execute()
    {
        Console.WriteLine("PointToPointChannel pattern executing...");
    }
}
