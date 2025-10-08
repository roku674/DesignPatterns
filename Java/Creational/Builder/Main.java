/**
 * Main class to demonstrate the Builder pattern
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Builder Pattern Demo ===\n");

        // Build a basic office computer
        System.out.println("--- Building Office Computer ---");
        Computer officeComputer = new Computer.ComputerBuilder("Intel i5", "8GB")
                .storage("512GB SSD")
                .enableWifi()
                .build();
        System.out.println(officeComputer.getSpecs());

        // Build a gaming computer with all components
        System.out.println("--- Building Gaming Computer ---");
        Computer gamingComputer = new Computer.ComputerBuilder("AMD Ryzen 9 5900X", "32GB DDR4")
                .storage("2TB NVMe SSD")
                .gpu("NVIDIA RTX 4080")
                .motherboard("ASUS ROG Strix X570-E")
                .powerSupply("850W 80+ Gold")
                .coolingSystem("Liquid Cooling AIO 360mm")
                .enableWifi()
                .enableBluetooth()
                .build();
        System.out.println(gamingComputer.getSpecs());

        // Build a workstation for video editing
        System.out.println("--- Building Video Editing Workstation ---");
        Computer workstation = new Computer.ComputerBuilder("Intel i9-13900K", "64GB DDR5")
                .storage("4TB NVMe SSD + 8TB HDD")
                .gpu("NVIDIA RTX 4090")
                .motherboard("MSI MEG Z790 ACE")
                .powerSupply("1000W 80+ Platinum")
                .coolingSystem("Custom Water Cooling Loop")
                .enableWifi()
                .enableBluetooth()
                .build();
        System.out.println(workstation.getSpecs());

        // Build a minimal development computer
        System.out.println("--- Building Development Computer ---");
        Computer devComputer = new Computer.ComputerBuilder("Intel i7", "16GB")
                .enableWifi()
                .build();
        System.out.println(devComputer.getSpecs());

        // Demonstrate method chaining flexibility
        System.out.println("--- Building Budget Computer ---");
        Computer budgetComputer = new Computer.ComputerBuilder("Intel i3", "8GB")
                .storage("256GB SSD")
                .build();
        System.out.println(budgetComputer.getSpecs());
    }
}
