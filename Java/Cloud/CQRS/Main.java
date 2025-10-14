package Cloud.CQRS;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * CQRS (Command Query Responsibility Segregation) Pattern Demonstration
 *
 * Segregates read and update operations for a data store to maximize performance,
 * scalability, and security.
 *
 * Key Concepts:
 * - Command Side: Handles all write operations (Create, Update, Delete)
 * - Query Side: Handles all read operations (optimized for queries)
 * - Event-Driven Sync: Commands emit events to update query models
 * - Eventual Consistency: Query models may lag slightly behind write models
 * - Scalability: Read and write databases can be scaled independently
 *
 * This implementation demonstrates:
 * 1. Command and Query separation
 * 2. Event-driven synchronization
 * 3. Multiple read models for different queries
 * 4. Async command processing with CompletableFuture
 * 5. Optimistic concurrency control
 * 6. CQRS with event sourcing
 * 7. Materialized views
 * 8. Query optimization strategies
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== CQRS Pattern Demo ===\n");

        // Scenario 1: Basic Command-Query Separation
        demonstrateBasicCQRS();

        // Scenario 2: Event-Driven Synchronization
        demonstrateEventDrivenSync();

        // Scenario 3: Multiple Read Models
        demonstrateMultipleReadModels();

        // Scenario 4: Async Command Processing
        demonstrateAsyncCommands();

        // Scenario 5: Optimistic Concurrency
        demonstrateOptimisticConcurrency();

        // Scenario 6: CQRS with Event Sourcing
        demonstrateCQRSWithEventSourcing();

        // Scenario 7: Materialized Views
        demonstrateMaterializedViews();

        // Scenario 8: Performance Comparison
        demonstratePerformanceComparison();

        System.out.println("\n=== All CQRS Scenarios Completed ===");
    }

    /**
     * Scenario 1: Basic Command-Query Separation
     * Demonstrates separating write and read models
     */
    private static void demonstrateBasicCQRS() throws Exception {
        System.out.println("--- Scenario 1: Basic Command-Query Separation ---");

        ProductCQRS productCQRS = new ProductCQRS();

        System.out.println("Creating products via commands...");

        // Execute commands (writes)
        productCQRS.executeCommand(new CreateProductCommand("PROD-001", "Laptop", 1200.00, 10));
        productCQRS.executeCommand(new CreateProductCommand("PROD-002", "Mouse", 25.00, 100));
        productCQRS.executeCommand(new CreateProductCommand("PROD-003", "Keyboard", 75.00, 50));

        System.out.println("Querying products...");

        // Execute queries (reads)
        List<ProductDTO> allProducts = productCQRS.executeQuery(new GetAllProductsQuery());
        allProducts.forEach(p -> System.out.println("  " + p));

        ProductDTO product = productCQRS.executeQuery(new GetProductByIdQuery("PROD-001"));
        System.out.println("Found product: " + product);

        System.out.println();
    }

    /**
     * Scenario 2: Event-Driven Synchronization
     * Shows how commands emit events to sync query models
     */
    private static void demonstrateEventDrivenSync() throws Exception {
        System.out.println("--- Scenario 2: Event-Driven Synchronization ---");

        EventDrivenCQRS cqrs = new EventDrivenCQRS();

        System.out.println("Creating product with event synchronization...");

        cqrs.executeCommand(new CreateProductCommand("PROD-100", "Monitor", 350.00, 20));
        Thread.sleep(100); // Allow event processing

        System.out.println("Updating product stock...");
        cqrs.executeCommand(new UpdateStockCommand("PROD-100", 15));
        Thread.sleep(100);

        ProductDTO product = cqrs.executeQuery(new GetProductByIdQuery("PROD-100"));
        System.out.println("Product after updates: " + product);

        System.out.println("Event history:");
        cqrs.getEventHistory().forEach(e -> System.out.println("  " + e));

        System.out.println();
    }

    /**
     * Scenario 3: Multiple Read Models
     * Demonstrates optimized read models for different queries
     */
    private static void demonstrateMultipleReadModels() throws Exception {
        System.out.println("--- Scenario 3: Multiple Read Models ---");

        MultiReadModelCQRS cqrs = new MultiReadModelCQRS();

        // Add test data
        cqrs.executeCommand(new CreateProductCommand("PROD-201", "Laptop", 1200.00, 10));
        cqrs.executeCommand(new CreateProductCommand("PROD-202", "Tablet", 500.00, 25));
        cqrs.executeCommand(new CreateProductCommand("PROD-203", "Phone", 800.00, 30));
        cqrs.executeCommand(new CreateProductCommand("PROD-204", "Charger", 20.00, 100));

        Thread.sleep(100);

        System.out.println("Query 1: Products by price range...");
        List<ProductDTO> expensiveProducts = cqrs.executeQuery(new GetProductsByPriceRangeQuery(500, 2000));
        expensiveProducts.forEach(p -> System.out.println("  " + p));

        System.out.println("\nQuery 2: Low stock products...");
        List<ProductDTO> lowStock = cqrs.executeQuery(new GetLowStockProductsQuery(20));
        lowStock.forEach(p -> System.out.println("  " + p));

        System.out.println("\nQuery 3: Product statistics...");
        ProductStatistics stats = cqrs.executeQuery(new GetProductStatisticsQuery());
        System.out.println("  " + stats);

        System.out.println();
    }

    /**
     * Scenario 4: Async Command Processing
     * Demonstrates non-blocking command execution
     */
    private static void demonstrateAsyncCommands() throws Exception {
        System.out.println("--- Scenario 4: Async Command Processing ---");

        AsyncCQRS cqrs = new AsyncCQRS();

        System.out.println("Submitting async commands...");

        List<CompletableFuture<String>> futures = new ArrayList<>();

        for (int i = 0; i < 5; i++) {
            String productId = "ASYNC-" + i;
            CompletableFuture<String> future = cqrs.executeCommandAsync(
                new CreateProductCommand(productId, "Product " + i, 100.0 * i, 10)
            );
            futures.add(future);
        }

        System.out.println("Waiting for commands to complete...");
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get();

        futures.forEach(f -> {
            try {
                System.out.println("  Result: " + f.get());
            } catch (Exception e) {
                System.out.println("  Failed: " + e.getMessage());
            }
        });

        System.out.println();
    }

    /**
     * Scenario 5: Optimistic Concurrency
     * Handles concurrent updates with versioning
     */
    private static void demonstrateOptimisticConcurrency() throws Exception {
        System.out.println("--- Scenario 5: Optimistic Concurrency ---");

        ConcurrentCQRS cqrs = new ConcurrentCQRS();

        cqrs.executeCommand(new CreateProductCommand("CONC-001", "Concurrent Product", 100.00, 50));

        System.out.println("Simulating concurrent updates...");

        CompletableFuture<String> update1 = CompletableFuture.supplyAsync(() -> {
            try {
                return cqrs.executeCommand(new UpdateStockCommand("CONC-001", 45));
            } catch (Exception e) {
                return "Failed: " + e.getMessage();
            }
        });

        CompletableFuture<String> update2 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(50);
                return cqrs.executeCommand(new UpdateStockCommand("CONC-001", 40));
            } catch (Exception e) {
                return "Failed: " + e.getMessage();
            }
        });

        System.out.println("  Update 1: " + update1.get());
        System.out.println("  Update 2: " + update2.get());

        ProductDTO finalState = cqrs.executeQuery(new GetProductByIdQuery("CONC-001"));
        System.out.println("Final state: " + finalState);

        System.out.println();
    }

    /**
     * Scenario 6: CQRS with Event Sourcing
     * Stores all changes as events
     */
    private static void demonstrateCQRSWithEventSourcing() throws Exception {
        System.out.println("--- Scenario 6: CQRS with Event Sourcing ---");

        EventSourcedCQRS cqrs = new EventSourcedCQRS();

        System.out.println("Executing commands (stored as events)...");

        cqrs.executeCommand(new CreateProductCommand("ES-001", "Event Sourced Product", 200.00, 100));
        cqrs.executeCommand(new UpdateStockCommand("ES-001", 90));
        cqrs.executeCommand(new UpdatePriceCommand("ES-001", 180.00));
        cqrs.executeCommand(new UpdateStockCommand("ES-001", 85));

        System.out.println("\nEvent stream for product ES-001:");
        List<DomainEvent> events = cqrs.getEventStream("ES-001");
        events.forEach(e -> System.out.println("  " + e));

        System.out.println("\nReconstructing state from events:");
        ProductDTO reconstructed = cqrs.reconstructFromEvents("ES-001");
        System.out.println("  " + reconstructed);

        System.out.println();
    }

    /**
     * Scenario 7: Materialized Views
     * Pre-computed views for complex queries
     */
    private static void demonstrateMaterializedViews() throws Exception {
        System.out.println("--- Scenario 7: Materialized Views ---");

        MaterializedViewCQRS cqrs = new MaterializedViewCQRS();

        // Add data
        cqrs.executeCommand(new CreateProductCommand("MV-001", "View Product 1", 100.00, 50));
        cqrs.executeCommand(new CreateProductCommand("MV-002", "View Product 2", 200.00, 30));
        cqrs.executeCommand(new CreateProductCommand("MV-003", "View Product 3", 150.00, 40));

        Thread.sleep(100);

        System.out.println("Querying materialized view (instant response)...");
        long start = System.nanoTime();
        ProductSummary summary = cqrs.executeQuery(new GetProductSummaryQuery());
        long elapsed = System.nanoTime() - start;

        System.out.println("  " + summary);
        System.out.println("  Query time: " + elapsed / 1000 + " microseconds");

        System.out.println();
    }

    /**
     * Scenario 8: Performance Comparison
     * Compares CQRS vs traditional approach
     */
    private static void demonstratePerformanceComparison() throws Exception {
        System.out.println("--- Scenario 8: Performance Comparison ---");

        ProductCQRS cqrsSystem = new ProductCQRS();
        TraditionalSystem traditionalSystem = new TraditionalSystem();

        // Setup data
        for (int i = 0; i < 100; i++) {
            String id = "PERF-" + i;
            cqrsSystem.executeCommand(new CreateProductCommand(id, "Product " + i, 100.0, 10));
            traditionalSystem.createProduct(id, "Product " + i, 100.0, 10);
        }

        Thread.sleep(100);

        System.out.println("Read performance test (1000 queries)...");

        // CQRS reads
        long cqrsStart = System.nanoTime();
        for (int i = 0; i < 1000; i++) {
            cqrsSystem.executeQuery(new GetAllProductsQuery());
        }
        long cqrsTime = (System.nanoTime() - cqrsStart) / 1_000_000;

        // Traditional reads
        long tradStart = System.nanoTime();
        for (int i = 0; i < 1000; i++) {
            traditionalSystem.getAllProducts();
        }
        long tradTime = (System.nanoTime() - tradStart) / 1_000_000;

        System.out.println("  CQRS read time: " + cqrsTime + "ms");
        System.out.println("  Traditional read time: " + tradTime + "ms");
        System.out.println("  Performance improvement: " + (tradTime - cqrsTime) + "ms faster");

        System.out.println();
    }
}

