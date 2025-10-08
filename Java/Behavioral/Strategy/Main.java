/** Main class to demonstrate Strategy pattern */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Strategy Pattern Demo ===\n");

        ShoppingCart cart = new ShoppingCart();

        System.out.println("--- Paying with Credit Card ---");
        cart.setPaymentStrategy(new CreditCardStrategy("1234-5678-9012-3456"));
        cart.checkout(150.00);

        System.out.println("\n--- Paying with PayPal ---");
        cart.setPaymentStrategy(new PayPalStrategy("user@example.com"));
        cart.checkout(75.50);

        System.out.println("\n--- Paying with Bitcoin ---");
        cart.setPaymentStrategy(new BitcoinStrategy("1A2B3C4D5E6F"));
        cart.checkout(200.00);

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nStrategy Pattern Benefits:");
        System.out.println("- Families of related algorithms");
        System.out.println("- Alternative to subclassing");
        System.out.println("- Eliminates conditional statements");
    }
}
