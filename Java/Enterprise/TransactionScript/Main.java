package Enterprise.TransactionScript;

import java.math.BigDecimal;
import java.sql.*;
import java.util.List;

/**
 * Demonstrates the Transaction Script pattern.
 * Each business transaction is handled by a single procedure.
 */
public class Main {
    public static void main(String[] args) {
        try {
            // Setup in-memory database
            Connection conn = setupDatabase();
            OrderService orderService = new OrderService(conn);

            System.out.println("=== Transaction Script Pattern Demo ===\n");

            // Create orders
            System.out.println("1. Creating orders...");
            Long order1 = orderService.createOrder(1L, new BigDecimal("100.00"));
            Long order2 = orderService.createOrder(1L, new BigDecimal("250.00"));
            System.out.println("Created order #" + order1);
            System.out.println("Created order #" + order2);

            // Process payment
            System.out.println("\n2. Processing payment for order #" + order1);
            orderService.processPayment(order1, new BigDecimal("110.00"));
            System.out.println("Payment processed successfully");

            // Cancel order
            System.out.println("\n3. Cancelling order #" + order2);
            orderService.cancelOrder(order2);
            System.out.println("Order cancelled");

            // Get customer orders
            System.out.println("\n4. Retrieving all orders for customer...");
            List<Order> orders = orderService.getCustomerOrders(1L);
            orders.forEach(System.out::println);

            conn.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static Connection setupDatabase() throws SQLException {
        Connection conn = DriverManager.getConnection("jdbc:h2:mem:testdb");

        Statement stmt = conn.createStatement();
        stmt.execute("CREATE TABLE orders (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "customer_id BIGINT NOT NULL, " +
                "total_amount DECIMAL(10,2) NOT NULL, " +
                "order_date TIMESTAMP NOT NULL, " +
                "status VARCHAR(20) NOT NULL)");

        stmt.execute("CREATE TABLE payments (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "order_id BIGINT NOT NULL, " +
                "amount DECIMAL(10,2) NOT NULL, " +
                "payment_date TIMESTAMP NOT NULL)");

        return conn;
    }
}