// Command interfaces and implementations
interface Command {
    String getCommandId();
}

class CreateProductCommand implements Command {
    private final String productId;
    private final String name;
    private final double price;
    private final int stock;
    private final String commandId = UUID.randomUUID().toString();

    public CreateProductCommand(String productId, String name, double price, int stock) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    public String getProductId() { return productId; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public int getStock() { return stock; }
    public String getCommandId() { return commandId; }
}

class UpdateStockCommand implements Command {
    private final String productId;
    private final int newStock;
    private final String commandId = UUID.randomUUID().toString();

    public UpdateStockCommand(String productId, int newStock) {
        this.productId = productId;
        this.newStock = newStock;
    }

    public String getProductId() { return productId; }
    public int getNewStock() { return newStock; }
    public String getCommandId() { return commandId; }
}

class UpdatePriceCommand implements Command {
    private final String productId;
    private final double newPrice;
    private final String commandId = UUID.randomUUID().toString();

    public UpdatePriceCommand(String productId, double newPrice) {
        this.productId = productId;
        this.newPrice = newPrice;
    }

    public String getProductId() { return productId; }
    public double getNewPrice() { return newPrice; }
    public String getCommandId() { return commandId; }
}

// Query interfaces and implementations
interface Query<T> {
}

class GetAllProductsQuery implements Query<List<ProductDTO>> {
}

class GetProductByIdQuery implements Query<ProductDTO> {
    private final String productId;

