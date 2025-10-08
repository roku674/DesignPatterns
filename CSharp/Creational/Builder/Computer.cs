namespace Builder;

/// <summary>
/// The Product class represents the complex object being built.
/// In this case, a Computer with various components.
/// </summary>
public class Computer
{
    public string CPU { get; set; } = string.Empty;
    public string RAM { get; set; } = string.Empty;
    public string Storage { get; set; } = string.Empty;
    public string GPU { get; set; } = string.Empty;
    public string Motherboard { get; set; } = string.Empty;
    public string PowerSupply { get; set; } = string.Empty;
    public string CoolingSystem { get; set; } = string.Empty;
    public bool HasWiFi { get; set; }
    public bool HasBluetooth { get; set; }

    /// <summary>
    /// Displays the complete specifications of the computer.
    /// </summary>
    public void DisplaySpecs()
    {
        Console.WriteLine("\n=== Computer Specifications ===");
        Console.WriteLine($"CPU: {CPU}");
        Console.WriteLine($"RAM: {RAM}");
        Console.WriteLine($"Storage: {Storage}");
        Console.WriteLine($"GPU: {GPU}");
        Console.WriteLine($"Motherboard: {Motherboard}");
        Console.WriteLine($"Power Supply: {PowerSupply}");
        Console.WriteLine($"Cooling: {CoolingSystem}");
        Console.WriteLine($"WiFi: {(HasWiFi ? "Yes" : "No")}");
        Console.WriteLine($"Bluetooth: {(HasBluetooth ? "Yes" : "No")}");
        Console.WriteLine("================================\n");
    }
}
