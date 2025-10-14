package Enterprise.IdentityMap;
import java.math.BigDecimal;
import java.util.*;
public class Session {
    private Map<Class<?>, IdentityMap<Long, Object>> identityMaps = new HashMap<>();
    private boolean inTransaction = false;
    private Map<Object, Object> transactionBackup = new HashMap<>();
    
    @SuppressWarnings("unchecked")
    public <T> T get(Class<T> entityClass, Long id) {
        IdentityMap<Long, Object> map = identityMaps.computeIfAbsent(entityClass, k -> new IdentityMap<>());
        Object entity = map.get(id);
        if (entity == null) {
            entity = loadEntity(entityClass, id);
            map.put(id, entity);
        }
        return (T) entity;
    }
    
    private Object loadEntity(Class<?> entityClass, Long id) {
        if (entityClass == Customer.class) {
            return new Customer(id, "Customer " + id, "customer" + id + "@example.com");
        } else if (entityClass == Product.class) {
            return new Product(id, "Laptop", new BigDecimal("999.99"), "Electronics");
        } else if (entityClass == Order.class) {
            Order order = new Order(id, 1L);
            order.addItem(new OrderItem(1L, 101L, 2, new BigDecimal("999.99")));
            return order;
        }
        return null;
    }
    
    public void beginTransaction() {
        inTransaction = true;
        transactionBackup.clear();
    }
    
    public void commit() {
        inTransaction = false;
        transactionBackup.clear();
    }
    
    public void rollback() {
        inTransaction = false;
        transactionBackup.clear();
    }
    
    public void printCacheStatistics() {
        System.out.println("\nSession cache statistics:");
        identityMaps.forEach((clazz, map) -> {
            System.out.println("  " + clazz.getSimpleName() + ": " + map.size() + " entities");
        });
    }
    
    public void close() {
        identityMaps.clear();
    }
}
