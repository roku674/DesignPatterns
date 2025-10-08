package Enterprise.TransactionScript;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Transaction Script pattern - organizes business logic by procedures where each procedure
 * handles a single request from the presentation layer.
 *
 * This class contains all the procedural logic for order processing.
 */
public class OrderService {
    private Connection connection;

    public OrderService(Connection connection) {
        this.connection = connection;
    }

    /**
     * Creates a new order with validation and database insertion.
     */
    public Long createOrder(Long customerId, BigDecimal amount) throws SQLException {
        // Validation logic
        if (customerId == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid order data");
        }

        // Business logic
        BigDecimal tax = amount.multiply(new BigDecimal("0.10"));
        BigDecimal total = amount.add(tax);

        // Database logic
        String sql = "INSERT INTO orders (customer_id, total_amount, order_date, status) VALUES (?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setLong(1, customerId);
            stmt.setBigDecimal(2, total);
            stmt.setTimestamp(3, Timestamp.valueOf(java.time.LocalDateTime.now()));
            stmt.setString(4, "PENDING");
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                return rs.getLong(1);
            }
        }
        throw new SQLException("Failed to create order");
    }

    /**
     * Processes payment for an order.
     */
    public void processPayment(Long orderId, BigDecimal paymentAmount) throws SQLException {
        // Retrieve order
        String selectSql = "SELECT total_amount, status FROM orders WHERE id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(selectSql)) {
            stmt.setLong(1, orderId);
            ResultSet rs = stmt.executeQuery();

            if (!rs.next()) {
                throw new IllegalArgumentException("Order not found");
            }

            BigDecimal totalAmount = rs.getBigDecimal("total_amount");
            String status = rs.getString("status");

            // Business validation
            if (!"PENDING".equals(status)) {
                throw new IllegalStateException("Order already processed");
            }

            if (paymentAmount.compareTo(totalAmount) < 0) {
                throw new IllegalArgumentException("Insufficient payment amount");
            }

            // Update order status
            String updateSql = "UPDATE orders SET status = ? WHERE id = ?";
            try (PreparedStatement updateStmt = connection.prepareStatement(updateSql)) {
                updateStmt.setString(1, "PAID");
                updateStmt.setLong(2, orderId);
                updateStmt.executeUpdate();
            }

            // Record payment (simplified)
            recordPayment(orderId, paymentAmount);
        }
    }

    /**
     * Cancels an order.
     */
    public void cancelOrder(Long orderId) throws SQLException {
        String sql = "UPDATE orders SET status = ? WHERE id = ? AND status = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, "CANCELLED");
            stmt.setLong(2, orderId);
            stmt.setString(3, "PENDING");

            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new IllegalStateException("Cannot cancel order - not in pending status");
            }
        }
    }

    /**
     * Gets orders for a customer.
     */
    public List<Order> getCustomerOrders(Long customerId) throws SQLException {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT id, customer_id, total_amount, order_date, status FROM orders WHERE customer_id = ?";

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, customerId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Order order = new Order(
                    rs.getLong("customer_id"),
                    rs.getBigDecimal("total_amount")
                );
                order.setId(rs.getLong("id"));
                order.setOrderDate(rs.getTimestamp("order_date").toLocalDateTime());
                order.setStatus(rs.getString("status"));
                orders.add(order);
            }
        }
        return orders;
    }

    private void recordPayment(Long orderId, BigDecimal amount) throws SQLException {
        String sql = "INSERT INTO payments (order_id, amount, payment_date) VALUES (?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setLong(1, orderId);
            stmt.setBigDecimal(2, amount);
            stmt.setTimestamp(3, Timestamp.valueOf(java.time.LocalDateTime.now()));
            stmt.executeUpdate();
        }
    }
}
