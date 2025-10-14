package Enterprise.PageController;

import java.util.*;

/**
 * PageController Pattern Demonstration
 *
 * Intent: Each page or action has its own controller object that handles
 * the request for that specific page. Unlike Front Controller which centralizes
 * all requests, Page Controller distributes request handling across multiple
 * controller objects, each responsible for a specific page or action.
 *
 * This pattern is particularly useful when:
 * - Each page has unique logic and doesn't share much common processing
 * - You want simple, straightforward request handling
 * - Pages are relatively independent from each other
 * - You need clear separation of concerns per page
 * - Building simple web applications or REST APIs
 *
 * Real-world examples:
 * - Blog post pages (view, create, edit, delete)
 * - Product catalog pages
 * - User profile management
 * - Form submission handlers
 * - RESTful API endpoints
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PageController Pattern Demo ===\n");

        // Scenario 1: Blog Management System
        demonstrateBlogManagement();

        // Scenario 2: E-commerce Product Management
        demonstrateProductManagement();

        // Scenario 3: User Profile Management
        demonstrateUserProfileManagement();

        // Scenario 4: Order Processing
        demonstrateOrderProcessing();

        // Scenario 5: Invoice Management
        demonstrateInvoiceManagement();

        // Scenario 6: Task Management System
        demonstrateTaskManagement();

        // Scenario 7: Event Registration
        demonstrateEventRegistration();

        // Scenario 8: Course Enrollment
        demonstrateCourseEnrollment();

        // Scenario 9: Hotel Booking
        demonstrateHotelBooking();

        // Scenario 10: Survey Management
        demonstrateSurveyManagement();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Blog management with separate page controllers
     */
    private static void demonstrateBlogManagement() {
        System.out.println("--- Scenario 1: Blog Management System ---");

        // View blog posts
        ViewBlogPostController viewController = new ViewBlogPostController();
        viewController.handleRequest(createRequest("id", "123"));

        // Create new blog post
        CreateBlogPostController createController = new CreateBlogPostController();
        createController.handleRequest(createRequest("title", "Design Patterns", "content", "Article content..."));

        // Edit existing blog post
        EditBlogPostController editController = new EditBlogPostController();
        editController.handleRequest(createRequest("id", "123", "title", "Updated Title"));

        // Delete blog post
        DeleteBlogPostController deleteController = new DeleteBlogPostController();
        deleteController.handleRequest(createRequest("id", "123"));

        System.out.println();
    }

    /**
     * Scenario 2: E-commerce product management
     */
    private static void demonstrateProductManagement() {
        System.out.println("--- Scenario 2: Product Management ---");

        // List products
        ListProductsController listController = new ListProductsController();
        listController.handleRequest(createRequest("category", "Electronics", "page", "1"));

        // View product details
        ViewProductController viewController = new ViewProductController();
        viewController.handleRequest(createRequest("productId", "PROD-456"));

        // Add product to cart
        AddToCartController cartController = new AddToCartController();
        cartController.handleRequest(createRequest("productId", "PROD-456", "quantity", "2"));

        // Update product inventory
        UpdateInventoryController inventoryController = new UpdateInventoryController();
        inventoryController.handleRequest(createRequest("productId", "PROD-456", "quantity", "100"));

        System.out.println();
    }

    /**
     * Scenario 3: User profile management
     */
    private static void demonstrateUserProfileManagement() {
        System.out.println("--- Scenario 3: User Profile Management ---");

        // View profile
        ViewProfileController viewProfile = new ViewProfileController();
        viewProfile.handleRequest(createRequest("userId", "USER-789"));

        // Update profile
        UpdateProfileController updateProfile = new UpdateProfileController();
        updateProfile.handleRequest(createRequest("userId", "USER-789", "name", "John Doe", "email", "john@example.com"));

        // Change password
        ChangePasswordController changePassword = new ChangePasswordController();
        changePassword.handleRequest(createRequest("userId", "USER-789", "oldPassword", "old123", "newPassword", "new456"));

        // Upload profile picture
        UploadProfilePictureController uploadPicture = new UploadProfilePictureController();
        uploadPicture.handleRequest(createRequest("userId", "USER-789", "file", "profile.jpg"));

        System.out.println();
    }

    /**
     * Scenario 4: Order processing
     */
    private static void demonstrateOrderProcessing() {
        System.out.println("--- Scenario 4: Order Processing ---");

        // Create order
        CreateOrderController createOrder = new CreateOrderController();
        createOrder.handleRequest(createRequest("cartId", "CART-001", "customerId", "CUST-123"));

        // View order details
        ViewOrderController viewOrder = new ViewOrderController();
        viewOrder.handleRequest(createRequest("orderId", "ORD-555"));

        // Process payment
        ProcessPaymentController processPayment = new ProcessPaymentController();
        processPayment.handleRequest(createRequest("orderId", "ORD-555", "amount", "299.99", "paymentMethod", "CREDIT_CARD"));

        // Ship order
        ShipOrderController shipOrder = new ShipOrderController();
        shipOrder.handleRequest(createRequest("orderId", "ORD-555", "carrier", "UPS", "trackingNumber", "1Z999AA1"));

        System.out.println();
    }

    /**
     * Scenario 5: Invoice management
     */
    private static void demonstrateInvoiceManagement() {
        System.out.println("--- Scenario 5: Invoice Management ---");

        // Generate invoice
        GenerateInvoiceController generateInvoice = new GenerateInvoiceController();
        generateInvoice.handleRequest(createRequest("orderId", "ORD-555", "customerId", "CUST-123"));

        // View invoice
        ViewInvoiceController viewInvoice = new ViewInvoiceController();
        viewInvoice.handleRequest(createRequest("invoiceId", "INV-777"));

        // Send invoice email
        SendInvoiceController sendInvoice = new SendInvoiceController();
        sendInvoice.handleRequest(createRequest("invoiceId", "INV-777", "email", "customer@example.com"));

        // Download invoice PDF
        DownloadInvoiceController downloadInvoice = new DownloadInvoiceController();
        downloadInvoice.handleRequest(createRequest("invoiceId", "INV-777", "format", "PDF"));

        System.out.println();
    }

    /**
     * Scenario 6: Task management system
     */
    private static void demonstrateTaskManagement() {
        System.out.println("--- Scenario 6: Task Management ---");

        // Create task
        CreateTaskController createTask = new CreateTaskController();
        createTask.handleRequest(createRequest("title", "Implement feature", "priority", "HIGH", "assignee", "USER-789"));

        // Update task status
        UpdateTaskStatusController updateStatus = new UpdateTaskStatusController();
        updateStatus.handleRequest(createRequest("taskId", "TASK-111", "status", "IN_PROGRESS"));

        // Assign task
        AssignTaskController assignTask = new AssignTaskController();
        assignTask.handleRequest(createRequest("taskId", "TASK-111", "assignee", "USER-999"));

        // Complete task
        CompleteTaskController completeTask = new CompleteTaskController();
        completeTask.handleRequest(createRequest("taskId", "TASK-111", "comment", "Feature implemented successfully"));

        System.out.println();
    }

    /**
     * Scenario 7: Event registration
     */
    private static void demonstrateEventRegistration() {
        System.out.println("--- Scenario 7: Event Registration ---");

        // Browse events
        BrowseEventsController browseEvents = new BrowseEventsController();
        browseEvents.handleRequest(createRequest("category", "Technology", "location", "San Francisco"));

        // View event details
        ViewEventController viewEvent = new ViewEventController();
        viewEvent.handleRequest(createRequest("eventId", "EVENT-222"));

        // Register for event
        RegisterEventController registerEvent = new RegisterEventController();
        registerEvent.handleRequest(createRequest("eventId", "EVENT-222", "userId", "USER-789", "ticketType", "VIP"));

        // Cancel registration
        CancelRegistrationController cancelRegistration = new CancelRegistrationController();
        cancelRegistration.handleRequest(createRequest("registrationId", "REG-333"));

        System.out.println();
    }

    /**
     * Scenario 8: Course enrollment
     */
    private static void demonstrateCourseEnrollment() {
        System.out.println("--- Scenario 8: Course Enrollment ---");

        // Browse courses
        BrowseCoursesController browseCourses = new BrowseCoursesController();
        browseCourses.handleRequest(createRequest("subject", "Computer Science", "level", "Advanced"));

        // View course details
        ViewCourseController viewCourse = new ViewCourseController();
        viewCourse.handleRequest(createRequest("courseId", "COURSE-444"));

        // Enroll in course
        EnrollCourseController enrollCourse = new EnrollCourseController();
        enrollCourse.handleRequest(createRequest("courseId", "COURSE-444", "studentId", "STU-555"));

        // Submit assignment
        SubmitAssignmentController submitAssignment = new SubmitAssignmentController();
        submitAssignment.handleRequest(createRequest("courseId", "COURSE-444", "assignmentId", "ASSGN-666", "submission", "assignment.pdf"));

        System.out.println();
    }

    /**
     * Scenario 9: Hotel booking
     */
    private static void demonstrateHotelBooking() {
        System.out.println("--- Scenario 9: Hotel Booking ---");

        // Search hotels
        SearchHotelsController searchHotels = new SearchHotelsController();
        searchHotels.handleRequest(createRequest("city", "New York", "checkIn", "2024-12-20", "checkOut", "2024-12-23"));

        // View hotel details
        ViewHotelController viewHotel = new ViewHotelController();
        viewHotel.handleRequest(createRequest("hotelId", "HOTEL-888"));

        // Book room
        BookRoomController bookRoom = new BookRoomController();
        bookRoom.handleRequest(createRequest("hotelId", "HOTEL-888", "roomType", "SUITE", "guestName", "Jane Smith"));

        // Modify booking
        ModifyBookingController modifyBooking = new ModifyBookingController();
        modifyBooking.handleRequest(createRequest("bookingId", "BOOK-999", "checkOut", "2024-12-25"));

        System.out.println();
    }

    /**
     * Scenario 10: Survey management
     */
    private static void demonstrateSurveyManagement() {
        System.out.println("--- Scenario 10: Survey Management ---");

        // Create survey
        CreateSurveyController createSurvey = new CreateSurveyController();
        createSurvey.handleRequest(createRequest("title", "Customer Satisfaction", "questions", "5"));

        // View survey
        ViewSurveyController viewSurvey = new ViewSurveyController();
        viewSurvey.handleRequest(createRequest("surveyId", "SURV-100"));

        // Submit response
        SubmitSurveyResponseController submitResponse = new SubmitSurveyResponseController();
        submitResponse.handleRequest(createRequest("surveyId", "SURV-100", "userId", "USER-789", "responses", "..."));

        // View results
        ViewSurveyResultsController viewResults = new ViewSurveyResultsController();
        viewResults.handleRequest(createRequest("surveyId", "SURV-100"));

        System.out.println();
    }

    // Helper method to create request parameters
    private static Map<String, String> createRequest(String... keyValues) {
        Map<String, String> request = new HashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            request.put(keyValues[i], keyValues[i + 1]);
        }
        return request;
    }
}

