package Enterprise.Web;

import java.util.*;

/**
 * Web Presentation Patterns Demonstration
 *
 * Intent: Demonstrates the collection of patterns used for presenting information
 * in web applications. These patterns address how to organize the presentation
 * logic, handle user input, and generate dynamic web pages.
 *
 * This comprehensive demonstration covers:
 * - Model-View-Controller (MVC): Separates data, presentation, and control logic
 * - Front Controller: Single entry point for all web requests
 * - Page Controller: Individual controller per page or action
 * - Application Controller: Manages screen navigation and application flow
 * - Template View: Renders pages using templates with embedded markers
 * - Transform View: Transforms domain data to HTML using transformation logic
 * - Two-Step View: Separates domain-specific from presentation-specific formatting
 *
 * Real-world applications:
 * - E-commerce websites with complex navigation flows
 * - Content management systems
 * - Enterprise web applications
 * - RESTful APIs with HTML rendering
 * - Multi-tenant SaaS platforms
 * - Progressive web applications
 * - Server-side rendered applications
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Web Presentation Patterns Demo ===\n");

        // Scenario 1: E-commerce Website
        demonstrateEcommerceWebsite();

        // Scenario 2: Content Management System
        demonstrateContentManagementSystem();

        // Scenario 3: Social Media Platform
        demonstrateSocialMediaPlatform();

        // Scenario 4: Banking Portal
        demonstrateBankingPortal();

        // Scenario 5: Healthcare Patient Portal
        demonstrateHealthcarePortal();

        // Scenario 6: Educational Learning Platform
        demonstrateEducationalPlatform();

        // Scenario 7: Travel Booking System
        demonstrateTravelBookingSystem();

        // Scenario 8: Real Estate Listing Portal
        demonstrateRealEstatePortal();

        // Scenario 9: Project Management Dashboard
        demonstrateProjectManagementDashboard();

        // Scenario 10: Multi-Tenant SaaS Application
        demonstrateMultiTenantSaaS();

        System.out.println("\n=== Web Presentation Patterns demonstration complete ===");
    }

    /**
     * Scenario 1: E-commerce website combining multiple web patterns
     */
    private static void demonstrateEcommerceWebsite() {
        System.out.println("--- Scenario 1: E-commerce Website ---");

        // Front Controller handles all incoming requests
        EcommerceFrontController frontController = new EcommerceFrontController();

        // Browse products using MVC pattern
        System.out.println("\n[Browse Products - MVC Pattern]");
        ProductController productController = new ProductController();
        productController.handleRequest("/products/browse", createParams("category", "Electronics"));

        // View product details using Template View
        System.out.println("\n[Product Details - Template View]");
        ProductDetailsView productView = new ProductDetailsView();
        Product product = new Product("PROD-001", "Laptop", 999.99, "High-performance laptop");
        productView.render(product);

        // Shopping cart using Page Controller
        System.out.println("\n[Shopping Cart - Page Controller]");
        ShoppingCartPageController cartController = new ShoppingCartPageController();
        cartController.handleRequest(createParams("action", "add", "productId", "PROD-001"));

        // Checkout flow using Application Controller
        System.out.println("\n[Checkout Flow - Application Controller]");
        CheckoutFlowController checkoutFlow = new CheckoutFlowController();
        checkoutFlow.handleCommand("START_CHECKOUT");
        checkoutFlow.handleCommand("ENTER_SHIPPING");
        checkoutFlow.handleCommand("ENTER_PAYMENT");
        checkoutFlow.handleCommand("CONFIRM_ORDER");

        System.out.println();
    }

    /**
     * Scenario 2: Content Management System with flexible rendering
     */
    private static void demonstrateContentManagementSystem() {
        System.out.println("--- Scenario 2: Content Management System ---");

        // Application Controller manages CMS workflow
        CMSApplicationController cmsController = new CMSApplicationController();

        System.out.println("\n[Content Creation Workflow]");
        cmsController.handleCommand("CREATE_ARTICLE");
        cmsController.handleCommand("PREVIEW");
        cmsController.handleCommand("PUBLISH");

        // Transform View for rendering articles
        System.out.println("\n[Article Rendering - Transform View]");
        ArticleTransformView articleView = new ArticleTransformView();
        Article article = new Article("Article Title", "John Doe", "Article content goes here...");
        articleView.transform(article);

        // Two-Step View for consistent layout
        System.out.println("\n[Layout Rendering - Two-Step View]");
        TwoStepViewRenderer renderer = new TwoStepViewRenderer();
        Map<String, Object> pageData = new HashMap<>();
        pageData.put("title", "My Article");
        pageData.put("content", "Article content");
        renderer.render(pageData, "article");

        System.out.println();
    }

    /**
     * Scenario 3: Social media platform with dynamic content
     */
    private static void demonstrateSocialMediaPlatform() {
        System.out.println("--- Scenario 3: Social Media Platform ---");

        // MVC for feed rendering
        System.out.println("\n[News Feed - MVC Pattern]");
        FeedController feedController = new FeedController();
        feedController.handleRequest("/feed", createParams("userId", "USER-123"));

        // Page Controllers for specific actions
        System.out.println("\n[Post Actions - Page Controllers]");
        CreatePostPageController createPost = new CreatePostPageController();
        createPost.handleRequest(createParams("userId", "USER-123", "content", "Hello World!"));

        LikePostPageController likePost = new LikePostPageController();
        likePost.handleRequest(createParams("postId", "POST-456", "userId", "USER-123"));

        CommentPageController comment = new CommentPageController();
        comment.handleRequest(createParams("postId", "POST-456", "userId", "USER-123", "text", "Great post!"));

        // Template View for profile page
        System.out.println("\n[Profile Page - Template View]");
        ProfileTemplateView profileView = new ProfileTemplateView();
        UserProfile profile = new UserProfile("USER-123", "John Doe", 150, 200);
        profileView.render(profile);

        System.out.println();
    }

    /**
     * Scenario 4: Banking portal with strict security and flow control
     */
    private static void demonstrateBankingPortal() {
        System.out.println("--- Scenario 4: Banking Portal ---");

        // Front Controller with security filtering
        System.out.println("\n[Secure Access - Front Controller]");
        BankingFrontController bankingController = new BankingFrontController();
        bankingController.handleRequest("/banking/login", createParams("username", "user123"));
        bankingController.handleRequest("/banking/accounts", createParams("sessionId", "SESSION-789"));

        // Application Controller for transaction workflow
        System.out.println("\n[Transaction Flow - Application Controller]");
        TransactionFlowController transactionFlow = new TransactionFlowController();
        transactionFlow.handleCommand("START_TRANSFER");
        transactionFlow.handleCommand("SELECT_ACCOUNTS");
        transactionFlow.handleCommand("ENTER_AMOUNT");
        transactionFlow.handleCommand("VERIFY_OTP");
        transactionFlow.handleCommand("COMPLETE_TRANSFER");

        // Two-Step View for consistent banking UI
        System.out.println("\n[Account Statement - Two-Step View]");
        BankingTwoStepView bankingView = new BankingTwoStepView();
        Map<String, Object> accountData = new HashMap<>();
        accountData.put("accountNumber", "****1234");
        accountData.put("balance", "$25,000.00");
        bankingView.render(accountData, "statement");

        System.out.println();
    }

    /**
     * Scenario 5: Healthcare patient portal
     */
    private static void demonstrateHealthcarePortal() {
        System.out.println("--- Scenario 5: Healthcare Patient Portal ---");

        // MVC for patient dashboard
        System.out.println("\n[Patient Dashboard - MVC]");
        PatientDashboardController dashboard = new PatientDashboardController();
        dashboard.handleRequest("/dashboard", createParams("patientId", "PAT-001"));

        // Application Controller for appointment booking
        System.out.println("\n[Appointment Booking - Application Controller]");
        AppointmentFlowController appointmentFlow = new AppointmentFlowController();
        appointmentFlow.handleCommand("SELECT_DOCTOR");
        appointmentFlow.handleCommand("CHOOSE_DATE");
        appointmentFlow.handleCommand("CONFIRM_APPOINTMENT");

        // Template View for medical records
        System.out.println("\n[Medical Records - Template View]");
        MedicalRecordsView recordsView = new MedicalRecordsView();
        MedicalRecord record = new MedicalRecord("PAT-001", "Dr. Smith", "2024-10-14", "Annual checkup");
        recordsView.render(record);

        System.out.println();
    }

    /**
     * Scenario 6: Educational learning platform
     */
    private static void demonstrateEducationalPlatform() {
        System.out.println("--- Scenario 6: Educational Learning Platform ---");

        // Front Controller routing
        System.out.println("\n[Course Browsing - Front Controller]");
        EducationFrontController eduController = new EducationFrontController();
        eduController.handleRequest("/courses", createParams("subject", "Computer Science"));

        // MVC for course content
        System.out.println("\n[Course Content - MVC]");
        CourseContentController courseController = new CourseContentController();
        courseController.handleRequest("/course/view", createParams("courseId", "COURSE-101", "studentId", "STU-555"));

        // Transform View for quiz rendering
        System.out.println("\n[Quiz - Transform View]");
        QuizTransformView quizView = new QuizTransformView();
        Quiz quiz = new Quiz("Quiz 1", Arrays.asList("Question 1", "Question 2", "Question 3"));
        quizView.transform(quiz);

        // Page Controller for assignment submission
        System.out.println("\n[Assignment Submission - Page Controller]");
        SubmitAssignmentPageController submitController = new SubmitAssignmentPageController();
        submitController.handleRequest(createParams("courseId", "COURSE-101", "assignmentId", "ASSGN-10", "file", "assignment.pdf"));

        System.out.println();
    }

    /**
     * Scenario 7: Travel booking system
     */
    private static void demonstrateTravelBookingSystem() {
        System.out.println("--- Scenario 7: Travel Booking System ---");

        // Application Controller for booking workflow
        System.out.println("\n[Booking Flow - Application Controller]");
        TravelBookingFlowController bookingFlow = new TravelBookingFlowController();
        bookingFlow.handleCommand("SEARCH_FLIGHTS");
        bookingFlow.handleCommand("SELECT_FLIGHT");
        bookingFlow.handleCommand("PASSENGER_INFO");
        bookingFlow.handleCommand("PAYMENT");
        bookingFlow.handleCommand("CONFIRMATION");

        // Template View for flight search results
        System.out.println("\n[Flight Results - Template View]");
        FlightResultsTemplateView flightView = new FlightResultsTemplateView();
        List<Flight> flights = Arrays.asList(
            new Flight("FL-001", "New York", "London", "$599"),
            new Flight("FL-002", "New York", "London", "$649")
        );
        flightView.render(flights);

        // Two-Step View for booking confirmation
        System.out.println("\n[Booking Confirmation - Two-Step View]");
        BookingTwoStepView bookingView = new BookingTwoStepView();
        Map<String, Object> bookingData = new HashMap<>();
        bookingData.put("bookingId", "BOOK-999");
        bookingData.put("flight", "FL-001");
        bookingData.put("passenger", "John Doe");
        bookingView.render(bookingData, "confirmation");

        System.out.println();
    }

    /**
     * Scenario 8: Real estate listing portal
     */
    private static void demonstrateRealEstatePortal() {
        System.out.println("--- Scenario 8: Real Estate Portal ---");

        // MVC for property search
        System.out.println("\n[Property Search - MVC]");
        PropertySearchController searchController = new PropertySearchController();
        searchController.handleRequest("/search", createParams("city", "San Francisco", "maxPrice", "1000000"));

        // Template View for property listing
        System.out.println("\n[Property Listing - Template View]");
        PropertyListingView listingView = new PropertyListingView();
        Property property = new Property("PROP-777", "123 Main St", "$950,000", "3BR/2BA");
        listingView.render(property);

        // Page Controller for inquiry
        System.out.println("\n[Contact Agent - Page Controller]");
        ContactAgentPageController contactController = new ContactAgentPageController();
        contactController.handleRequest(createParams("propertyId", "PROP-777", "name", "Jane Smith", "email", "jane@example.com"));

        // Transform View for virtual tour
        System.out.println("\n[Virtual Tour - Transform View]");
        VirtualTourView tourView = new VirtualTourView();
        PropertyTour tour = new PropertyTour("PROP-777", Arrays.asList("Living Room", "Kitchen", "Bedroom"));
        tourView.transform(tour);

        System.out.println();
    }

    /**
     * Scenario 9: Project management dashboard
     */
    private static void demonstrateProjectManagementDashboard() {
        System.out.println("--- Scenario 9: Project Management Dashboard ---");

        // Front Controller for dashboard routing
        System.out.println("\n[Dashboard Routing - Front Controller]");
        ProjectManagementFrontController pmController = new ProjectManagementFrontController();
        pmController.handleRequest("/dashboard", createParams("userId", "USER-PM1"));
        pmController.handleRequest("/projects", createParams("teamId", "TEAM-001"));

        // MVC for task board
        System.out.println("\n[Task Board - MVC]");
        TaskBoardController taskBoard = new TaskBoardController();
        taskBoard.handleRequest("/tasks", createParams("projectId", "PROJ-100"));

        // Transform View for Gantt chart
        System.out.println("\n[Gantt Chart - Transform View]");
        GanttChartView ganttView = new GanttChartView();
        ProjectTimeline timeline = new ProjectTimeline("PROJ-100", Arrays.asList(
            new Task("Task 1", "2024-10-01", "2024-10-15"),
            new Task("Task 2", "2024-10-10", "2024-10-25")
        ));
        ganttView.transform(timeline);

        // Application Controller for sprint workflow
        System.out.println("\n[Sprint Management - Application Controller]");
        SprintFlowController sprintFlow = new SprintFlowController();
        sprintFlow.handleCommand("CREATE_SPRINT");
        sprintFlow.handleCommand("ADD_TASKS");
        sprintFlow.handleCommand("START_SPRINT");

        System.out.println();
    }

    /**
     * Scenario 10: Multi-tenant SaaS application
     */
    private static void demonstrateMultiTenantSaaS() {
        System.out.println("--- Scenario 10: Multi-Tenant SaaS Application ---");

        // Front Controller with tenant isolation
        System.out.println("\n[Tenant Routing - Front Controller]");
        MultiTenantFrontController mtController = new MultiTenantFrontController();
        mtController.handleRequest("/app/dashboard", createParams("tenantId", "TENANT-A", "userId", "USER-001"));
        mtController.handleRequest("/app/settings", createParams("tenantId", "TENANT-B", "userId", "USER-002"));

        // Application Controller for onboarding workflow
        System.out.println("\n[Tenant Onboarding - Application Controller]");
        OnboardingFlowController onboarding = new OnboardingFlowController();
        onboarding.handleCommand("REGISTER_TENANT");
        onboarding.handleCommand("CONFIGURE_SETTINGS");
        onboarding.handleCommand("INVITE_USERS");
        onboarding.handleCommand("COMPLETE_ONBOARDING");

        // Two-Step View for tenant-specific branding
        System.out.println("\n[Branded Dashboard - Two-Step View]");
        TenantBrandedView brandedView = new TenantBrandedView();
        Map<String, Object> tenantData = new HashMap<>();
        tenantData.put("tenantId", "TENANT-A");
        tenantData.put("brandColor", "#0066CC");
        tenantData.put("logo", "logo-a.png");
        brandedView.render(tenantData, "dashboard");

        // MVC for tenant admin panel
        System.out.println("\n[Admin Panel - MVC]");
        TenantAdminController adminController = new TenantAdminController();
        adminController.handleRequest("/admin/users", createParams("tenantId", "TENANT-A"));

        System.out.println();
    }

    // Helper method to create parameter maps
    private static Map<String, String> createParams(String... keyValues) {
        Map<String, String> params = new HashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            params.put(keyValues[i], keyValues[i + 1]);
        }
        return params;
    }
}

