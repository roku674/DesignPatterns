namespace Bridge;

/// <summary>
/// Concrete implementation of Television device.
/// </summary>
public class Television : IDevice
{
    private bool _isOn = false;
    private int _volume = 30;
    private int _channel = 1;

    public bool IsEnabled() => _isOn;

    public void Enable()
    {
        _isOn = true;
        Console.WriteLine("Television: Turned ON");
    }

    public void Disable()
    {
        _isOn = false;
        Console.WriteLine("Television: Turned OFF");
    }

    public int GetVolume() => _volume;

    public void SetVolume(int percent)
    {
        _volume = Math.Max(0, Math.Min(percent, 100));
        Console.WriteLine($"Television: Volume set to {_volume}%");
    }

    public int GetChannel() => _channel;

    public void SetChannel(int channel)
    {
        _channel = channel;
        Console.WriteLine($"Television: Channel set to {_channel}");
    }

    public void PrintStatus()
    {
        Console.WriteLine("\n------------------------------------");
        Console.WriteLine("| Television Status");
        Console.WriteLine($"| Power: {(IsEnabled() ? "ON" : "OFF")}");
        Console.WriteLine($"| Volume: {GetVolume()}%");
        Console.WriteLine($"| Channel: {GetChannel()}");
        Console.WriteLine("------------------------------------\n");
    }
}