// ============= Base Page Controller =============

/**
 * Base interface for all page controllers
 */
interface PageController {
    void handleRequest(Map<String, String> params);
}

// ============= Scenario 1: Blog Management =============

/**
 * Controller for viewing a blog post
 */
class ViewBlogPostController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String postId = params.get("id");
        System.out.println("→ ViewBlogPost: Fetching post " + postId);
        System.out.println("  [Database] Loading blog post...");
        System.out.println("  [View] Rendering blog post page");
        System.out.println("  ✓ Blog post displayed");
    }
}

/**
 * Controller for creating a new blog post
 */
class CreateBlogPostController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String title = params.get("title");
        String content = params.get("content");
        System.out.println("→ CreateBlogPost: Creating new post");
        System.out.println("  Title: " + title);
        System.out.println("  [Validation] Checking required fields...");
        System.out.println("  [Database] Saving blog post...");
        System.out.println("  [Notification] Notifying subscribers...");
        System.out.println("  ✓ Blog post created successfully");
    }
}

/**
 * Controller for editing a blog post
 */
class EditBlogPostController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String postId = params.get("id");
        String newTitle = params.get("title");
        System.out.println("→ EditBlogPost: Editing post " + postId);
        System.out.println("  New title: " + newTitle);
        System.out.println("  [Database] Updating blog post...");
        System.out.println("  [Cache] Invalidating cache...");
        System.out.println("  ✓ Blog post updated");
    }
}