// ============= Domain Model Classes =============

/**
 * Product domain model
 */
class Product {
    String id;
    String name;
    double price;
    String description;

    public Product(String id, String name, double price, String description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
    }
}

/**
 * Article domain model
 */
class Article {
    String title;
    String author;
    String content;

    public Article(String title, String author, String content) {
        this.title = title;
        this.author = author;
        this.content = content;
    }
}

/**
 * User profile model
 */
class UserProfile {
    String userId;
    String name;
    int followers;
    int following;

    public UserProfile(String userId, String name, int followers, int following) {
        this.userId = userId;
        this.name = name;
        this.followers = followers;
        this.following = following;
    }
}

/**
 * Medical record model
 */
class MedicalRecord {
    String patientId;
    String doctor;
    String date;
    String notes;

    public MedicalRecord(String patientId, String doctor, String date, String notes) {
        this.patientId = patientId;
        this.doctor = doctor;
        this.date = date;
        this.notes = notes;
    }
}

/**
 * Quiz model
 */
class Quiz {
    String title;
    List<String> questions;

    public Quiz(String title, List<String> questions) {
        this.title = title;
        this.questions = questions;
    }
}

/**
 * Flight model
 */
class Flight {
    String flightNumber;
    String origin;
    String destination;
    String price;

    public Flight(String flightNumber, String origin, String destination, String price) {
        this.flightNumber = flightNumber;
        this.origin = origin;
        this.destination = destination;
        this.price = price;
    }
}

