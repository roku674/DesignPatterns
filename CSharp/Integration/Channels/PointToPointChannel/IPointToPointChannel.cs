namespace Integration.Channels.PointToPointChannel;

/// <summary>
/// Single receiver consumes message
/// </summary>
public interface IPointToPointChannel
{
    void Execute();
}