/**
 * Controller for deleting a blog post
 */
class DeleteBlogPostController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String postId = params.get("id");
        System.out.println("→ DeleteBlogPost: Deleting post " + postId);
        System.out.println("  [Authorization] Checking permissions...");
        System.out.println("  [Database] Deleting blog post...");
        System.out.println("  [Cleanup] Removing associated files...");
        System.out.println("  ✓ Blog post deleted");
    }
}

// ============= Scenario 2: Product Management =============

class ListProductsController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String category = params.get("category");
        String page = params.get("page");
        System.out.println("→ ListProducts: Category=" + category + ", Page=" + page);
        System.out.println("  [Database] Fetching products...");
        System.out.println("  [View] Rendering product list (20 items)");
        System.out.println("  ✓ Products displayed");
    }
}

class ViewProductController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String productId = params.get("productId");
        System.out.println("→ ViewProduct: " + productId);
        System.out.println("  [Database] Loading product details...");
        System.out.println("  [Analytics] Tracking product view...");
        System.out.println("  [View] Rendering product page");
        System.out.println("  ✓ Product details displayed");
    }
}

class AddToCartController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String productId = params.get("productId");
        String quantity = params.get("quantity");
        System.out.println("→ AddToCart: Product=" + productId + ", Qty=" + quantity);
        System.out.println("  [Session] Getting cart from session...");
        System.out.println("  [Validation] Checking stock availability...");
        System.out.println("  [Cart] Adding " + quantity + " items to cart");
        System.out.println("  ✓ Product added to cart");
    }
}