/**
 * Property model
 */
class Property {
    String id;
    String address;
    String price;
    String details;

    public Property(String id, String address, String price, String details) {
        this.id = id;
        this.address = address;
        this.price = price;
        this.details = details;
    }
}

/**
 * Property tour model
 */
class PropertyTour {
    String propertyId;
    List<String> rooms;

    public PropertyTour(String propertyId, List<String> rooms) {
        this.propertyId = propertyId;
        this.rooms = rooms;
    }
}

/**
 * Task model
 */
class Task {
    String name;
    String startDate;
    String endDate;

    public Task(String name, String startDate, String endDate) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

/**
 * Project timeline model
 */
class ProjectTimeline {
    String projectId;
    List<Task> tasks;

    public ProjectTimeline(String projectId, List<Task> tasks) {
        this.projectId = projectId;
        this.tasks = tasks;
    }
}

// ============= Scenario 1: E-commerce =============

/**
 * Front Controller for e-commerce
 */
class EcommerceFrontController {
    public void handleRequest(String path, Map<String, String> params) {
        System.out.println("  [Front Controller] Routing request: " + path);
        System.out.println("  [Security] Validating request");
        System.out.println("  [Session] Managing user session");
    }
}

/**
 * Product Controller (MVC)
 */
class ProductController {
    public void handleRequest(String path, Map<String, String> params) {
        String category = params.get("category");
        System.out.println("  [Controller] Loading products for category: " + category);
        System.out.println("  [Model] Fetching from database");
        System.out.println("  [View] Rendering product list");
    }
}

/**
 * Product Details Template View
 */
class ProductDetailsView {
    public void render(Product product) {
        System.out.println("  [Template View] Rendering product details");
        System.out.println("  <html>");
        System.out.println("    <h1>" + product.name + "</h1>");
        System.out.println("    <p>Price: $" + product.price + "</p>");
        System.out.println("    <p>" + product.description + "</p>");
        System.out.println("  </html>");
    }
}

/**
 * Shopping Cart Page Controller
 */
class ShoppingCartPageController {
    public void handleRequest(Map<String, String> params) {
        String action = params.get("action");
        String productId = params.get("productId");
        System.out.println("  [Page Controller] Cart action: " + action);
        System.out.println("  [Business Logic] Adding product " + productId + " to cart");
        System.out.println("  [Session] Updating cart session");
    }
}

/**
 * Checkout Flow Application Controller
 */
class CheckoutFlowController {
    private String currentState = "IDLE";

