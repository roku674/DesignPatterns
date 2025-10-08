namespace Integration.Channels.PublishSubscribeChannel;

/// <summary>
/// Delivers copy to each subscriber
/// </summary>
public interface IPublishSubscribeChannel
{
    void Execute();
}