class UpdateInventoryController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String productId = params.get("productId");
        String quantity = params.get("quantity");
        System.out.println("→ UpdateInventory: Product=" + productId + ", New Qty=" + quantity);
        System.out.println("  [Authorization] Verifying admin rights...");
        System.out.println("  [Database] Updating inventory levels...");
        System.out.println("  [Notification] Alerting warehouse...");
        System.out.println("  ✓ Inventory updated");
    }
}

// ============= Scenario 3: User Profile Management =============

class ViewProfileController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String userId = params.get("userId");
        System.out.println("→ ViewProfile: User " + userId);
        System.out.println("  [Database] Loading user profile...");
        System.out.println("  [Privacy] Applying privacy settings...");
        System.out.println("  [View] Rendering profile page");
        System.out.println("  ✓ Profile displayed");
    }
}

class UpdateProfileController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String userId = params.get("userId");
        String name = params.get("name");
        String email = params.get("email");
        System.out.println("→ UpdateProfile: User " + userId);
        System.out.println("  Name: " + name + ", Email: " + email);
        System.out.println("  [Validation] Validating email format...");
        System.out.println("  [Database] Updating profile...");
        System.out.println("  ✓ Profile updated successfully");
    }
}

class ChangePasswordController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String userId = params.get("userId");
        System.out.println("→ ChangePassword: User " + userId);
        System.out.println("  [Security] Verifying old password...");
        System.out.println("  [Validation] Checking password strength...");
        System.out.println("  [Security] Hashing new password...");
        System.out.println("  [Database] Updating password...");
        System.out.println("  [Notification] Sending confirmation email...");
        System.out.println("  ✓ Password changed successfully");
    }
}

class UploadProfilePictureController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String userId = params.get("userId");
        String file = params.get("file");
        System.out.println("→ UploadProfilePicture: User " + userId);
        System.out.println("  File: " + file);
        System.out.println("  [Validation] Checking file type and size...");
        System.out.println("  [Storage] Uploading to cloud storage...");
        System.out.println("  [Image] Generating thumbnails...");
        System.out.println("  [Database] Updating profile picture URL...");
        System.out.println("  ✓ Profile picture uploaded");
    }
}

// ============= Scenario 4: Order Processing =============