    public void handleCommand(String command) {
        System.out.println("  [App Controller] Command: " + command + " (Current: " + currentState + ")");

        switch (command) {
            case "START_CHECKOUT":
                currentState = "SHIPPING";
                System.out.println("  → Navigating to shipping page");
                break;
            case "ENTER_SHIPPING":
                currentState = "PAYMENT";
                System.out.println("  → Navigating to payment page");
                break;
            case "ENTER_PAYMENT":
                currentState = "REVIEW";
                System.out.println("  → Navigating to review page");
                break;
            case "CONFIRM_ORDER":
                currentState = "COMPLETE";
                System.out.println("  → Order completed, navigating to confirmation");
                break;
        }
    }
}

// ============= Scenario 2: Content Management =============

/**
 * CMS Application Controller
 */
class CMSApplicationController {
    private String currentState = "IDLE";

    public void handleCommand(String command) {
        System.out.println("  [CMS App Controller] Command: " + command);

        switch (command) {
            case "CREATE_ARTICLE":
                currentState = "EDITING";
                System.out.println("  → Opening article editor");
                break;
            case "PREVIEW":
                System.out.println("  → Showing article preview");
                break;
            case "PUBLISH":
                currentState = "PUBLISHED";
                System.out.println("  → Publishing article");
                break;
        }
    }
}

/**
 * Article Transform View
 */
class ArticleTransformView {
    public void transform(Article article) {
        System.out.println("  [Transform View] Transforming article data to HTML");
        System.out.println("  Data → HTML transformation:");
        System.out.println("    Title: " + article.title + " → <h1>" + article.title + "</h1>");
        System.out.println("    Author: " + article.author + " → <span class='author'>" + article.author + "</span>");
        System.out.println("    Content: → <div class='content'>...</div>");
    }
}

/**
 * Two-Step View Renderer
 */
class TwoStepViewRenderer {
    public void render(Map<String, Object> data, String viewType) {
        System.out.println("  [Two-Step View] Step 1: Creating logical page");
        System.out.println("    View Type: " + viewType);
        System.out.println("    Data: " + data);
        System.out.println("  [Two-Step View] Step 2: Applying layout template");
        System.out.println("    Adding header, navigation, footer");
        System.out.println("    Applying CSS and branding");
    }
}

// ============= Scenario 3: Social Media =============

/**
 * Feed Controller (MVC)
 */
class FeedController {
    public void handleRequest(String path, Map<String, String> params) {
        String userId = params.get("userId");
        System.out.println("  [Controller] Loading feed for user: " + userId);
        System.out.println("  [Model] Fetching posts from database");
        System.out.println("  [Algorithm] Applying feed ranking");
        System.out.println("  [View] Rendering feed");
    }
}

/**
 * Create Post Page Controller
 */
class CreatePostPageController {
    public void handleRequest(Map<String, String> params) {
        String content = params.get("content");
        System.out.println("  [Page Controller] Creating post");
        System.out.println("  [Validation] Validating content");
        System.out.println("  [Database] Saving post: " + content);
        System.out.println("  [Timeline] Adding to user timeline");
    }
}

/**
 * Like Post Page Controller
 */
class LikePostPageController {
    public void handleRequest(Map<String, String> params) {
        String postId = params.get("postId");
        System.out.println("  [Page Controller] Liking post: " + postId);
        System.out.println("  [Database] Recording like");
        System.out.println("  [Notification] Notifying post author");
    }
}

/**
 * Comment Page Controller
 */
class CommentPageController {
    public void handleRequest(Map<String, String> params) {
        String postId = params.get("postId");
        String text = params.get("text");
        System.out.println("  [Page Controller] Adding comment to post: " + postId);
        System.out.println("  [Database] Saving comment: " + text);
        System.out.println("  [Notification] Notifying stakeholders");
    }
}

/**
 * Profile Template View
 */
class ProfileTemplateView {
    public void render(UserProfile profile) {
        System.out.println("  [Template View] Rendering profile page");
        System.out.println("  <div class='profile'>");
        System.out.println("    <h2>" + profile.name + "</h2>");
        System.out.println("    <p>Followers: " + profile.followers + "</p>");
        System.out.println("    <p>Following: " + profile.following + "</p>");
        System.out.println("  </div>");
    }
}

// ============= Scenario 4: Banking =============

/**
 * Banking Front Controller
 */
class BankingFrontController {
    public void handleRequest(String path, Map<String, String> params) {
        System.out.println("  [Banking Front Controller] Processing: " + path);
        System.out.println("  [Security] Enforcing SSL/TLS");
        System.out.println("  [Authentication] Validating session");
        System.out.println("  [Audit] Logging access");
    }
}

/**
 * Transaction Flow Controller
 */
class TransactionFlowController {
    private String currentState = "IDLE";

