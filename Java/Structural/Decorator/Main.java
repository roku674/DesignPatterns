/**
 * Main class to demonstrate the Decorator pattern
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Decorator Pattern Demo ===\n");

        // Simple coffee
        Coffee coffee1 = new SimpleCoffee();
        System.out.println(coffee1.getDescription() + " - $" + coffee1.getCost());

        // Coffee with milk
        Coffee coffee2 = new MilkDecorator(new SimpleCoffee());
        System.out.println(coffee2.getDescription() + " - $" + coffee2.getCost());

        // Coffee with milk and sugar
        Coffee coffee3 = new SugarDecorator(new MilkDecorator(new SimpleCoffee()));
        System.out.println(coffee3.getDescription() + " - $" + coffee3.getCost());

        // Coffee with all decorations
        Coffee coffee4 = new WhippedCreamDecorator(
                            new SugarDecorator(
                                new MilkDecorator(
                                    new SimpleCoffee())));
        System.out.println(coffee4.getDescription() + " - $" + coffee4.getCost());

        // Double milk coffee
        Coffee coffee5 = new MilkDecorator(new MilkDecorator(new SimpleCoffee()));
        System.out.println(coffee5.getDescription() + " - $" + coffee5.getCost());

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nDecorator Pattern Benefits:");
        System.out.println("- Add responsibilities dynamically");
        System.out.println("- More flexible than subclassing");
        System.out.println("- Avoid feature-laden classes high in hierarchy");
    }
}
