namespace Builder;

/// <summary>
/// Concrete Builder for creating office/productivity computers.
/// </summary>
public class OfficeComputerBuilder : IComputerBuilder
{
    private Computer _computer;

    public OfficeComputerBuilder()
    {
        _computer = new Computer();
    }

    public void Reset()
    {
        _computer = new Computer();
    }

    public IComputerBuilder SetCPU(string cpu)
    {
        _computer.CPU = cpu;
        return this;
    }

    public IComputerBuilder SetRAM(string ram)
    {
        _computer.RAM = ram;
        return this;
    }

    public IComputerBuilder SetStorage(string storage)
    {
        _computer.Storage = storage;
        return this;
    }

    public IComputerBuilder SetGPU(string gpu)
    {
        _computer.GPU = gpu;
        return this;
    }

    public IComputerBuilder SetMotherboard(string motherboard)
    {
        _computer.Motherboard = motherboard;
        return this;
    }

    public IComputerBuilder SetPowerSupply(string powerSupply)
    {
        _computer.PowerSupply = powerSupply;
        return this;
    }

    public IComputerBuilder SetCoolingSystem(string coolingSystem)
    {
        _computer.CoolingSystem = coolingSystem;
        return this;
    }

    public IComputerBuilder AddWiFi()
    {
        _computer.HasWiFi = true;
        return this;
    }

    public IComputerBuilder AddBluetooth()
    {
        _computer.HasBluetooth = true;
        return this;
    }

    public Computer Build()
    {
        Computer result = _computer;
        Reset();
        return result;
    }
}
