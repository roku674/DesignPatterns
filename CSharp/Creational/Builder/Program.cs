namespace Builder;

/// <summary>
/// Demonstrates the Builder pattern with a computer configuration example.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Builder Pattern Demo ===");
        Console.WriteLine("Computer Configuration System\n");

        ComputerDirector director = new ComputerDirector();

        // Example 1: Build a high-end gaming PC using the director
        Console.WriteLine("--- Building High-End Gaming PC with Director ---");
        IComputerBuilder gamingBuilder = new GamingComputerBuilder();
        Computer gamingPC = director.ConstructHighEndGamingPC(gamingBuilder);
        gamingPC.DisplaySpecs();

        // Example 2: Build a budget gaming PC using the director
        Console.WriteLine("--- Building Budget Gaming PC with Director ---");
        Computer budgetGamingPC = director.ConstructBudgetGamingPC(gamingBuilder);
        budgetGamingPC.DisplaySpecs();

        // Example 3: Build an office PC using the director
        Console.WriteLine("--- Building Office PC with Director ---");
        IComputerBuilder officeBuilder = new OfficeComputerBuilder();
        Computer officePC = director.ConstructOfficePC(officeBuilder);
        officePC.DisplaySpecs();

        // Example 4: Build a custom PC without using the director
        Console.WriteLine("--- Building Custom PC without Director ---");
        Console.WriteLine("(Client has full control over the construction process)");
        Computer customPC = new GamingComputerBuilder()
            .SetCPU("AMD Ryzen 9 7950X")
            .SetRAM("32GB DDR5-5600")
            .SetStorage("1TB NVMe SSD")
            .SetGPU("AMD Radeon RX 7900 XTX")
            .SetMotherboard("Gigabyte X670 AORUS Elite")
            .SetPowerSupply("850W 80+ Gold")
            .SetCoolingSystem("AIO Liquid Cooling - 360mm")
            .AddWiFi()
            .AddBluetooth()
            .Build();
        customPC.DisplaySpecs();

        // Example 5: Build minimal configuration
        Console.WriteLine("--- Building Minimal PC Configuration ---");
        Computer minimalPC = new OfficeComputerBuilder()
            .SetCPU("Intel Core i3-12100")
            .SetRAM("8GB DDR4-2666")
            .SetStorage("256GB SATA SSD")
            .Build();
        minimalPC.DisplaySpecs();
    }
}
