package Enterprise.Web.ModelViewController;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Model-View-Controller (MVC) Pattern Implementation
 *
 * Purpose:
 * Separates the application into three interconnected components:
 * - Model: Manages data and business logic
 * - View: Displays data to the user
 * - Controller: Handles user input and updates model/view
 *
 * Benefits:
 * - Separation of concerns
 * - Multiple views for same model
 * - Easier testing and maintenance
 * - Parallel development possible
 *
 * This implementation demonstrates:
 * 1. E-commerce product catalog system
 * 2. User authentication and session management
 * 3. Shopping cart operations
 * 4. Order processing workflow
 * 5. Product search and filtering
 * 6. User profile management
 * 7. Admin dashboard operations
 * 8. Real-time inventory updates
 * 9. Multi-language support
 * 10. RESTful API integration
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Model-View-Controller Pattern Demo ===\n");

        // Initialize the application
        ApplicationContext context = new ApplicationContext();

        // Scenario 1: User Authentication
        demonstrateAuthentication(context);

        // Scenario 2: Product Catalog Browsing
        demonstrateProductCatalog(context);

        // Scenario 3: Shopping Cart Operations
        demonstrateShoppingCart(context);

        // Scenario 4: Order Processing
        demonstrateOrderProcessing(context);

        // Scenario 5: Product Search and Filtering
        demonstrateProductSearch(context);

        // Scenario 6: User Profile Management
        demonstrateProfileManagement(context);

        // Scenario 7: Admin Dashboard
        demonstrateAdminDashboard(context);

        // Scenario 8: Real-time Inventory Updates
        demonstrateInventoryUpdates(context);

        // Scenario 9: Multi-language Support
        demonstrateMultiLanguage(context);

        // Scenario 10: RESTful API Integration
        demonstrateAPIIntegration(context);
    }

    /**
     * Scenario 1: User Authentication Flow
     */
    private static void demonstrateAuthentication(ApplicationContext context) {
        System.out.println("\n--- Scenario 1: User Authentication ---");

        AuthController authController = context.getAuthController();

        // Register new user
        authController.register("john.doe@example.com", "securePass123", "John Doe");

        // Login attempt
        authController.login("john.doe@example.com", "securePass123");

        // Failed login attempt
        authController.login("john.doe@example.com", "wrongPassword");

        // Logout
        authController.logout();
    }

    /**
     * Scenario 2: Product Catalog Browsing
     */
    private static void demonstrateProductCatalog(ApplicationContext context) {
        System.out.println("\n--- Scenario 2: Product Catalog Browsing ---");

        ProductController productController = context.getProductController();

        // Add sample products
        productController.addProduct("Laptop", "Electronics", 999.99, 50);
        productController.addProduct("Smartphone", "Electronics", 699.99, 100);
        productController.addProduct("Headphones", "Electronics", 149.99, 200);
        productController.addProduct("Book - Design Patterns", "Books", 49.99, 30);

        // Display all products
        productController.displayAllProducts();

        // Display products by category
        productController.displayProductsByCategory("Electronics");
    }

    /**
     * Scenario 3: Shopping Cart Operations
     */
    private static void demonstrateShoppingCart(ApplicationContext context) {
        System.out.println("\n--- Scenario 3: Shopping Cart Operations ---");

        // Login first
        AuthController authController = context.getAuthController();
        authController.login("john.doe@example.com", "securePass123");

        CartController cartController = context.getCartController();

        // Add items to cart
        cartController.addToCart("Laptop", 1);
        cartController.addToCart("Headphones", 2);

        // View cart
        cartController.viewCart();

        // Update quantity
        cartController.updateQuantity("Headphones", 3);

        // Remove item
        cartController.removeFromCart("Headphones");

        // View updated cart
        cartController.viewCart();
    }

    /**
     * Scenario 4: Order Processing
     */
    private static void demonstrateOrderProcessing(ApplicationContext context) {
        System.out.println("\n--- Scenario 4: Order Processing ---");

        OrderController orderController = context.getOrderController();

        // Place order from cart
        orderController.placeOrder("123 Main St, City, State 12345", "Credit Card");

        // View order history
        orderController.viewOrderHistory();

        // Track specific order
        orderController.trackOrder(1);
    }

    /**
     * Scenario 5: Product Search and Filtering
     */
    private static void demonstrateProductSearch(ApplicationContext context) {
        System.out.println("\n--- Scenario 5: Product Search and Filtering ---");

        SearchController searchController = context.getSearchController();

        // Search by keyword
        searchController.searchProducts("Laptop");

        // Filter by price range
        searchController.filterByPriceRange(100.0, 500.0);

        // Sort products
        searchController.sortProducts("price", "asc");
    }

    /**
     * Scenario 6: User Profile Management
     */
    private static void demonstrateProfileManagement(ApplicationContext context) {
        System.out.println("\n--- Scenario 6: User Profile Management ---");

        ProfileController profileController = context.getProfileController();

        // View profile
        profileController.viewProfile();

        // Update profile
        profileController.updateProfile("John D. Doe", "john.d.doe@example.com", "555-0123");

        // Change password
        profileController.changePassword("securePass123", "newSecurePass456");

        // Add shipping address
        profileController.addShippingAddress("456 Oak Ave, Town, State 67890");
    }

    /**
     * Scenario 7: Admin Dashboard Operations
     */
    private static void demonstrateAdminDashboard(ApplicationContext context) {
        System.out.println("\n--- Scenario 7: Admin Dashboard ---");

        AdminController adminController = context.getAdminController();

        // View dashboard statistics
        adminController.viewDashboard();

        // Manage products
        adminController.updateProductStock("Laptop", 75);
        adminController.updateProductPrice("Smartphone", 649.99);

        // View all orders
        adminController.viewAllOrders();

        // Update order status
        adminController.updateOrderStatus(1, "Shipped");
    }

    /**
     * Scenario 8: Real-time Inventory Updates
     */
    private static void demonstrateInventoryUpdates(ApplicationContext context) {
        System.out.println("\n--- Scenario 8: Real-time Inventory Updates ---");

        InventoryController inventoryController = context.getInventoryController();

        // Check stock levels
        inventoryController.checkStockLevels();

        // Receive new stock
        inventoryController.receiveStock("Laptop", 25);

        // Set low stock alerts
        inventoryController.setLowStockAlert("Smartphone", 20);

        // View inventory report
        inventoryController.generateInventoryReport();
    }

    /**
     * Scenario 9: Multi-language Support
     */
    private static void demonstrateMultiLanguage(ApplicationContext context) {
        System.out.println("\n--- Scenario 9: Multi-language Support ---");

        LocalizationController localeController = context.getLocalizationController();

        // Switch to Spanish
        localeController.setLanguage("es");
        localeController.displayWelcomeMessage();

        // Switch to French
        localeController.setLanguage("fr");
        localeController.displayWelcomeMessage();

        // Switch back to English
        localeController.setLanguage("en");
        localeController.displayWelcomeMessage();
    }

    /**
     * Scenario 10: RESTful API Integration
     */
    private static void demonstrateAPIIntegration(ApplicationContext context) {
        System.out.println("\n--- Scenario 10: RESTful API Integration ---");

        APIController apiController = context.getAPIController();

        // GET request - Fetch products
        apiController.handleRequest("GET", "/api/products", null);

        // POST request - Create product
        Map<String, Object> productData = new HashMap<>();
        productData.put("name", "Tablet");
        productData.put("category", "Electronics");
        productData.put("price", 399.99);
        productData.put("stock", 75);
        apiController.handleRequest("POST", "/api/products", productData);

        // PUT request - Update product
        Map<String, Object> updateData = new HashMap<>();
        updateData.put("price", 379.99);
        apiController.handleRequest("PUT", "/api/products/Tablet", updateData);

        // DELETE request - Remove product
        apiController.handleRequest("DELETE", "/api/products/Tablet", null);
    }
}

