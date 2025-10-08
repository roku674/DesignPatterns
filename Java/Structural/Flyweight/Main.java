/**
 * Main class to demonstrate Flyweight pattern
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Flyweight Pattern Demo ===\n");

        Forest forest = new Forest();

        // Plant many trees of the same types
        forest.plantTree(1, 2, "Oak", "Green", "Rough");
        forest.plantTree(5, 3, "Pine", "Dark Green", "Smooth");
        forest.plantTree(2, 8, "Oak", "Green", "Rough");
        forest.plantTree(7, 1, "Pine", "Dark Green", "Smooth");
        forest.plantTree(3, 6, "Oak", "Green", "Rough");
        forest.plantTree(9, 4, "Birch", "White", "Peeling");
        forest.plantTree(4, 9, "Oak", "Green", "Rough");
        forest.plantTree(6, 5, "Pine", "Dark Green", "Smooth");

        forest.draw();

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nMemory Efficiency:");
        System.out.println("Total trees: " + forest.getTreeCount());
        System.out.println("Unique tree types: " + TreeFactory.getTreeTypeCount());
        System.out.println("\nFlyweight Pattern Benefits:");
        System.out.println("- Reduced memory usage by sharing intrinsic state");
        System.out.println("- " + forest.getTreeCount() + " trees use only " + TreeFactory.getTreeTypeCount() + " TreeType objects!");
    }
}