    public void handleCommand(String command) {
        System.out.println("  [Transaction Flow] Command: " + command);

        switch (command) {
            case "START_TRANSFER":
                currentState = "SELECT_ACCOUNTS";
                System.out.println("  → Showing account selection");
                break;
            case "SELECT_ACCOUNTS":
                currentState = "ENTER_AMOUNT";
                System.out.println("  → Showing amount entry");
                break;
            case "ENTER_AMOUNT":
                currentState = "VERIFY_OTP";
                System.out.println("  → Sending OTP for verification");
                break;
            case "VERIFY_OTP":
                currentState = "COMPLETE";
                System.out.println("  → Processing transfer");
                break;
            case "COMPLETE_TRANSFER":
                System.out.println("  → Transfer completed successfully");
                break;
        }
    }
}

/**
 * Banking Two-Step View
 */
class BankingTwoStepView {
    public void render(Map<String, Object> data, String viewType) {
        System.out.println("  [Banking Two-Step] Step 1: Format account data");
        System.out.println("    Account: " + data.get("accountNumber"));
        System.out.println("    Balance: " + data.get("balance"));
        System.out.println("  [Banking Two-Step] Step 2: Apply secure banking layout");
        System.out.println("    Adding security indicators");
        System.out.println("    Applying bank branding");
    }
}

// ============= Scenario 5: Healthcare =============

/**
 * Patient Dashboard Controller (MVC)
 */
class PatientDashboardController {
    public void handleRequest(String path, Map<String, String> params) {
        String patientId = params.get("patientId");
        System.out.println("  [Controller] Loading dashboard for patient: " + patientId);
        System.out.println("  [Model] Fetching appointments, prescriptions, records");
        System.out.println("  [HIPAA] Applying privacy controls");
        System.out.println("  [View] Rendering dashboard");
    }
}

/**
 * Appointment Flow Controller
 */
class AppointmentFlowController {
    private String currentState = "IDLE";

