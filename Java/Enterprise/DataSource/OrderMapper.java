package Enterprise.DataSource;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Data Mapper Pattern
 * Separates domain objects from database, performing bidirectional transfer
 */
public class OrderMapper {
    private static final AtomicLong idGenerator = new AtomicLong(1);
    private final Map<Long, OrderData> storage;

    public OrderMapper() {
        this.storage = new HashMap<>();
    }

    public void insert(Order order) {
        Long id = idGenerator.getAndIncrement();
        order.setId(id);
        OrderData data = mapToData(order);
        storage.put(id, data);
    }

    public void update(Order order) {
        if (order.getId() == null) {
            throw new IllegalStateException("Order must have ID for update");
        }
        if (!storage.containsKey(order.getId())) {
            throw new IllegalArgumentException("Order not found: " + order.getId());
        }
        OrderData data = mapToData(order);
        storage.put(order.getId(), data);
    }

    public void delete(Long id) {
        storage.remove(id);
    }

    public Optional<Order> findById(Long id) {
        OrderData data = storage.get(id);
        return data != null ? Optional.of(mapToDomain(data)) : Optional.empty();
    }

    public List<Order> findAll() {
        return storage.values().stream()
                .map(this::mapToDomain)
                .collect(Collectors.toList());
    }

    public List<Order> findByStatus(String status) {
        return storage.values().stream()
                .filter(data -> data.getStatus().equals(status))
                .map(this::mapToDomain)
                .collect(Collectors.toList());
    }

    public List<Order> findByCustomer(String customerName) {
        return storage.values().stream()
                .filter(data -> data.getCustomerName().equals(customerName))
                .map(this::mapToDomain)
                .collect(Collectors.toList());
    }

    // Mapping methods
    private OrderData mapToData(Order order) {
        return new OrderData(
            order.getId(),
            order.getCustomerName(),
            order.getTotalAmount(),
            order.getStatus()
        );
    }

    private Order mapToDomain(OrderData data) {
        return new Order(
            data.getId(),
            data.getCustomerName(),
            data.getTotalAmount(),
            data.getStatus()
        );
    }

    // Internal data structure
    private static class OrderData {
        private final Long id;
        private final String customerName;
        private final double totalAmount;
        private final String status;

        public OrderData(Long id, String customerName, double totalAmount, String status) {
            this.id = id;
            this.customerName = customerName;
            this.totalAmount = totalAmount;
            this.status = status;
        }

        public Long getId() {
            return id;
        }

        public String getCustomerName() {
            return customerName;
        }

        public double getTotalAmount() {
            return totalAmount;
        }

        public String getStatus() {
            return status;
        }
    }
}