class CreateOrderController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String cartId = params.get("cartId");
        String customerId = params.get("customerId");
        System.out.println("→ CreateOrder: Cart=" + cartId + ", Customer=" + customerId);
        System.out.println("  [Cart] Loading cart items...");
        System.out.println("  [Inventory] Reserving stock...");
        System.out.println("  [Database] Creating order...");
        System.out.println("  [Notification] Sending confirmation email...");
        System.out.println("  ✓ Order created: ORD-555");
    }
}

class ViewOrderController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String orderId = params.get("orderId");
        System.out.println("→ ViewOrder: " + orderId);
        System.out.println("  [Database] Loading order details...");
        System.out.println("  [Shipping] Fetching tracking information...");
        System.out.println("  [View] Rendering order page");
        System.out.println("  ✓ Order details displayed");
    }
}

class ProcessPaymentController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String orderId = params.get("orderId");
        String amount = params.get("amount");
        String method = params.get("paymentMethod");
        System.out.println("→ ProcessPayment: Order=" + orderId + ", Amount=$" + amount);
        System.out.println("  Method: " + method);
        System.out.println("  [Validation] Validating payment details...");
        System.out.println("  [Gateway] Processing payment...");
        System.out.println("  [Database] Updating order status...");
        System.out.println("  ✓ Payment processed successfully");
    }
}

class ShipOrderController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String orderId = params.get("orderId");
        String carrier = params.get("carrier");
        String trackingNumber = params.get("trackingNumber");
        System.out.println("→ ShipOrder: " + orderId);
        System.out.println("  Carrier: " + carrier + ", Tracking: " + trackingNumber);
        System.out.println("  [Database] Updating shipping information...");
        System.out.println("  [Notification] Sending shipping notification...");
        System.out.println("  ✓ Order shipped");
    }
}

// ============= Scenario 5: Invoice Management =============

class GenerateInvoiceController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String orderId = params.get("orderId");
        String customerId = params.get("customerId");
        System.out.println("→ GenerateInvoice: Order=" + orderId);
        System.out.println("  [Database] Loading order data...");
        System.out.println("  [Calculation] Computing taxes and totals...");
        System.out.println("  [PDF] Generating invoice document...");
        System.out.println("  [Database] Saving invoice...");
        System.out.println("  ✓ Invoice generated: INV-777");
    }
}

class ViewInvoiceController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String invoiceId = params.get("invoiceId");
        System.out.println("→ ViewInvoice: " + invoiceId);
        System.out.println("  [Database] Loading invoice...");
        System.out.println("  [View] Rendering invoice page");
        System.out.println("  ✓ Invoice displayed");
    }
}

class SendInvoiceController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String invoiceId = params.get("invoiceId");
        String email = params.get("email");
        System.out.println("→ SendInvoice: " + invoiceId + " to " + email);
        System.out.println("  [Database] Loading invoice...");
        System.out.println("  [Email] Preparing email with PDF attachment...");
        System.out.println("  [SMTP] Sending email...");
        System.out.println("  ✓ Invoice sent successfully");
    }
}

class DownloadInvoiceController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String invoiceId = params.get("invoiceId");
        String format = params.get("format");
        System.out.println("→ DownloadInvoice: " + invoiceId + " as " + format);
        System.out.println("  [Database] Loading invoice data...");
        System.out.println("  [PDF] Generating " + format + " document...");
        System.out.println("  [Response] Setting download headers...");
        System.out.println("  ✓ Invoice download started");
    }
}

// ============= Scenario 6: Task Management =============

class CreateTaskController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String title = params.get("title");
        String priority = params.get("priority");
        String assignee = params.get("assignee");
        System.out.println("→ CreateTask: " + title);
        System.out.println("  Priority: " + priority + ", Assignee: " + assignee);
        System.out.println("  [Validation] Validating task details...");
        System.out.println("  [Database] Creating task...");
        System.out.println("  [Notification] Notifying assignee...");
        System.out.println("  ✓ Task created: TASK-111");
    }
}