/**
 * Application Context - Manages all controllers and models
 */
class ApplicationContext {
    private UserModel userModel;
    private ProductModel productModel;
    private CartModel cartModel;
    private OrderModel orderModel;

    private AuthController authController;
    private ProductController productController;
    private CartController cartController;
    private OrderController orderController;
    private SearchController searchController;
    private ProfileController profileController;
    private AdminController adminController;
    private InventoryController inventoryController;
    private LocalizationController localizationController;
    private APIController apiController;

    public ApplicationContext() {
        // Initialize models
        userModel = new UserModel();
        productModel = new ProductModel();
        cartModel = new CartModel();
        orderModel = new OrderModel();

        // Initialize controllers with views
        authController = new AuthController(userModel, new AuthView());
        productController = new ProductController(productModel, new ProductView());
        cartController = new CartController(cartModel, productModel, userModel, new CartView());
        orderController = new OrderController(orderModel, cartModel, productModel, userModel, new OrderView());
        searchController = new SearchController(productModel, new SearchView());
        profileController = new ProfileController(userModel, new ProfileView());
        adminController = new AdminController(productModel, orderModel, userModel, new AdminView());
        inventoryController = new InventoryController(productModel, new InventoryView());
        localizationController = new LocalizationController(new LocalizationView());
        apiController = new APIController(productModel, new APIView());
    }

