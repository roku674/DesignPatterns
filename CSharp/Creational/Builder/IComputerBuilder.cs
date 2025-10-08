namespace Builder;

/// <summary>
/// The Builder interface specifies methods for creating the different parts of the Product objects.
/// </summary>
public interface IComputerBuilder
{
    /// <summary>
    /// Sets the CPU component.
    /// </summary>
    IComputerBuilder SetCPU(string cpu);

    /// <summary>
    /// Sets the RAM component.
    /// </summary>
    IComputerBuilder SetRAM(string ram);

    /// <summary>
    /// Sets the storage component.
    /// </summary>
    IComputerBuilder SetStorage(string storage);

    /// <summary>
    /// Sets the GPU component.
    /// </summary>
    IComputerBuilder SetGPU(string gpu);

    /// <summary>
    /// Sets the motherboard component.
    /// </summary>
    IComputerBuilder SetMotherboard(string motherboard);

    /// <summary>
    /// Sets the power supply component.
    /// </summary>
    IComputerBuilder SetPowerSupply(string powerSupply);

    /// <summary>
    /// Sets the cooling system.
    /// </summary>
    IComputerBuilder SetCoolingSystem(string coolingSystem);

    /// <summary>
    /// Adds WiFi capability.
    /// </summary>
    IComputerBuilder AddWiFi();

    /// <summary>
    /// Adds Bluetooth capability.
    /// </summary>
    IComputerBuilder AddBluetooth();

    /// <summary>
    /// Resets the builder to start building a new computer.
    /// </summary>
    void Reset();

    /// <summary>
    /// Returns the final product.
    /// </summary>
    Computer Build();
}
