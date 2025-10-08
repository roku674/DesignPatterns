/**
 * Main class to demonstrate the Composite pattern
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Composite Pattern Demo ===");

        // Create individual products
        Product mouse = new Product("Wireless Mouse", 25.99);
        Product keyboard = new Product("Mechanical Keyboard", 89.99);
        Product monitor = new Product("27-inch Monitor", 299.99);
        Product phone = new Product("Smartphone", 699.99);
        Product charger = new Product("Phone Charger", 19.99);

        // Create boxes (composites)
        Box computerBox = new Box("Computer Accessories Box");
        computerBox.add(mouse);
        computerBox.add(keyboard);
        computerBox.add(monitor);

        Box phoneBox = new Box("Phone Package");
        phoneBox.add(phone);
        phoneBox.add(charger);

        // Create a larger box containing other boxes
        Box shipmentBox = new Box("Complete Order Shipment");
        shipmentBox.add(computerBox);
        shipmentBox.add(phoneBox);
        shipmentBox.add(new Product("USB Cable", 9.99));

        // Display all details
        shipmentBox.showDetails();

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nComposite Pattern Benefits:");
        System.out.println("- Uniform treatment of individual objects and compositions");
        System.out.println("- Easy to add new component types");
        System.out.println("- Simplifies client code - same interface for all");
    }
}