    public AuthController getAuthController() { return authController; }
    public ProductController getProductController() { return productController; }
    public CartController getCartController() { return cartController; }
    public OrderController getOrderController() { return orderController; }
    public SearchController getSearchController() { return searchController; }
    public ProfileController getProfileController() { return profileController; }
    public AdminController getAdminController() { return adminController; }
    public InventoryController getInventoryController() { return inventoryController; }
    public LocalizationController getLocalizationController() { return localizationController; }
    public APIController getAPIController() { return apiController; }
}

/**
 * User Model - Manages user data
 */
class UserModel {
    private Map<String, User> users = new HashMap<>();
    private User currentUser;

    public boolean registerUser(String email, String password, String name) {
        if (users.containsKey(email)) {
            return false;
        }
        users.put(email, new User(email, password, name));
        return true;
    }

    public boolean authenticate(String email, String password) {
        User user = users.get(email);
        if (user != null && user.checkPassword(password)) {
            currentUser = user;
            return true;
        }
        return false;
    }

    public void logout() {
        currentUser = null;
    }

    public User getCurrentUser() {
        return currentUser;
    }

    public boolean isLoggedIn() {
        return currentUser != null;
    }
}

/**
 * User Entity
 */
class User {
    private String email;
    private String password;
    private String name;
    private String phone;
    private List<String> addresses = new ArrayList<>();
    private String role = "customer";

    public User(String email, String password, String name) {
        this.email = email;
        this.password = password;
        this.name = name;
    }

    public boolean checkPassword(String password) {
        return this.password.equals(password);
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public List<String> getAddresses() { return addresses; }
    public void addAddress(String address) { addresses.add(address); }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}

/**
 * Product Model - Manages product data
 */
class ProductModel {
    private Map<String, Product> products = new HashMap<>();
    private int nextId = 1;

    public Product addProduct(String name, String category, double price, int stock) {
        Product product = new Product(nextId++, name, category, price, stock);
        products.put(name, product);
        return product;
    }

    public Product getProduct(String name) {
        return products.get(name);
    }

    public List<Product> getAllProducts() {
        return new ArrayList<>(products.values());
    }

    public List<Product> getProductsByCategory(String category) {
        return products.values().stream()
            .filter(p -> p.getCategory().equals(category))
            .collect(Collectors.toList());
    }

    public void updateStock(String name, int stock) {
        Product product = products.get(name);
        if (product != null) {
            product.setStock(stock);
        }
    }

    public void updatePrice(String name, double price) {
        Product product = products.get(name);
        if (product != null) {
            product.setPrice(price);
        }
    }

    public boolean removeProduct(String name) {
        return products.remove(name) != null;
    }
}

/**
 * Product Entity
 */
class Product {
    private int id;
    private String name;
    private String category;
    private double price;
    private int stock;
    private int lowStockThreshold = 10;

    public Product(int id, String name, String category, double price, int stock) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.stock = stock;
    }

    public boolean isAvailable(int quantity) {
        return stock >= quantity;
    }

    public void decreaseStock(int quantity) {
        stock -= quantity;
    }

    public void increaseStock(int quantity) {
        stock += quantity;
    }

    public boolean isLowStock() {
        return stock <= lowStockThreshold;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int threshold) { this.lowStockThreshold = threshold; }
}

/**
 * Cart Model - Manages shopping cart
 */
class CartModel {
    private Map<String, CartItem> items = new HashMap<>();