    public void handleCommand(String command) {
        System.out.println("  [Appointment Flow] Command: " + command);

        switch (command) {
            case "SELECT_DOCTOR":
                currentState = "CHOOSE_DATE";
                System.out.println("  → Showing available doctors");
                break;
            case "CHOOSE_DATE":
                currentState = "CONFIRM";
                System.out.println("  → Showing available time slots");
                break;
            case "CONFIRM_APPOINTMENT":
                currentState = "COMPLETE";
                System.out.println("  → Appointment booked successfully");
                break;
        }
    }
}

/**
 * Medical Records Template View
 */
class MedicalRecordsView {
    public void render(MedicalRecord record) {
        System.out.println("  [Template View] Rendering medical record (HIPAA compliant)");
        System.out.println("  <div class='medical-record' data-encrypted='true'>");
        System.out.println("    <p>Date: " + record.date + "</p>");
        System.out.println("    <p>Doctor: " + record.doctor + "</p>");
        System.out.println("    <p>Notes: " + record.notes + "</p>");
        System.out.println("  </div>");
    }
}

// ============= Scenario 6: Education =============

/**
 * Education Front Controller
 */
class EducationFrontController {
    public void handleRequest(String path, Map<String, String> params) {
        System.out.println("  [Education Front Controller] Processing: " + path);
        System.out.println("  [LMS] Loading learning management system");
        System.out.println("  [Progress] Tracking student progress");
    }
}

/**
 * Course Content Controller (MVC)
 */
class CourseContentController {
    public void handleRequest(String path, Map<String, String> params) {
        String courseId = params.get("courseId");
        String studentId = params.get("studentId");
        System.out.println("  [Controller] Loading course: " + courseId + " for student: " + studentId);
        System.out.println("  [Model] Fetching course materials");
        System.out.println("  [Progress] Updating course progress");
        System.out.println("  [View] Rendering course content");
    }
}

/**
 * Quiz Transform View
 */
class QuizTransformView {
    public void transform(Quiz quiz) {
        System.out.println("  [Transform View] Transforming quiz to interactive HTML");
        System.out.println("  Quiz: " + quiz.title);
        System.out.println("  Questions: " + quiz.questions.size());
        System.out.println("  → Generating interactive form elements");
        System.out.println("  → Adding JavaScript for validation");
    }
}

/**
 * Submit Assignment Page Controller
 */
class SubmitAssignmentPageController {
    public void handleRequest(Map<String, String> params) {
        String assignmentId = params.get("assignmentId");
        String file = params.get("file");
        System.out.println("  [Page Controller] Submitting assignment: " + assignmentId);
        System.out.println("  [Upload] Uploading file: " + file);
        System.out.println("  [Database] Recording submission");
        System.out.println("  [Notification] Notifying instructor");
    }
}

// ============= Scenario 7: Travel =============

/**
 * Travel Booking Flow Controller
 */
class TravelBookingFlowController {
    private String currentState = "IDLE";