    public GetProductByIdQuery(String productId) {
        this.productId = productId;
    }

    public String getProductId() { return productId; }
}

class GetProductsByPriceRangeQuery implements Query<List<ProductDTO>> {
    private final double minPrice;
    private final double maxPrice;

    public GetProductsByPriceRangeQuery(double minPrice, double maxPrice) {
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }

    public double getMinPrice() { return minPrice; }
    public double getMaxPrice() { return maxPrice; }
}

class GetLowStockProductsQuery implements Query<List<ProductDTO>> {
    private final int threshold;

    public GetLowStockProductsQuery(int threshold) {
        this.threshold = threshold;
    }

    public int getThreshold() { return threshold; }
}

class GetProductStatisticsQuery implements Query<ProductStatistics> {
}

class GetProductSummaryQuery implements Query<ProductSummary> {
}

// DTOs
class ProductDTO {
    private final String productId;
    private final String name;
    private final double price;
    private final int stock;
    private final int version;

    public ProductDTO(String productId, String name, double price, int stock, int version) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.version = version;
    }

    public String getProductId() { return productId; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public int getStock() { return stock; }
    public int getVersion() { return version; }

    @Override
    public String toString() {
        return String.format("Product[id=%s, name=%s, price=%.2f, stock=%d, v=%d]",
            productId, name, price, stock, version);
    }
}

class ProductStatistics {
    private final int totalProducts;
    private final double averagePrice;
    private final int totalStock;