    public void addItem(String productName, int quantity, double price) {
        if (items.containsKey(productName)) {
            items.get(productName).increaseQuantity(quantity);
        } else {
            items.put(productName, new CartItem(productName, quantity, price));
        }
    }

    public void updateQuantity(String productName, int quantity) {
        CartItem item = items.get(productName);
        if (item != null) {
            item.setQuantity(quantity);
        }
    }

    public void removeItem(String productName) {
        items.remove(productName);
    }

    public Map<String, CartItem> getItems() {
        return new HashMap<>(items);
    }

    public double getTotal() {
        return items.values().stream()
            .mapToDouble(CartItem::getSubtotal)
            .sum();
    }

    public void clear() {
        items.clear();
    }

    public boolean isEmpty() {
        return items.isEmpty();
    }
}

/**
 * Cart Item Entity
 */
class CartItem {
    private String productName;
    private int quantity;
    private double price;

    public CartItem(String productName, int quantity, double price) {
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
    }

    public double getSubtotal() {
        return price * quantity;
    }

    public void increaseQuantity(int amount) {
        quantity += amount;
    }

    public String getProductName() { return productName; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public double getPrice() { return price; }
}

/**
 * Order Model - Manages orders
 */
class OrderModel {
    private List<Order> orders = new ArrayList<>();
    private int nextOrderId = 1;

    public Order createOrder(String userEmail, Map<String, CartItem> items, String address, String paymentMethod) {
        Order order = new Order(nextOrderId++, userEmail, items, address, paymentMethod);
        orders.add(order);
        return order;
    }

    public List<Order> getOrdersByUser(String userEmail) {
        return orders.stream()
            .filter(o -> o.getUserEmail().equals(userEmail))
            .collect(Collectors.toList());
    }

    public Order getOrder(int orderId) {
        return orders.stream()
            .filter(o -> o.getId() == orderId)
            .findFirst()
            .orElse(null);
    }

    public List<Order> getAllOrders() {
        return new ArrayList<>(orders);
    }

    public void updateOrderStatus(int orderId, String status) {
        Order order = getOrder(orderId);
        if (order != null) {
            order.setStatus(status);
        }
    }
}

/**
 * Order Entity
 */
class Order {
    private int id;
    private String userEmail;
    private Map<String, CartItem> items;
    private String shippingAddress;
    private String paymentMethod;
    private String status;
    private double total;
    private Date orderDate;

    public Order(int id, String userEmail, Map<String, CartItem> items, String address, String paymentMethod) {
        this.id = id;
        this.userEmail = userEmail;
        this.items = new HashMap<>(items);
        this.shippingAddress = address;
        this.paymentMethod = paymentMethod;
        this.status = "Pending";
        this.total = items.values().stream().mapToDouble(CartItem::getSubtotal).sum();
        this.orderDate = new Date();
    }

    public int getId() { return id; }
    public String getUserEmail() { return userEmail; }
    public Map<String, CartItem> getItems() { return items; }
    public String getShippingAddress() { return shippingAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getTotal() { return total; }
    public Date getOrderDate() { return orderDate; }
}

// Controllers - Handle user input and coordinate model/view updates

class AuthController {
    private UserModel userModel;
    private AuthView view;

    public AuthController(UserModel model, AuthView view) {
        this.userModel = model;
        this.view = view;
    }

    public void register(String email, String password, String name) {
        if (userModel.registerUser(email, password, name)) {
            view.displayRegistrationSuccess(name);
        } else {
            view.displayRegistrationError("User already exists");
        }
    }

    public void login(String email, String password) {
        if (userModel.authenticate(email, password)) {
            view.displayLoginSuccess(userModel.getCurrentUser().getName());
        } else {
            view.displayLoginError("Invalid credentials");
        }
    }

    public void logout() {
        String name = userModel.getCurrentUser().getName();
        userModel.logout();
        view.displayLogoutSuccess(name);
    }
}

class ProductController {
    private ProductModel model;
    private ProductView view;

    public ProductController(ProductModel model, ProductView view) {
        this.model = model;
        this.view = view;
    }

    public void addProduct(String name, String category, double price, int stock) {
        Product product = model.addProduct(name, category, price, stock);
        view.displayProductAdded(product);
    }

    public void displayAllProducts() {
        List<Product> products = model.getAllProducts();
        view.displayProducts(products);
    }

