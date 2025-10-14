package Enterprise.Base;

/**
 * Example domain entity extending Layer Supertype
 */
public class Product extends DomainObject {
    private String name;
    private double price;

    public Product(String name, double price) {
        super();
        this.name = name;
        this.price = price;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        markModified();
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
        markModified();
    }

    @Override
    public String toString() {
        return "Product{id=" + getId() + ", name='" + name + "', price=" + price + "}";
    }
}