class UpdateTaskStatusController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String taskId = params.get("taskId");
        String status = params.get("status");
        System.out.println("→ UpdateTaskStatus: " + taskId + " → " + status);
        System.out.println("  [Database] Updating task status...");
        System.out.println("  [Timeline] Adding status change to history...");
        System.out.println("  ✓ Task status updated");
    }
}

class AssignTaskController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String taskId = params.get("taskId");
        String assignee = params.get("assignee");
        System.out.println("→ AssignTask: " + taskId + " to " + assignee);
        System.out.println("  [Database] Updating task assignment...");
        System.out.println("  [Notification] Notifying new assignee...");
        System.out.println("  ✓ Task assigned");
    }
}

class CompleteTaskController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String taskId = params.get("taskId");
        String comment = params.get("comment");
        System.out.println("→ CompleteTask: " + taskId);
        System.out.println("  Comment: " + comment);
        System.out.println("  [Database] Marking task as complete...");
        System.out.println("  [Metrics] Updating project metrics...");
        System.out.println("  [Notification] Notifying stakeholders...");
        System.out.println("  ✓ Task completed");
    }
}

// ============= Scenario 7: Event Registration =============

class BrowseEventsController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String category = params.get("category");
        String location = params.get("location");
        System.out.println("→ BrowseEvents: Category=" + category + ", Location=" + location);
        System.out.println("  [Database] Searching events...");
        System.out.println("  [View] Displaying 15 upcoming events");
        System.out.println("  ✓ Events displayed");
    }
}

class ViewEventController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String eventId = params.get("eventId");
        System.out.println("→ ViewEvent: " + eventId);
        System.out.println("  [Database] Loading event details...");
        System.out.println("  [Availability] Checking ticket availability...");
        System.out.println("  [View] Rendering event page");
        System.out.println("  ✓ Event details displayed");
    }
}

class RegisterEventController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String eventId = params.get("eventId");
        String userId = params.get("userId");
        String ticketType = params.get("ticketType");
        System.out.println("→ RegisterEvent: Event=" + eventId + ", User=" + userId);
        System.out.println("  Ticket Type: " + ticketType);
        System.out.println("  [Availability] Checking seat availability...");
        System.out.println("  [Database] Creating registration...");
        System.out.println("  [Payment] Processing payment...");
        System.out.println("  [Email] Sending confirmation and ticket...");
        System.out.println("  ✓ Registration complete: REG-333");
    }
}

class CancelRegistrationController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String registrationId = params.get("registrationId");
        System.out.println("→ CancelRegistration: " + registrationId);
        System.out.println("  [Database] Loading registration...");
        System.out.println("  [Refund] Processing refund...");
        System.out.println("  [Database] Canceling registration...");
        System.out.println("  [Email] Sending cancellation confirmation...");
        System.out.println("  ✓ Registration canceled");
    }
}

// ============= Scenario 8: Course Enrollment =============

class BrowseCoursesController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String subject = params.get("subject");
        String level = params.get("level");
        System.out.println("→ BrowseCourses: Subject=" + subject + ", Level=" + level);
        System.out.println("  [Database] Searching courses...");
        System.out.println("  [View] Displaying 12 courses");
        System.out.println("  ✓ Courses displayed");
    }
}

class ViewCourseController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String courseId = params.get("courseId");
        System.out.println("→ ViewCourse: " + courseId);
        System.out.println("  [Database] Loading course details...");
        System.out.println("  [Enrollment] Checking seat availability...");
        System.out.println("  [View] Rendering course page");
        System.out.println("  ✓ Course details displayed");
    }
}

class EnrollCourseController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String courseId = params.get("courseId");
        String studentId = params.get("studentId");
        System.out.println("→ EnrollCourse: Course=" + courseId + ", Student=" + studentId);
        System.out.println("  [Prerequisites] Checking prerequisites...");
        System.out.println("  [Database] Creating enrollment...");
        System.out.println("  [LMS] Granting course access...");
        System.out.println("  [Email] Sending welcome email...");
        System.out.println("  ✓ Enrollment successful");
    }
}

