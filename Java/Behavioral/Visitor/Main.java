import java.util.ArrayList;
import java.util.List;

/** Main class to demonstrate Visitor pattern */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Visitor Pattern Demo ===\n");

        List<Element> items = new ArrayList<>();
        items.add(new Book("Design Patterns", 45.00));
        items.add(new Fruit("Apple", 2.50, 1.5));
        items.add(new Book("Clean Code", 40.00));
        items.add(new Fruit("Banana", 1.80, 2.0));

        PriceCalculator calculator = new PriceCalculator();

        System.out.println("Calculating total cost:");
        for (Element item : items) {
            item.accept(calculator);
        }

        System.out.println("\nTotal Cost: $" + calculator.getTotalCost());

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nVisitor Pattern Benefits:");
        System.out.println("- Add new operations without modifying elements");
        System.out.println("- Separate algorithm from object structure");
        System.out.println("- Gather related operations into visitor class");
    }
}