    public void handleCommand(String command) {
        System.out.println("  [Booking Flow] Command: " + command + " (State: " + currentState + ")");

        switch (command) {
            case "SEARCH_FLIGHTS":
                currentState = "RESULTS";
                System.out.println("  → Showing flight search results");
                break;
            case "SELECT_FLIGHT":
                currentState = "PASSENGER_INFO";
                System.out.println("  → Collecting passenger information");
                break;
            case "PASSENGER_INFO":
                currentState = "PAYMENT";
                System.out.println("  → Processing payment");
                break;
            case "PAYMENT":
                currentState = "CONFIRMATION";
                System.out.println("  → Generating booking confirmation");
                break;
            case "CONFIRMATION":
                System.out.println("  → Booking complete!");
                break;
        }
    }
}

/**
 * Flight Results Template View
 */
class FlightResultsTemplateView {
    public void render(List<Flight> flights) {
        System.out.println("  [Template View] Rendering flight results");
        System.out.println("  <div class='flight-results'>");
        for (Flight flight : flights) {
            System.out.println("    <div class='flight'>");
            System.out.println("      Flight: " + flight.flightNumber);
            System.out.println("      Route: " + flight.origin + " → " + flight.destination);
            System.out.println("      Price: " + flight.price);
            System.out.println("    </div>");
        }
        System.out.println("  </div>");
    }
}

/**
 * Booking Two-Step View
 */
class BookingTwoStepView {
    public void render(Map<String, Object> data, String viewType) {
        System.out.println("  [Two-Step View] Step 1: Format booking data");
        System.out.println("    Booking ID: " + data.get("bookingId"));
        System.out.println("    Flight: " + data.get("flight"));
        System.out.println("    Passenger: " + data.get("passenger"));
        System.out.println("  [Two-Step View] Step 2: Apply travel portal layout");
        System.out.println("    Adding itinerary details");
        System.out.println("    Generating QR code for boarding pass");
    }
}

// ============= Scenario 8: Real Estate =============

/**
 * Property Search Controller (MVC)
 */
class PropertySearchController {
    public void handleRequest(String path, Map<String, String> params) {
        String city = params.get("city");
        String maxPrice = params.get("maxPrice");
        System.out.println("  [Controller] Searching properties in " + city + " under " + maxPrice);
        System.out.println("  [Model] Querying property database");
        System.out.println("  [View] Rendering search results");
    }
}

/**
 * Property Listing Template View
 */
class PropertyListingView {
    public void render(Property property) {
        System.out.println("  [Template View] Rendering property listing");
        System.out.println("  <div class='property-card'>");
        System.out.println("    <h3>" + property.address + "</h3>");
        System.out.println("    <p class='price'>" + property.price + "</p>");
        System.out.println("    <p class='details'>" + property.details + "</p>");
        System.out.println("  </div>");
    }
}

/**
 * Contact Agent Page Controller
 */
class ContactAgentPageController {
    public void handleRequest(Map<String, String> params) {
        String propertyId = params.get("propertyId");
        String name = params.get("name");
        System.out.println("  [Page Controller] Processing inquiry for property: " + propertyId);
        System.out.println("  [Database] Saving inquiry from " + name);
        System.out.println("  [Email] Notifying agent");
    }
}

/**
 * Virtual Tour Transform View
 */
class VirtualTourView {
    public void transform(PropertyTour tour) {
        System.out.println("  [Transform View] Creating virtual tour for property: " + tour.propertyId);
        System.out.println("  Rooms: " + tour.rooms);
        System.out.println("  → Generating 360° panoramic views");
        System.out.println("  → Adding interactive hotspots");
        System.out.println("  → Rendering 3D walkthrough");
    }
}

// ============= Scenario 9: Project Management =============

/**
 * Project Management Front Controller
 */
class ProjectManagementFrontController {
    public void handleRequest(String path, Map<String, String> params) {
        System.out.println("  [PM Front Controller] Routing: " + path);
        System.out.println("  [Auth] Validating user permissions");
        System.out.println("  [Context] Loading workspace context");
    }
}

/**
 * Task Board Controller (MVC)
 */
class TaskBoardController {
    public void handleRequest(String path, Map<String, String> params) {
        String projectId = params.get("projectId");
        System.out.println("  [Controller] Loading task board for project: " + projectId);
        System.out.println("  [Model] Fetching tasks (To Do, In Progress, Done)");
        System.out.println("  [View] Rendering Kanban board");
    }
}

/**
 * Gantt Chart Transform View
 */
class GanttChartView {
    public void transform(ProjectTimeline timeline) {
        System.out.println("  [Transform View] Generating Gantt chart for project: " + timeline.projectId);
        System.out.println("  Tasks: " + timeline.tasks.size());
        for (Task task : timeline.tasks) {
            System.out.println("    " + task.name + ": " + task.startDate + " → " + task.endDate);
        }
        System.out.println("  → Rendering timeline visualization");
        System.out.println("  → Adding dependencies and milestones");
    }
}

/**
 * Sprint Flow Controller
 */
class SprintFlowController {
    private String currentState = "IDLE";

