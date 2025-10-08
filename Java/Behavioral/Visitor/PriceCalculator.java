/** Concrete Visitor */
public class PriceCalculator implements Visitor {
    private double totalCost = 0;

    @Override
    public void visit(Book book) {
        totalCost += book.getPrice();
        System.out.println("Book: " + book.getTitle() + " - $" + book.getPrice());
    }

    @Override
    public void visit(Fruit fruit) {
        double cost = fruit.getPricePerKg() * fruit.getWeight();
        totalCost += cost;
        System.out.println("Fruit: " + fruit.getName() + " (" + fruit.getWeight() + "kg) - $" + cost);
    }

    public double getTotalCost() {
        return totalCost;
    }
}
