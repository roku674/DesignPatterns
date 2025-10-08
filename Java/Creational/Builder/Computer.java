/**
 * Product class - represents a complex object being built
 */
public class Computer {

    // Required parameters
    private final String cpu;
    private final String ram;

    // Optional parameters
    private final String storage;
    private final String gpu;
    private final String motherboard;
    private final String powerSupply;
    private final String coolingSystem;
    private final boolean isWifiEnabled;
    private final boolean isBluetoothEnabled;

    /**
     * Private constructor - only accessible through Builder
     */
    private Computer(ComputerBuilder builder) {
        this.cpu = builder.cpu;
        this.ram = builder.ram;
        this.storage = builder.storage;
        this.gpu = builder.gpu;
        this.motherboard = builder.motherboard;
        this.powerSupply = builder.powerSupply;
        this.coolingSystem = builder.coolingSystem;
        this.isWifiEnabled = builder.isWifiEnabled;
        this.isBluetoothEnabled = builder.isBluetoothEnabled;
    }

    /**
     * Gets the computer specifications as a formatted string
     *
     * @return formatted specifications
     */
    public String getSpecs() {
        StringBuilder specs = new StringBuilder();
        specs.append("\n=== Computer Specifications ===\n");
        specs.append("CPU: ").append(cpu).append("\n");
        specs.append("RAM: ").append(ram).append("\n");
        specs.append("Storage: ").append(storage != null ? storage : "Not specified").append("\n");
        specs.append("GPU: ").append(gpu != null ? gpu : "Integrated Graphics").append("\n");
        specs.append("Motherboard: ").append(motherboard != null ? motherboard : "Standard").append("\n");
        specs.append("Power Supply: ").append(powerSupply != null ? powerSupply : "Standard").append("\n");
        specs.append("Cooling: ").append(coolingSystem != null ? coolingSystem : "Stock Cooler").append("\n");
        specs.append("WiFi: ").append(isWifiEnabled ? "Enabled" : "Disabled").append("\n");
        specs.append("Bluetooth: ").append(isBluetoothEnabled ? "Enabled" : "Disabled").append("\n");
        specs.append("==============================\n");
        return specs.toString();
    }

    /**
     * Static Builder class for constructing Computer objects
     */
    public static class ComputerBuilder {
        // Required parameters
        private final String cpu;
        private final String ram;

        // Optional parameters - initialized to default values
        private String storage = "256GB SSD";
        private String gpu = null;
        private String motherboard = null;
        private String powerSupply = null;
        private String coolingSystem = null;
        private boolean isWifiEnabled = false;
        private boolean isBluetoothEnabled = false;

        /**
         * Constructor with required parameters
         *
         * @param cpu the processor
         * @param ram the memory
         */
        public ComputerBuilder(String cpu, String ram) {
            this.cpu = cpu;
            this.ram = ram;
        }

        public ComputerBuilder storage(String storage) {
            this.storage = storage;
            return this;
        }

        public ComputerBuilder gpu(String gpu) {
            this.gpu = gpu;
            return this;
        }

        public ComputerBuilder motherboard(String motherboard) {
            this.motherboard = motherboard;
            return this;
        }

        public ComputerBuilder powerSupply(String powerSupply) {
            this.powerSupply = powerSupply;
            return this;
        }

        public ComputerBuilder coolingSystem(String coolingSystem) {
            this.coolingSystem = coolingSystem;
            return this;
        }

        public ComputerBuilder enableWifi() {
            this.isWifiEnabled = true;
            return this;
        }

        public ComputerBuilder enableBluetooth() {
            this.isBluetoothEnabled = true;
            return this;
        }

        /**
         * Builds and returns the Computer object
         *
         * @return a new Computer instance
         */
        public Computer build() {
            return new Computer(this);
        }
    }
}
