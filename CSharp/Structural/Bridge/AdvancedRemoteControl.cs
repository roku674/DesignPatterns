namespace Bridge;

/// <summary>
/// Refined abstraction that extends RemoteControl with additional features.
/// Notice how we can add new functionality without modifying device implementations.
/// </summary>
public class AdvancedRemoteControl : RemoteControl
{
    public AdvancedRemoteControl(IDevice device) : base(device)
    {
    }

    /// <summary>
    /// Mutes the device by setting volume to 0.
    /// </summary>
    public void Mute()
    {
        Console.WriteLine("AdvancedRemoteControl: Mute");
        _device.SetVolume(0);
    }

    /// <summary>
    /// Sets volume to a specific percentage.
    /// </summary>
    public void SetVolume(int percent)
    {
        Console.WriteLine($"AdvancedRemoteControl: Set volume to {percent}%");
        _device.SetVolume(percent);
    }

    /// <summary>
    /// Jumps to a specific channel.
    /// </summary>
    public void GoToChannel(int channel)
    {
        Console.WriteLine($"AdvancedRemoteControl: Go to channel {channel}");
        _device.SetChannel(channel);
    }

    /// <summary>
    /// Displays the current device status.
    /// </summary>
    public void ShowStatus()
    {
        Console.WriteLine("AdvancedRemoteControl: Display status");
        _device.PrintStatus();
    }
}