    public void handleCommand(String command) {
        System.out.println("  [Sprint Flow] Command: " + command);

        switch (command) {
            case "CREATE_SPRINT":
                currentState = "CREATED";
                System.out.println("  → Sprint created, ready to add tasks");
                break;
            case "ADD_TASKS":
                currentState = "PLANNING";
                System.out.println("  → Adding tasks to sprint backlog");
                break;
            case "START_SPRINT":
                currentState = "ACTIVE";
                System.out.println("  → Sprint started!");
                break;
        }
    }
}

// ============= Scenario 10: Multi-Tenant SaaS =============

/**
 * Multi-Tenant Front Controller
 */
class MultiTenantFrontController {
    public void handleRequest(String path, Map<String, String> params) {
        String tenantId = params.get("tenantId");
        System.out.println("  [MT Front Controller] Tenant: " + tenantId + ", Path: " + path);
        System.out.println("  [Isolation] Loading tenant-specific context");
        System.out.println("  [Database] Using tenant-specific schema");
        System.out.println("  [Routing] Dispatching to tenant handler");
    }
}

/**
 * Onboarding Flow Controller
 */
class OnboardingFlowController {
    private String currentState = "IDLE";

    public void handleCommand(String command) {
        System.out.println("  [Onboarding Flow] Command: " + command);

        switch (command) {
            case "REGISTER_TENANT":
                currentState = "REGISTERED";
                System.out.println("  → Tenant registered, creating workspace");
                break;
            case "CONFIGURE_SETTINGS":
                currentState = "CONFIGURED";
                System.out.println("  → Configuring tenant settings");
                break;
            case "INVITE_USERS":
                currentState = "INVITING";
                System.out.println("  → Sending user invitations");
                break;
            case "COMPLETE_ONBOARDING":
                currentState = "COMPLETE";
                System.out.println("  → Onboarding complete, tenant activated!");
                break;
        }
    }
}

/**
 * Tenant Branded Two-Step View
 */
class TenantBrandedView {
    public void render(Map<String, Object> data, String viewType) {
        System.out.println("  [Branded Two-Step] Step 1: Format tenant-specific data");
        System.out.println("    Tenant: " + data.get("tenantId"));
        System.out.println("    Brand Color: " + data.get("brandColor"));
        System.out.println("    Logo: " + data.get("logo"));
        System.out.println("  [Branded Two-Step] Step 2: Apply custom branding");
        System.out.println("    Injecting tenant CSS");
        System.out.println("    Replacing logo and colors");
        System.out.println("    Applying custom domain");
    }
}

/**
 * Tenant Admin Controller (MVC)
 */
class TenantAdminController {
    public void handleRequest(String path, Map<String, String> params) {
        String tenantId = params.get("tenantId");
        System.out.println("  [Controller] Loading admin panel for tenant: " + tenantId);
        System.out.println("  [Model] Fetching tenant configuration and users");
        System.out.println("  [View] Rendering admin dashboard");
    }
}