    public void displayProductsByCategory(String category) {
        List<Product> products = model.getProductsByCategory(category);
        view.displayProductsByCategory(category, products);
    }
}

class CartController {
    private CartModel cartModel;
    private ProductModel productModel;
    private UserModel userModel;
    private CartView view;

    public CartController(CartModel cartModel, ProductModel productModel, UserModel userModel, CartView view) {
        this.cartModel = cartModel;
        this.productModel = productModel;
        this.userModel = userModel;
        this.view = view;
    }

    public void addToCart(String productName, int quantity) {
        if (!userModel.isLoggedIn()) {
            view.displayError("Please login first");
            return;
        }

        Product product = productModel.getProduct(productName);
        if (product == null) {
            view.displayError("Product not found");
            return;
        }

        if (!product.isAvailable(quantity)) {
            view.displayError("Insufficient stock");
            return;
        }

        cartModel.addItem(productName, quantity, product.getPrice());
        view.displayItemAdded(productName, quantity);
    }

    public void updateQuantity(String productName, int quantity) {
        cartModel.updateQuantity(productName, quantity);
        view.displayQuantityUpdated(productName, quantity);
    }

    public void removeFromCart(String productName) {
        cartModel.removeItem(productName);
        view.displayItemRemoved(productName);
    }

    public void viewCart() {
        view.displayCart(cartModel.getItems(), cartModel.getTotal());
    }
}

class OrderController {
    private OrderModel orderModel;
    private CartModel cartModel;
    private ProductModel productModel;
    private UserModel userModel;
    private OrderView view;

    public OrderController(OrderModel orderModel, CartModel cartModel, ProductModel productModel, UserModel userModel, OrderView view) {
        this.orderModel = orderModel;
        this.cartModel = cartModel;
        this.productModel = productModel;
        this.userModel = userModel;
        this.view = view;
    }

    public void placeOrder(String address, String paymentMethod) {
        if (!userModel.isLoggedIn()) {
            view.displayError("Please login first");
            return;
        }

        if (cartModel.isEmpty()) {
            view.displayError("Cart is empty");
            return;
        }

        // Update product stock
        for (CartItem item : cartModel.getItems().values()) {
            Product product = productModel.getProduct(item.getProductName());
            product.decreaseStock(item.getQuantity());
        }

        Order order = orderModel.createOrder(
            userModel.getCurrentUser().getEmail(),
            cartModel.getItems(),
            address,
            paymentMethod
        );

        cartModel.clear();
        view.displayOrderPlaced(order);
    }

    public void viewOrderHistory() {
        if (!userModel.isLoggedIn()) {
            view.displayError("Please login first");
            return;
        }

        List<Order> orders = orderModel.getOrdersByUser(userModel.getCurrentUser().getEmail());
        view.displayOrderHistory(orders);
    }

    public void trackOrder(int orderId) {
        Order order = orderModel.getOrder(orderId);
        if (order != null) {
            view.displayOrderStatus(order);
        } else {
            view.displayError("Order not found");
        }
    }
}

class SearchController {
    private ProductModel model;
    private SearchView view;

    public SearchController(ProductModel model, SearchView view) {
        this.model = model;
        this.view = view;
    }

    public void searchProducts(String keyword) {
        List<Product> results = model.getAllProducts().stream()
            .filter(p -> p.getName().toLowerCase().contains(keyword.toLowerCase()))
            .collect(Collectors.toList());
        view.displaySearchResults(keyword, results);
    }

    public void filterByPriceRange(double minPrice, double maxPrice) {
        List<Product> results = model.getAllProducts().stream()
            .filter(p -> p.getPrice() >= minPrice && p.getPrice() <= maxPrice)
            .collect(Collectors.toList());
        view.displayFilterResults(minPrice, maxPrice, results);
    }

    public void sortProducts(String field, String order) {
        List<Product> products = model.getAllProducts();
        if (field.equals("price")) {
            products.sort(Comparator.comparingDouble(Product::getPrice));
            if (order.equals("desc")) {
                Collections.reverse(products);
            }
        }
        view.displaySortedResults(field, order, products);
    }
}

class ProfileController {
    private UserModel model;
    private ProfileView view;