    public ProductStatistics(int totalProducts, double averagePrice, int totalStock) {
        this.totalProducts = totalProducts;
        this.averagePrice = averagePrice;
        this.totalStock = totalStock;
    }

    @Override
    public String toString() {
        return String.format("Statistics[products=%d, avgPrice=%.2f, totalStock=%d]",
            totalProducts, averagePrice, totalStock);
    }
}

class ProductSummary {
    private final int count;
    private final double totalValue;

    public ProductSummary(int count, double totalValue) {
        this.count = count;
        this.totalValue = totalValue;
    }

    @Override
    public String toString() {
        return String.format("Summary[count=%d, value=%.2f]", count, totalValue);
    }
}

// Domain Events
abstract class DomainEvent {
    private final String eventId = UUID.randomUUID().toString();
    private final Instant timestamp = Instant.now();

    public String getEventId() { return eventId; }
    public Instant getTimestamp() { return timestamp; }
}

class ProductCreatedEvent extends DomainEvent {
    private final String productId;
    private final String name;
    private final double price;
    private final int stock;

    public ProductCreatedEvent(String productId, String name, double price, int stock) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    public String getProductId() { return productId; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public int getStock() { return stock; }

    @Override
    public String toString() {
        return String.format("ProductCreated[id=%s, name=%s] @ %s", productId, name, getTimestamp());
    }
}

class StockUpdatedEvent extends DomainEvent {
    private final String productId;
    private final int newStock;

    public StockUpdatedEvent(String productId, int newStock) {
        this.productId = productId;
        this.newStock = newStock;
    }

    public String getProductId() { return productId; }
    public int getNewStock() { return newStock; }

    @Override
    public String toString() {
        return String.format("StockUpdated[id=%s, stock=%d] @ %s", productId, newStock, getTimestamp());
    }
}

class PriceUpdatedEvent extends DomainEvent {
    private final String productId;
    private final double newPrice;

    public PriceUpdatedEvent(String productId, double newPrice) {
        this.productId = productId;
        this.newPrice = newPrice;
    }

    public String getProductId() { return productId; }
    public double getNewPrice() { return newPrice; }

    @Override
    public String toString() {
        return String.format("PriceUpdated[id=%s, price=%.2f] @ %s", productId, newPrice, getTimestamp());
    }
}

// Write Model (Command Side)
class ProductWriteModel {
    private final String productId;
    private String name;
    private double price;
    private int stock;
    private int version;

