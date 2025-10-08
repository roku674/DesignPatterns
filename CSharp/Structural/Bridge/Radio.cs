namespace Bridge;

/// <summary>
/// Concrete implementation of Radio device.
/// </summary>
public class Radio : IDevice
{
    private bool _isOn = false;
    private int _volume = 50;
    private int _channel = 881; // FM frequency

    public bool IsEnabled() => _isOn;

    public void Enable()
    {
        _isOn = true;
        Console.WriteLine("Radio: Turned ON");
    }

    public void Disable()
    {
        _isOn = false;
        Console.WriteLine("Radio: Turned OFF");
    }

    public int GetVolume() => _volume;

    public void SetVolume(int percent)
    {
        _volume = Math.Max(0, Math.Min(percent, 100));
        Console.WriteLine($"Radio: Volume set to {_volume}%");
    }

    public int GetChannel() => _channel;

    public void SetChannel(int channel)
    {
        _channel = channel;
        Console.WriteLine($"Radio: Frequency set to {_channel / 10.0} FM");
    }

    public void PrintStatus()
    {
        Console.WriteLine("\n------------------------------------");
        Console.WriteLine("| Radio Status");
        Console.WriteLine($"| Power: {(IsEnabled() ? "ON" : "OFF")}");
        Console.WriteLine($"| Volume: {GetVolume()}%");
        Console.WriteLine($"| Frequency: {GetChannel() / 10.0} FM");
        Console.WriteLine("------------------------------------\n");
    }
}
