namespace Bridge;

/// <summary>
/// Demonstrates the Bridge pattern with remote controls and devices.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Bridge Pattern Demo ===");
        Console.WriteLine("Remote Control and Device System\n");

        // Example 1: Basic remote with TV
        Console.WriteLine("--- Scenario 1: Basic Remote with Television ---");
        IDevice tv = new Television();
        RemoteControl basicRemote = new RemoteControl(tv);

        basicRemote.TogglePower();
        basicRemote.VolumeUp();
        basicRemote.VolumeUp();
        basicRemote.ChannelUp();
        tv.PrintStatus();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Example 2: Advanced remote with TV
        Console.WriteLine("--- Scenario 2: Advanced Remote with Television ---");
        IDevice tv2 = new Television();
        AdvancedRemoteControl advancedRemote = new AdvancedRemoteControl(tv2);

        advancedRemote.TogglePower();
        advancedRemote.SetVolume(75);
        advancedRemote.GoToChannel(52);
        advancedRemote.ShowStatus();
        advancedRemote.Mute();
        advancedRemote.ShowStatus();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Example 3: Basic remote with Radio
        Console.WriteLine("--- Scenario 3: Basic Remote with Radio ---");
        IDevice radio = new Radio();
        RemoteControl radioRemote = new RemoteControl(radio);

        radioRemote.TogglePower();
        radioRemote.VolumeUp();
        radioRemote.ChannelUp();
        radioRemote.ChannelUp();
        radio.PrintStatus();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Example 4: Advanced remote with Radio
        Console.WriteLine("--- Scenario 4: Advanced Remote with Radio ---");
        IDevice radio2 = new Radio();
        AdvancedRemoteControl advancedRadioRemote = new AdvancedRemoteControl(radio2);

        advancedRadioRemote.TogglePower();
        advancedRadioRemote.SetVolume(60);
        advancedRadioRemote.GoToChannel(1035); // 103.5 FM
        advancedRadioRemote.ShowStatus();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Example 5: Runtime device switching
        Console.WriteLine("--- Scenario 5: Switching Devices at Runtime ---");
        TestDevice(new Television());
        Console.WriteLine();
        TestDevice(new Radio());
    }

    /// <summary>
    /// Demonstrates that the same remote control code works with any device.
    /// This is the power of the Bridge pattern - abstraction and implementation are independent.
    /// </summary>
    private static void TestDevice(IDevice device)
    {
        Console.WriteLine($"Testing with {device.GetType().Name}:");
        AdvancedRemoteControl remote = new AdvancedRemoteControl(device);

        remote.TogglePower();
        remote.VolumeUp();
        remote.ChannelUp();
        remote.ShowStatus();
    }
}
