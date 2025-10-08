namespace Builder;

/// <summary>
/// The Director class defines the order in which to call construction steps.
/// It works with a builder object through the common Builder interface.
/// </summary>
public class ComputerDirector
{
    /// <summary>
    /// Constructs a high-end gaming computer with top-tier components.
    /// </summary>
    public Computer ConstructHighEndGamingPC(IComputerBuilder builder)
    {
        return builder
            .SetCPU("Intel Core i9-13900K")
            .SetRAM("64GB DDR5-6000")
            .SetStorage("2TB NVMe SSD + 4TB HDD")
            .SetGPU("NVIDIA RTX 4090")
            .SetMotherboard("ASUS ROG Maximus Z790")
            .SetPowerSupply("1000W 80+ Platinum")
            .SetCoolingSystem("Custom Liquid Cooling")
            .AddWiFi()
            .AddBluetooth()
            .Build();
    }

    /// <summary>
    /// Constructs a budget gaming computer with balanced components.
    /// </summary>
    public Computer ConstructBudgetGamingPC(IComputerBuilder builder)
    {
        return builder
            .SetCPU("AMD Ryzen 5 5600X")
            .SetRAM("16GB DDR4-3200")
            .SetStorage("512GB NVMe SSD")
            .SetGPU("NVIDIA RTX 3060")
            .SetMotherboard("MSI B550-A PRO")
            .SetPowerSupply("650W 80+ Bronze")
            .SetCoolingSystem("Air Cooling - Hyper 212")
            .AddWiFi()
            .Build();
    }

    /// <summary>
    /// Constructs an office computer optimized for productivity tasks.
    /// </summary>
    public Computer ConstructOfficePC(IComputerBuilder builder)
    {
        return builder
            .SetCPU("Intel Core i5-12400")
            .SetRAM("16GB DDR4-3200")
            .SetStorage("512GB NVMe SSD")
            .SetGPU("Integrated Graphics")
            .SetMotherboard("ASUS Prime B660M-A")
            .SetPowerSupply("450W 80+ Bronze")
            .SetCoolingSystem("Stock Air Cooling")
            .AddWiFi()
            .AddBluetooth()
            .Build();
    }
}
