import java.util.ArrayList;
import java.util.List;

/**
 * Composite - represents composite objects that can have children
 */
public class Box implements Component {
    private String name;
    private List<Component> components = new ArrayList<>();

    public Box(String name) {
        this.name = name;
    }

    public void add(Component component) {
        components.add(component);
    }

    public void remove(Component component) {
        components.remove(component);
    }

    @Override
    public void showDetails() {
        System.out.println("\n" + name + " contains:");
        for (Component component : components) {
            component.showDetails();
        }
        System.out.println("Total price: $" + getPrice());
    }

    @Override
    public double getPrice() {
        double total = 0;
        for (Component component : components) {
            total += component.getPrice();
        }
        return total;
    }
}