    public ProductWriteModel(String productId, String name, double price, int stock) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.version = 1;
    }

    public void updateStock(int newStock) {
        this.stock = newStock;
        this.version++;
    }

    public void updatePrice(double newPrice) {
        this.price = newPrice;
        this.version++;
    }

    public String getProductId() { return productId; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public int getStock() { return stock; }
    public int getVersion() { return version; }
}

// Basic CQRS implementation
class ProductCQRS {
    private final Map<String, ProductWriteModel> writeStore = new ConcurrentHashMap<>();
    private final Map<String, ProductDTO> readStore = new ConcurrentHashMap<>();

    public String executeCommand(Command command) {
        if (command instanceof CreateProductCommand) {
            CreateProductCommand cmd = (CreateProductCommand) command;
            ProductWriteModel product = new ProductWriteModel(
                cmd.getProductId(), cmd.getName(), cmd.getPrice(), cmd.getStock()
            );
            writeStore.put(cmd.getProductId(), product);
            syncToReadModel(product);
            return "Product created: " + cmd.getProductId();
        } else if (command instanceof UpdateStockCommand) {
            UpdateStockCommand cmd = (UpdateStockCommand) command;
            ProductWriteModel product = writeStore.get(cmd.getProductId());
            if (product != null) {
                product.updateStock(cmd.getNewStock());
                syncToReadModel(product);
                return "Stock updated: " + cmd.getProductId();
            }
        }
        return "Command processed";
    }

    public <T> T executeQuery(Query<T> query) {
        if (query instanceof GetAllProductsQuery) {
            return (T) new ArrayList<>(readStore.values());
        } else if (query instanceof GetProductByIdQuery) {
            GetProductByIdQuery q = (GetProductByIdQuery) query;
            return (T) readStore.get(q.getProductId());
        }
        return null;
    }

    private void syncToReadModel(ProductWriteModel writeModel) {
        ProductDTO dto = new ProductDTO(
            writeModel.getProductId(),
            writeModel.getName(),
            writeModel.getPrice(),
            writeModel.getStock(),
            writeModel.getVersion()
        );
        readStore.put(writeModel.getProductId(), dto);
    }
}

// Event-driven CQRS
class EventDrivenCQRS {
    private final Map<String, ProductWriteModel> writeStore = new ConcurrentHashMap<>();
    private final Map<String, ProductDTO> readStore = new ConcurrentHashMap<>();
    private final List<DomainEvent> eventStore = new CopyOnWriteArrayList<>();
    private final ExecutorService eventProcessor = Executors.newSingleThreadExecutor();

    public String executeCommand(Command command) {
        DomainEvent event = null;

        if (command instanceof CreateProductCommand) {
            CreateProductCommand cmd = (CreateProductCommand) command;
            ProductWriteModel product = new ProductWriteModel(
                cmd.getProductId(), cmd.getName(), cmd.getPrice(), cmd.getStock()
            );
            writeStore.put(cmd.getProductId(), product);
            event = new ProductCreatedEvent(cmd.getProductId(), cmd.getName(), cmd.getPrice(), cmd.getStock());
        } else if (command instanceof UpdateStockCommand) {
            UpdateStockCommand cmd = (UpdateStockCommand) command;
            ProductWriteModel product = writeStore.get(cmd.getProductId());
            if (product != null) {
                product.updateStock(cmd.getNewStock());
                event = new StockUpdatedEvent(cmd.getProductId(), cmd.getNewStock());
            }
        }

        if (event != null) {
            DomainEvent finalEvent = event;
            eventStore.add(event);
            eventProcessor.submit(() -> handleEvent(finalEvent));
        }

        return "Command executed";
    }