    public ProfileController(UserModel model, ProfileView view) {
        this.model = model;
        this.view = view;
    }

    public void viewProfile() {
        if (!model.isLoggedIn()) {
            view.displayError("Please login first");
            return;
        }
        view.displayProfile(model.getCurrentUser());
    }

    public void updateProfile(String name, String email, String phone) {
        User user = model.getCurrentUser();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        view.displayProfileUpdated(user);
    }

    public void changePassword(String oldPassword, String newPassword) {
        User user = model.getCurrentUser();
        if (user.checkPassword(oldPassword)) {
            user.setPassword(newPassword);
            view.displayPasswordChanged();
        } else {
            view.displayError("Invalid old password");
        }
    }

    public void addShippingAddress(String address) {
        model.getCurrentUser().addAddress(address);
        view.displayAddressAdded(address);
    }
}

class AdminController {
    private ProductModel productModel;
    private OrderModel orderModel;
    private UserModel userModel;
    private AdminView view;

    public AdminController(ProductModel productModel, OrderModel orderModel, UserModel userModel, AdminView view) {
        this.productModel = productModel;
        this.orderModel = orderModel;
        this.userModel = userModel;
        this.view = view;
    }

    public void viewDashboard() {
        int totalProducts = productModel.getAllProducts().size();
        int totalOrders = orderModel.getAllOrders().size();
        double totalRevenue = orderModel.getAllOrders().stream()
            .mapToDouble(Order::getTotal)
            .sum();
        view.displayDashboard(totalProducts, totalOrders, totalRevenue);
    }

    public void updateProductStock(String productName, int stock) {
        productModel.updateStock(productName, stock);
        view.displayStockUpdated(productName, stock);
    }

    public void updateProductPrice(String productName, double price) {
        productModel.updatePrice(productName, price);
        view.displayPriceUpdated(productName, price);
    }

    public void viewAllOrders() {
        List<Order> orders = orderModel.getAllOrders();
        view.displayAllOrders(orders);
    }

    public void updateOrderStatus(int orderId, String status) {
        orderModel.updateOrderStatus(orderId, status);
        view.displayOrderStatusUpdated(orderId, status);
    }
}

class InventoryController {
    private ProductModel model;
    private InventoryView view;

    public InventoryController(ProductModel model, InventoryView view) {
        this.model = model;
        this.view = view;
    }

    public void checkStockLevels() {
        List<Product> products = model.getAllProducts();
        view.displayStockLevels(products);
    }

    public void receiveStock(String productName, int quantity) {
        Product product = model.getProduct(productName);
        if (product != null) {
            product.increaseStock(quantity);
            view.displayStockReceived(productName, quantity, product.getStock());
        }
    }

    public void setLowStockAlert(String productName, int threshold) {
        Product product = model.getProduct(productName);
        if (product != null) {
            product.setLowStockThreshold(threshold);
            view.displayAlertSet(productName, threshold);
        }
    }

    public void generateInventoryReport() {
        List<Product> products = model.getAllProducts();
        view.displayInventoryReport(products);
    }
}

class LocalizationController {
    private LocalizationView view;

    public LocalizationController(LocalizationView view) {
        this.view = view;
    }

    public void setLanguage(String languageCode) {
        view.setLanguage(languageCode);
    }

    public void displayWelcomeMessage() {
        view.displayWelcomeMessage();
    }
}

class APIController {
    private ProductModel model;
    private APIView view;

    public APIController(ProductModel model, APIView view) {
        this.model = model;
        this.view = view;
    }

    public void handleRequest(String method, String path, Map<String, Object> data) {
        switch (method) {
            case "GET":
                if (path.equals("/api/products")) {
                    view.displayAPIResponse(200, model.getAllProducts());
                }
                break;
            case "POST":
                if (path.equals("/api/products") && data != null) {
                    Product product = model.addProduct(
                        (String) data.get("name"),
                        (String) data.get("category"),
                        (Double) data.get("price"),
                        (Integer) data.get("stock")
                    );
                    view.displayAPIResponse(201, product);
                }
                break;
            case "PUT":
                if (path.startsWith("/api/products/") && data != null) {
                    String productName = path.substring("/api/products/".length());
                    if (data.containsKey("price")) {
                        model.updatePrice(productName, (Double) data.get("price"));
                    }
                    view.displayAPIResponse(200, model.getProduct(productName));
                }
                break;
            case "DELETE":
                if (path.startsWith("/api/products/")) {
                    String productName = path.substring("/api/products/".length());
                    model.removeProduct(productName);
                    view.displayAPIResponse(204, null);
                }
                break;
        }
    }
}

// Views - Display information to the user

class AuthView {
    public void displayRegistrationSuccess(String name) {
        System.out.println("✓ User registered successfully: " + name);
    }

