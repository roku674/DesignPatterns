/**
 * Leaf - represents leaf objects in composition (cannot have children)
 */
public class Product implements Component {
    private String name;
    private double price;

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public void showDetails() {
        System.out.println("  Product: " + name + " - $" + price);
    }

    @Override
    public double getPrice() {
        return price;
    }
}