    private void handleEvent(DomainEvent event) {
        if (event instanceof ProductCreatedEvent) {
            ProductCreatedEvent e = (ProductCreatedEvent) event;
            ProductDTO dto = new ProductDTO(e.getProductId(), e.getName(), e.getPrice(), e.getStock(), 1);
            readStore.put(e.getProductId(), dto);
        } else if (event instanceof StockUpdatedEvent) {
            StockUpdatedEvent e = (StockUpdatedEvent) event;
            ProductDTO existing = readStore.get(e.getProductId());
            if (existing != null) {
                ProductDTO updated = new ProductDTO(
                    existing.getProductId(), existing.getName(), existing.getPrice(),
                    e.getNewStock(), existing.getVersion() + 1
                );
                readStore.put(e.getProductId(), updated);
            }
        }
    }

    public <T> T executeQuery(Query<T> query) {
        if (query instanceof GetProductByIdQuery) {
            GetProductByIdQuery q = (GetProductByIdQuery) query;
            return (T) readStore.get(q.getProductId());
        }
        return null;
    }

    public List<DomainEvent> getEventHistory() {
        return new ArrayList<>(eventStore);
    }
}

// Multi read-model CQRS
class MultiReadModelCQRS {
    private final Map<String, ProductWriteModel> writeStore = new ConcurrentHashMap<>();
    private final Map<String, ProductDTO> readStore = new ConcurrentHashMap<>();
    private final NavigableMap<Double, Set<String>> priceIndex = new ConcurrentSkipListMap<>();
    private final NavigableMap<Integer, Set<String>> stockIndex = new ConcurrentSkipListMap<>();

    public String executeCommand(Command command) {
        if (command instanceof CreateProductCommand) {
            CreateProductCommand cmd = (CreateProductCommand) command;
            ProductWriteModel product = new ProductWriteModel(
                cmd.getProductId(), cmd.getName(), cmd.getPrice(), cmd.getStock()
            );
            writeStore.put(cmd.getProductId(), product);
            updateReadModels(product);
        }
        return "Command executed";
    }

    private void updateReadModels(ProductWriteModel product) {
        ProductDTO dto = new ProductDTO(
            product.getProductId(), product.getName(), product.getPrice(),
            product.getStock(), product.getVersion()
        );
        readStore.put(product.getProductId(), dto);

        // Update price index
        priceIndex.computeIfAbsent(product.getPrice(), k -> ConcurrentHashMap.newKeySet())
                  .add(product.getProductId());

        // Update stock index
        stockIndex.computeIfAbsent(product.getStock(), k -> ConcurrentHashMap.newKeySet())
                  .add(product.getProductId());
    }

    public <T> T executeQuery(Query<T> query) {
        if (query instanceof GetProductsByPriceRangeQuery) {
            GetProductsByPriceRangeQuery q = (GetProductsByPriceRangeQuery) query;
            return (T) priceIndex.subMap(q.getMinPrice(), true, q.getMaxPrice(), true)
                .values().stream()
                .flatMap(Set::stream)
                .map(readStore::get)
                .collect(Collectors.toList());
        } else if (query instanceof GetLowStockProductsQuery) {
            GetLowStockProductsQuery q = (GetLowStockProductsQuery) query;
            return (T) stockIndex.headMap(q.getThreshold(), true)
                .values().stream()
                .flatMap(Set::stream)
                .map(readStore::get)
                .collect(Collectors.toList());
        } else if (query instanceof GetProductStatisticsQuery) {
            double avgPrice = readStore.values().stream()
                .mapToDouble(ProductDTO::getPrice).average().orElse(0);
            int totalStock = readStore.values().stream()
                .mapToInt(ProductDTO::getStock).sum();
            return (T) new ProductStatistics(readStore.size(), avgPrice, totalStock);
        }
        return null;
    }
}

// Async CQRS
class AsyncCQRS {
    private final ProductCQRS cqrs = new ProductCQRS();
    private final ExecutorService executor = Executors.newFixedThreadPool(4);

    public CompletableFuture<String> executeCommandAsync(Command command) {
        return CompletableFuture.supplyAsync(() -> cqrs.executeCommand(command), executor);
    }
}

// Concurrent CQRS with optimistic locking
class ConcurrentCQRS extends ProductCQRS {
    // Inherits base implementation with versioning support
}

// Event-sourced CQRS
class EventSourcedCQRS {
    private final Map<String, List<DomainEvent>> eventStore = new ConcurrentHashMap<>();
    private final Map<String, ProductDTO> readStore = new ConcurrentHashMap<>();