class SubmitAssignmentController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String courseId = params.get("courseId");
        String assignmentId = params.get("assignmentId");
        String submission = params.get("submission");
        System.out.println("→ SubmitAssignment: Course=" + courseId + ", Assignment=" + assignmentId);
        System.out.println("  File: " + submission);
        System.out.println("  [Validation] Checking submission deadline...");
        System.out.println("  [Storage] Uploading submission...");
        System.out.println("  [Database] Recording submission...");
        System.out.println("  [Notification] Notifying instructor...");
        System.out.println("  ✓ Assignment submitted");
    }
}

// ============= Scenario 9: Hotel Booking =============

class SearchHotelsController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String city = params.get("city");
        String checkIn = params.get("checkIn");
        String checkOut = params.get("checkOut");
        System.out.println("→ SearchHotels: " + city + " (" + checkIn + " to " + checkOut + ")");
        System.out.println("  [Database] Searching available hotels...");
        System.out.println("  [Availability] Checking room availability...");
        System.out.println("  [View] Displaying 25 hotels");
        System.out.println("  ✓ Search results displayed");
    }
}

class ViewHotelController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String hotelId = params.get("hotelId");
        System.out.println("→ ViewHotel: " + hotelId);
        System.out.println("  [Database] Loading hotel details...");
        System.out.println("  [Reviews] Loading guest reviews...");
        System.out.println("  [Photos] Loading hotel photos...");
        System.out.println("  [View] Rendering hotel page");
        System.out.println("  ✓ Hotel details displayed");
    }
}

class BookRoomController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String hotelId = params.get("hotelId");
        String roomType = params.get("roomType");
        String guestName = params.get("guestName");
        System.out.println("→ BookRoom: Hotel=" + hotelId + ", Room=" + roomType);
        System.out.println("  Guest: " + guestName);
        System.out.println("  [Availability] Confirming room availability...");
        System.out.println("  [Database] Creating booking...");
        System.out.println("  [Payment] Processing payment...");
        System.out.println("  [Email] Sending confirmation...");
        System.out.println("  ✓ Booking confirmed: BOOK-999");
    }
}

class ModifyBookingController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String bookingId = params.get("bookingId");
        String newCheckOut = params.get("checkOut");
        System.out.println("→ ModifyBooking: " + bookingId);
        System.out.println("  New checkout: " + newCheckOut);
        System.out.println("  [Database] Loading booking...");
        System.out.println("  [Availability] Checking new dates...");
        System.out.println("  [Database] Updating booking...");
        System.out.println("  [Email] Sending modification confirmation...");
        System.out.println("  ✓ Booking modified");
    }
}

// ============= Scenario 10: Survey Management =============

class CreateSurveyController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String title = params.get("title");
        String questions = params.get("questions");
        System.out.println("→ CreateSurvey: " + title);
        System.out.println("  Questions: " + questions);
        System.out.println("  [Validation] Validating survey structure...");
        System.out.println("  [Database] Creating survey...");
        System.out.println("  [Link] Generating survey link...");
        System.out.println("  ✓ Survey created: SURV-100");
    }
}

class ViewSurveyController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String surveyId = params.get("surveyId");
        System.out.println("→ ViewSurvey: " + surveyId);
        System.out.println("  [Database] Loading survey questions...");
        System.out.println("  [View] Rendering survey form");
        System.out.println("  ✓ Survey displayed");
    }
}

class SubmitSurveyResponseController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String surveyId = params.get("surveyId");
        String userId = params.get("userId");
        System.out.println("→ SubmitSurveyResponse: Survey=" + surveyId + ", User=" + userId);
        System.out.println("  [Validation] Validating responses...");
        System.out.println("  [Database] Saving responses...");
        System.out.println("  [Analytics] Updating survey statistics...");
        System.out.println("  ✓ Response submitted");
    }
}

class ViewSurveyResultsController implements PageController {
    public void handleRequest(Map<String, String> params) {
        String surveyId = params.get("surveyId");
        System.out.println("→ ViewSurveyResults: " + surveyId);
        System.out.println("  [Database] Loading all responses...");
        System.out.println("  [Analytics] Calculating statistics...");
        System.out.println("  [Charts] Generating visualization...");
        System.out.println("  [View] Rendering results page");
        System.out.println("  ✓ Survey results displayed");
    }
}
