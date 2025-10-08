package Enterprise.DomainModel;

import java.math.BigDecimal;
import java.util.Arrays;

/**
 * Demonstrates the Domain Model pattern.
 * Rich domain objects contain both data and business logic.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Domain Model Pattern Demo ===\n");

        // Create domain objects
        Customer customer = new Customer("John Doe", "john@example.com", CustomerType.PREMIUM);
        System.out.println("Created customer: " + customer.getName());
        System.out.println("Customer type: " + customer.getType());
        System.out.println("Credit limit: $" + customer.getCreditLimit());
        System.out.println("Discount: " + customer.getDiscountPercentage().multiply(new BigDecimal("100")) + "%");

        // Create products
        Product laptop = new Product("Laptop", new BigDecimal("1000.00"), 10);
        Product mouse = new Product("Mouse", new BigDecimal("25.00"), 50);

        System.out.println("\n--- Placing Order ---");

        // Create order with business logic
        OrderLine line1 = new OrderLine(laptop, 2);
        OrderLine line2 = new OrderLine(mouse, 3);

        try {
            Order order = customer.placeOrder(Arrays.asList(line1, line2));
            System.out.println("Order placed successfully: " + order);
            System.out.println("Order lines:");
            order.getLines().forEach(line -> System.out.println("  - " + line));
            System.out.println("Order total: $" + order.getTotal());
            System.out.println("Outstanding balance: $" + customer.calculateOutstandingBalance());

            // Process payment
            System.out.println("\n--- Processing Payment ---");
            order.processPayment(order.getTotal());
            System.out.println("Payment processed. Order status: " + order.getStatus());
            System.out.println("Outstanding balance: $" + customer.calculateOutstandingBalance());

            // Try to place order exceeding credit limit
            System.out.println("\n--- Testing Credit Limit ---");
            OrderLine largeLine = new OrderLine(laptop, 15);
            try {
                customer.placeOrder(Arrays.asList(largeLine));
            } catch (IllegalStateException e) {
                System.out.println("Order rejected: " + e.getMessage());
            }

            // Increase credit limit
            System.out.println("\n--- Increasing Credit Limit ---");
            customer.increaseCreditLimit(new BigDecimal("5000"));
            System.out.println("New credit limit: $" + customer.getCreditLimit());

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