    public void displayRegistrationError(String message) {
        System.out.println("✗ Registration failed: " + message);
    }

    public void displayLoginSuccess(String name) {
        System.out.println("✓ Login successful. Welcome, " + name + "!");
    }

    public void displayLoginError(String message) {
        System.out.println("✗ Login failed: " + message);
    }

    public void displayLogoutSuccess(String name) {
        System.out.println("✓ Logged out successfully. Goodbye, " + name + "!");
    }
}

class ProductView {
    public void displayProductAdded(Product product) {
        System.out.println("✓ Product added: " + product.getName() + " ($" + product.getPrice() + ")");
    }

    public void displayProducts(List<Product> products) {
        System.out.println("\n=== All Products ===");
        for (Product p : products) {
            System.out.printf("%s - %s - $%.2f - Stock: %d%n",
                p.getName(), p.getCategory(), p.getPrice(), p.getStock());
        }
    }

    public void displayProductsByCategory(String category, List<Product> products) {
        System.out.println("\n=== " + category + " Products ===");
        for (Product p : products) {
            System.out.printf("%s - $%.2f - Stock: %d%n",
                p.getName(), p.getPrice(), p.getStock());
        }
    }
}

class CartView {
    public void displayItemAdded(String productName, int quantity) {
        System.out.println("✓ Added to cart: " + productName + " x" + quantity);
    }

    public void displayQuantityUpdated(String productName, int quantity) {
        System.out.println("✓ Updated quantity: " + productName + " x" + quantity);
    }

    public void displayItemRemoved(String productName) {
        System.out.println("✓ Removed from cart: " + productName);
    }

    public void displayCart(Map<String, CartItem> items, double total) {
        System.out.println("\n=== Shopping Cart ===");
        for (CartItem item : items.values()) {
            System.out.printf("%s x%d - $%.2f = $%.2f%n",
                item.getProductName(), item.getQuantity(),
                item.getPrice(), item.getSubtotal());
        }
        System.out.printf("Total: $%.2f%n", total);
    }

    public void displayError(String message) {
        System.out.println("✗ Error: " + message);
    }
}

class OrderView {
    public void displayOrderPlaced(Order order) {
        System.out.println("\n✓ Order #" + order.getId() + " placed successfully!");
        System.out.println("Total: $" + order.getTotal());
        System.out.println("Status: " + order.getStatus());
    }

    public void displayOrderHistory(List<Order> orders) {
        System.out.println("\n=== Order History ===");
        for (Order order : orders) {
            System.out.printf("Order #%d - $%.2f - %s - %s%n",
                order.getId(), order.getTotal(), order.getStatus(), order.getOrderDate());
        }
    }

    public void displayOrderStatus(Order order) {
        System.out.println("\n=== Order #" + order.getId() + " ===");
        System.out.println("Status: " + order.getStatus());
        System.out.println("Total: $" + order.getTotal());
        System.out.println("Shipping to: " + order.getShippingAddress());
    }

    public void displayError(String message) {
        System.out.println("✗ Error: " + message);
    }
}

class SearchView {
    public void displaySearchResults(String keyword, List<Product> results) {
        System.out.println("\n=== Search Results for '" + keyword + "' ===");
        for (Product p : results) {
            System.out.printf("%s - $%.2f%n", p.getName(), p.getPrice());
        }
        System.out.println("Found " + results.size() + " products");
    }

    public void displayFilterResults(double min, double max, List<Product> results) {
        System.out.println("\n=== Products in range $" + min + " - $" + max + " ===");
        for (Product p : results) {
            System.out.printf("%s - $%.2f%n", p.getName(), p.getPrice());
        }
    }