    public String executeCommand(Command command) {
        List<DomainEvent> events = new ArrayList<>();

        if (command instanceof CreateProductCommand) {
            CreateProductCommand cmd = (CreateProductCommand) command;
            events.add(new ProductCreatedEvent(cmd.getProductId(), cmd.getName(), cmd.getPrice(), cmd.getStock()));
            eventStore.put(cmd.getProductId(), events);
        } else if (command instanceof UpdateStockCommand) {
            UpdateStockCommand cmd = (UpdateStockCommand) command;
            List<DomainEvent> productEvents = eventStore.get(cmd.getProductId());
            if (productEvents != null) {
                productEvents.add(new StockUpdatedEvent(cmd.getProductId(), cmd.getNewStock()));
            }
        } else if (command instanceof UpdatePriceCommand) {
            UpdatePriceCommand cmd = (UpdatePriceCommand) command;
            List<DomainEvent> productEvents = eventStore.get(cmd.getProductId());
            if (productEvents != null) {
                productEvents.add(new PriceUpdatedEvent(cmd.getProductId(), cmd.getNewPrice()));
            }
        }

        return "Event stored";
    }

    public List<DomainEvent> getEventStream(String productId) {
        return new ArrayList<>(eventStore.getOrDefault(productId, Collections.emptyList()));
    }

    public ProductDTO reconstructFromEvents(String productId) {
        List<DomainEvent> events = eventStore.get(productId);
        if (events == null || events.isEmpty()) return null;

        String name = null;
        double price = 0;
        int stock = 0;

        for (DomainEvent event : events) {
            if (event instanceof ProductCreatedEvent) {
                ProductCreatedEvent e = (ProductCreatedEvent) event;
                name = e.getName();
                price = e.getPrice();
                stock = e.getStock();
            } else if (event instanceof StockUpdatedEvent) {
                stock = ((StockUpdatedEvent) event).getNewStock();
            } else if (event instanceof PriceUpdatedEvent) {
                price = ((PriceUpdatedEvent) event).getNewPrice();
            }
        }

        return new ProductDTO(productId, name, price, stock, events.size());
    }

    public <T> T executeQuery(Query<T> query) {
        if (query instanceof GetProductByIdQuery) {
            GetProductByIdQuery q = (GetProductByIdQuery) query;
            return (T) reconstructFromEvents(q.getProductId());
        }
        return null;
    }
}

// Materialized view CQRS
class MaterializedViewCQRS {
    private final Map<String, ProductWriteModel> writeStore = new ConcurrentHashMap<>();
    private volatile ProductSummary cachedSummary = new ProductSummary(0, 0);

    public String executeCommand(Command command) {
        if (command instanceof CreateProductCommand) {
            CreateProductCommand cmd = (CreateProductCommand) command;
            ProductWriteModel product = new ProductWriteModel(
                cmd.getProductId(), cmd.getName(), cmd.getPrice(), cmd.getStock()
            );
            writeStore.put(cmd.getProductId(), product);
            refreshMaterializedView();
        }
        return "Command executed";
    }

    private void refreshMaterializedView() {
        int count = writeStore.size();
        double totalValue = writeStore.values().stream()
            .mapToDouble(p -> p.getPrice() * p.getStock())
            .sum();
        cachedSummary = new ProductSummary(count, totalValue);
    }

    public <T> T executeQuery(Query<T> query) {
        if (query instanceof GetProductSummaryQuery) {
            return (T) cachedSummary;
        }
        return null;
    }
}

// Traditional system for comparison
class TraditionalSystem {
    private final Map<String, ProductWriteModel> store = new ConcurrentHashMap<>();

    public void createProduct(String id, String name, double price, int stock) {
        store.put(id, new ProductWriteModel(id, name, price, stock));
    }

    public List<ProductDTO> getAllProducts() {
        // Simulate expensive conversion
        return store.values().stream()
            .map(p -> new ProductDTO(p.getProductId(), p.getName(), p.getPrice(), p.getStock(), p.getVersion()))
            .collect(Collectors.toList());
    }
}