    public void displaySortedResults(String field, String order, List<Product> products) {
        System.out.println("\n=== Products sorted by " + field + " (" + order + ") ===");
        for (Product p : products) {
            System.out.printf("%s - $%.2f%n", p.getName(), p.getPrice());
        }
    }
}

class ProfileView {
    public void displayProfile(User user) {
        System.out.println("\n=== User Profile ===");
        System.out.println("Name: " + user.getName());
        System.out.println("Email: " + user.getEmail());
        System.out.println("Phone: " + (user.getPhone() != null ? user.getPhone() : "Not set"));
        System.out.println("Addresses: " + user.getAddresses().size());
    }

    public void displayProfileUpdated(User user) {
        System.out.println("✓ Profile updated successfully");
    }

    public void displayPasswordChanged() {
        System.out.println("✓ Password changed successfully");
    }

    public void displayAddressAdded(String address) {
        System.out.println("✓ Shipping address added: " + address);
    }

    public void displayError(String message) {
        System.out.println("✗ Error: " + message);
    }
}

class AdminView {
    public void displayDashboard(int totalProducts, int totalOrders, double revenue) {
        System.out.println("\n=== Admin Dashboard ===");
        System.out.println("Total Products: " + totalProducts);
        System.out.println("Total Orders: " + totalOrders);
        System.out.printf("Total Revenue: $%.2f%n", revenue);
    }

    public void displayStockUpdated(String productName, int stock) {
        System.out.println("✓ Stock updated: " + productName + " = " + stock);
    }

    public void displayPriceUpdated(String productName, double price) {
        System.out.printf("✓ Price updated: %s = $%.2f%n", productName, price);
    }

    public void displayAllOrders(List<Order> orders) {
        System.out.println("\n=== All Orders ===");
        for (Order order : orders) {
            System.out.printf("Order #%d - %s - $%.2f - %s%n",
                order.getId(), order.getUserEmail(), order.getTotal(), order.getStatus());
        }
    }

    public void displayOrderStatusUpdated(int orderId, String status) {
        System.out.println("✓ Order #" + orderId + " status updated to: " + status);
    }
}

class InventoryView {
    public void displayStockLevels(List<Product> products) {
        System.out.println("\n=== Current Stock Levels ===");
        for (Product p : products) {
            String alert = p.isLowStock() ? " [LOW STOCK]" : "";
            System.out.printf("%s: %d%s%n", p.getName(), p.getStock(), alert);
        }
    }

    public void displayStockReceived(String productName, int quantity, int newTotal) {
        System.out.println("✓ Received " + quantity + " units of " + productName);
        System.out.println("  New total: " + newTotal);
    }

    public void displayAlertSet(String productName, int threshold) {
        System.out.println("✓ Low stock alert set for " + productName + " at " + threshold + " units");
    }

    public void displayInventoryReport(List<Product> products) {
        System.out.println("\n=== Inventory Report ===");
        double totalValue = 0;
        for (Product p : products) {
            double value = p.getPrice() * p.getStock();
            totalValue += value;
            System.out.printf("%s: %d units @ $%.2f = $%.2f%n",
                p.getName(), p.getStock(), p.getPrice(), value);
        }
        System.out.printf("Total Inventory Value: $%.2f%n", totalValue);
    }
}

class LocalizationView {
    private String currentLanguage = "en";
    private Map<String, Map<String, String>> translations = new HashMap<>();

    public LocalizationView() {
        // English
        Map<String, String> en = new HashMap<>();
        en.put("welcome", "Welcome to our store!");
        translations.put("en", en);

        // Spanish
        Map<String, String> es = new HashMap<>();
        es.put("welcome", "¡Bienvenido a nuestra tienda!");
        translations.put("es", es);

        // French
        Map<String, String> fr = new HashMap<>();
        fr.put("welcome", "Bienvenue dans notre magasin!");
        translations.put("fr", fr);
    }

    public void setLanguage(String languageCode) {
        currentLanguage = languageCode;
        System.out.println("✓ Language set to: " + languageCode);
    }

    public void displayWelcomeMessage() {
        String message = translations.get(currentLanguage).get("welcome");
        System.out.println(message);
    }
}

class APIView {
    public void displayAPIResponse(int statusCode, Object data) {
        System.out.println("\n=== API Response ===");
        System.out.println("Status: " + statusCode);
        if (data != null) {
            System.out.println("Data: " + data);
        }
    }
}
