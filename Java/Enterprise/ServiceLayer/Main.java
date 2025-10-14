package Enterprise.ServiceLayer;

import java.util.*;
import java.math.BigDecimal;

/**
 * Service Layer Pattern Demonstration
 *
 * The Service Layer defines an application's boundary and establishes a set of available
 * operations from the perspective of interfacing client layers. It encapsulates the
 * application's business logic and coordinates responses in the implementation of its operations.
 *
 * Key Concepts:
 * - Defines application boundary with layer of services
 * - Encapsulates business logic and workflow
 * - Provides consistent interface to different clients
 * - Coordinates transactions and security
 * - Thin or thick implementation strategies
 *
 * Types:
 * 1. Domain Facade: Thin layer delegating to domain model
 * 2. Operation Script: Thick layer with business logic
 *
 * Advantages:
 * - Clear application boundary
 * - Consistent transaction management
 * - Easier to implement remote facades
 * - Centralized security and authorization
 * - Reusable across different presentation layers
 *
 * Disadvantages:
 * - Can become bloated with too much logic
 * - Risk of anemic domain model
 * - Potential duplication between layers
 *
 * Real-world use cases:
 * - Enterprise applications with multiple frontends
 * - Systems requiring transactional boundaries
 * - Applications with complex business workflows
 * - RESTful API implementations
 * - Microservices with well-defined boundaries
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Service Layer Pattern Demo ===\n");

        demonstrateDomainFacadeApproach();
        demonstrateOperationScriptApproach();
        demonstrateTransactionManagement();
        demonstrateSecurityIntegration();
        demonstrateErrorHandling();
        demonstrateServiceComposition();
        demonstrateRemoteFacade();
        demonstrateRealWorldScenarios();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates Domain Facade approach (thin service layer).
     */
    private static void demonstrateDomainFacadeApproach() {
        System.out.println("--- Domain Facade Approach ---");

        // Service layer delegates to rich domain model
        OrderService orderService = new OrderService();

        // Simple delegation to domain
        OrderDTO order = orderService.findOrder(1L);
        System.out.println("Order found: " + order.getId());

        // Service coordinates but domain handles logic
        orderService.updateOrderStatus(1L, "SHIPPED");
        System.out.println("Order status updated via thin service layer");

        // Multiple domain objects coordinated
        orderService.processRefund(1L);
        System.out.println("Refund processed with domain objects coordination");
    }

    /**
     * Demonstrates Operation Script approach (thick service layer).
     */
    private static void demonstrateOperationScriptApproach() {
        System.out.println("\n--- Operation Script Approach ---");

        // Service layer contains business logic
        CustomerService customerService = new CustomerService();

        // Complex workflow in service
        RegisterCustomerRequest request = new RegisterCustomerRequest();
        request.setName("John Doe");
        request.setEmail("john.doe@example.com");
        request.setPassword("SecurePass123!");

        RegisterCustomerResponse response = customerService.registerCustomer(request);
        System.out.println("Customer registered: " + response.getCustomerId());
        System.out.println("  Welcome email sent: " + response.isEmailSent());
        System.out.println("  Loyalty program enrolled: " + response.isLoyaltyEnrolled());

        // Service handles all coordination
        customerService.activateCustomer(response.getCustomerId(), "activation-token-123");
        System.out.println("Customer activated through thick service layer");
    }

    /**
     * Demonstrates transaction management at service layer.
     */
    private static void demonstrateTransactionManagement() {
        System.out.println("\n--- Transaction Management ---");

        OrderService orderService = new OrderService();

        // Service manages transaction boundary
        try {
            PlaceOrderRequest request = new PlaceOrderRequest();
            request.setCustomerId(1L);
            request.addItem(101L, 2, new BigDecimal("49.99"));
            request.addItem(102L, 1, new BigDecimal("99.99"));
            request.setShippingAddress("123 Main St");

            PlaceOrderResponse response = orderService.placeOrder(request);

            System.out.println("Order placed successfully:");
            System.out.println("  Order ID: " + response.getOrderId());
            System.out.println("  Total: $" + response.getTotal());
            System.out.println("  Transaction committed across:");
            System.out.println("    - Order creation");
            System.out.println("    - Inventory reservation");
            System.out.println("    - Payment processing");
            System.out.println("    - Shipping arrangement");

        } catch (ServiceException e) {
            System.out.println("Order failed, transaction rolled back: " + e.getMessage());
        }
    }

    /**
     * Demonstrates security integration at service boundary.
     */
    private static void demonstrateSecurityIntegration() {
        System.out.println("\n--- Security Integration ---");

        AdminService adminService = new AdminService();

        // Security context checked at service layer
        SecurityContext context = new SecurityContext("user@example.com", "USER");

        try {
            // User trying to access admin function
            adminService.deleteCustomer(1L, context);
            System.out.println("Customer deleted");
        } catch (UnauthorizedException e) {
            System.out.println("Access denied: " + e.getMessage());
        }

        // Admin access
        SecurityContext adminContext = new SecurityContext("admin@example.com", "ADMIN");
        try {
            adminService.deleteCustomer(1L, adminContext);
            System.out.println("Customer deleted by admin");
        } catch (UnauthorizedException e) {
            System.out.println("Access denied: " + e.getMessage());
        }

        // Permission-based access
        OrderService orderService = new OrderService();
        boolean canModify = orderService.canModifyOrder(1L, context);
        System.out.println("User can modify order: " + canModify);
    }

    /**
     * Demonstrates error handling at service layer.
     */
    private static void demonstrateErrorHandling() {
        System.out.println("\n--- Error Handling ---");

        ProductService productService = new ProductService();

        // Business rule violation
        try {
            CreateProductRequest request = new CreateProductRequest();
            request.setSku("INVALID");
            request.setName("Test Product");
            request.setPrice(new BigDecimal("-10.00")); // Invalid

            productService.createProduct(request);
        } catch (ValidationException e) {
            System.out.println("Validation error: " + e.getMessage());
            for (String error : e.getErrors()) {
                System.out.println("  - " + error);
            }
        }

        // Resource not found
        try {
            productService.updateProduct(99999L, new UpdateProductRequest());
        } catch (NotFoundException e) {
            System.out.println("Not found: " + e.getMessage());
        }

        // Concurrency conflict
        try {
            UpdateProductRequest update = new UpdateProductRequest();
            update.setVersion(1L); // Outdated version
            update.setPrice(new BigDecimal("99.99"));
            productService.updateProduct(1L, update);
        } catch (ConcurrencyException e) {
            System.out.println("Concurrency conflict: " + e.getMessage());
        }
    }

    /**
     * Demonstrates service composition.
     */
    private static void demonstrateServiceComposition() {
        System.out.println("\n--- Service Composition ---");

        // Higher-level service composes lower-level services
        OrderProcessingService processingService = new OrderProcessingService();

        ProcessOrderRequest request = new ProcessOrderRequest();
        request.setCustomerId(1L);
        request.setOrderId(1L);
        request.setPaymentMethod("CREDIT_CARD");

        ProcessOrderResult result = processingService.processOrderWorkflow(request);

        System.out.println("Order workflow processed:");
        System.out.println("  Services invoked:");
        for (String service : result.getServicesInvoked()) {
            System.out.println("    - " + service);
        }
        System.out.println("  Status: " + result.getStatus());
        System.out.println("  Duration: " + result.getDurationMs() + "ms");
    }

    /**
     * Demonstrates remote facade pattern with service layer.
     */
    private static void demonstrateRemoteFacade() {
        System.out.println("\n--- Remote Facade ---");

        // Service layer designed for remote access
        RemoteOrderService remoteService = new RemoteOrderService();

        // Coarse-grained interface reduces round trips
        OrderSummaryRequest summaryRequest = new OrderSummaryRequest();
        summaryRequest.setCustomerId(1L);
        summaryRequest.setStartDate(new Date());
        summaryRequest.setEndDate(new Date());
        summaryRequest.setIncludeItems(true);
        summaryRequest.setIncludePayments(true);
        summaryRequest.setIncludeShipping(true);

        OrderSummaryResponse summary = remoteService.getOrderSummary(summaryRequest);

        System.out.println("Remote service call completed:");
        System.out.println("  Orders: " + summary.getOrderCount());
        System.out.println("  Total value: $" + summary.getTotalValue());
        System.out.println("  Data transferred: " + summary.getPayloadSize() + " bytes");
        System.out.println("  Single round trip instead of multiple calls");
    }

    /**
     * Demonstrates real-world scenarios.
     */
    private static void demonstrateRealWorldScenarios() {
        System.out.println("\n--- Real-World Scenarios ---");

        System.out.println("\n1. E-commerce Checkout:");
        demonstrateCheckoutProcess();

        System.out.println("\n2. Account Management:");
        demonstrateAccountManagement();

        System.out.println("\n3. Inventory Management:");
        demonstrateInventoryManagement();

        System.out.println("\n4. Reporting Service:");
        demonstrateReportingService();

        System.out.println("\n5. Batch Processing:");
        demonstrateBatchProcessing();
    }

    private static void demonstrateCheckoutProcess() {
        CheckoutService checkoutService = new CheckoutService();

        CheckoutRequest request = new CheckoutRequest();
        request.setCartId("cart-123");
        request.setCustomerId(1L);
        request.setPaymentInfo(new PaymentInfo("4111111111111111", "12/25", "123"));
        request.setShippingAddress(new Address("123 Main St", "Anytown", "ST", "12345"));
        request.setBillingAddress(new Address("123 Main St", "Anytown", "ST", "12345"));
        request.setShippingMethod("STANDARD");

        CheckoutResult result = checkoutService.processCheckout(request);

        System.out.println("   Checkout completed:");
        System.out.println("     Order ID: " + result.getOrderId());
        System.out.println("     Confirmation: " + result.getConfirmationNumber());
        System.out.println("     Total charged: $" + result.getAmountCharged());
        System.out.println("     Estimated delivery: " + result.getEstimatedDelivery());
        System.out.println("     Steps completed:");
        System.out.println("       1. Cart validated");
        System.out.println("       2. Inventory reserved");
        System.out.println("       3. Payment processed");
        System.out.println("       4. Order created");
        System.out.println("       5. Shipment scheduled");
        System.out.println("       6. Confirmation email sent");
    }

    private static void demonstrateAccountManagement() {
        AccountService accountService = new AccountService();

        // Update account settings
        UpdateAccountRequest updateRequest = new UpdateAccountRequest();
        updateRequest.setCustomerId(1L);
        updateRequest.setEmail("newemail@example.com");
        updateRequest.setPhone("555-9876");
        updateRequest.setPreferences(Map.of(
            "newsletter", true,
            "sms_notifications", false,
            "marketing_emails", true
        ));

        accountService.updateAccountSettings(updateRequest);
        System.out.println("   Account settings updated");

        // Change password
        ChangePasswordRequest pwdRequest = new ChangePasswordRequest();
        pwdRequest.setCustomerId(1L);
        pwdRequest.setCurrentPassword("oldpass123");
        pwdRequest.setNewPassword("newpass456!");

        try {
            accountService.changePassword(pwdRequest);
            System.out.println("   Password changed successfully");
        } catch (ValidationException e) {
            System.out.println("   Password change failed: " + e.getMessage());
        }

        // Close account
        CloseAccountRequest closeRequest = new CloseAccountRequest();
        closeRequest.setCustomerId(1L);
        closeRequest.setReason("No longer needed");
        closeRequest.setFeedback("Great service!");

        CloseAccountResult closeResult = accountService.closeAccount(closeRequest);
        System.out.println("   Account closed:");
        System.out.println("     Final orders: " + closeResult.getFinalOrdersCount());
        System.out.println("     Refunds issued: " + closeResult.getRefundsIssued());
        System.out.println("     Data archived: " + closeResult.isDataArchived());
    }

    private static void demonstrateInventoryManagement() {
        InventoryService inventoryService = new InventoryService();

        // Check availability
        CheckAvailabilityRequest checkRequest = new CheckAvailabilityRequest();
        checkRequest.addProduct(101L, 5);
        checkRequest.addProduct(102L, 2);
        checkRequest.addProduct(103L, 10);

        CheckAvailabilityResponse checkResponse = inventoryService.checkAvailability(checkRequest);
        System.out.println("   Inventory check:");
        System.out.println("     All available: " + checkResponse.isAllAvailable());
        for (ProductAvailability avail : checkResponse.getAvailability()) {
            System.out.println("     Product " + avail.getProductId() + ": " +
                             avail.getAvailableQuantity() + " available");
        }

        // Reserve inventory
        ReserveInventoryRequest reserveRequest = new ReserveInventoryRequest();
        reserveRequest.setOrderId(1L);
        reserveRequest.addItem(101L, 5);
        reserveRequest.addItem(102L, 2);
        reserveRequest.setReservationMinutes(15);

        ReserveInventoryResponse reserveResponse = inventoryService.reserveInventory(reserveRequest);
        System.out.println("   Inventory reserved:");
        System.out.println("     Reservation ID: " + reserveResponse.getReservationId());
        System.out.println("     Expires at: " + reserveResponse.getExpiresAt());

        // Confirm reservation
        inventoryService.confirmReservation(reserveResponse.getReservationId());
        System.out.println("   Reservation confirmed");
    }

    private static void demonstrateReportingService() {
        ReportingService reportingService = new ReportingService();

        // Generate sales report
        GenerateReportRequest reportRequest = new GenerateReportRequest();
        reportRequest.setReportType("SALES_SUMMARY");
        reportRequest.setStartDate(new Date());
        reportRequest.setEndDate(new Date());
        reportRequest.setGroupBy("CATEGORY");
        reportRequest.setFormat("PDF");

        GenerateReportResponse reportResponse = reportingService.generateReport(reportRequest);
        System.out.println("   Sales report generated:");
        System.out.println("     Report ID: " + reportResponse.getReportId());
        System.out.println("     Status: " + reportResponse.getStatus());
        System.out.println("     Pages: " + reportResponse.getPageCount());
        System.out.println("     File size: " + reportResponse.getFileSizeKb() + " KB");
        System.out.println("     Download URL: " + reportResponse.getDownloadUrl());

        // Get report status
        ReportStatus status = reportingService.getReportStatus(reportResponse.getReportId());
        System.out.println("   Report status: " + status.getStatus());
        System.out.println("   Progress: " + status.getProgressPercent() + "%");
    }

    private static void demonstrateBatchProcessing() {
        BatchProcessingService batchService = new BatchProcessingService();

        // Submit batch job
        BatchJobRequest jobRequest = new BatchJobRequest();
        jobRequest.setJobType("CUSTOMER_EXPORT");
        jobRequest.setParameters(Map.of(
            "format", "CSV",
            "includeOrders", true,
            "dateRange", "LAST_30_DAYS"
        ));
        jobRequest.setPriority("NORMAL");

        BatchJobResponse jobResponse = batchService.submitBatchJob(jobRequest);
        System.out.println("   Batch job submitted:");
        System.out.println("     Job ID: " + jobResponse.getJobId());
        System.out.println("     Status: " + jobResponse.getStatus());
        System.out.println("     Estimated completion: " + jobResponse.getEstimatedCompletion());

        // Monitor job progress
        BatchJobStatus jobStatus = batchService.getBatchJobStatus(jobResponse.getJobId());
        System.out.println("   Job progress:");
        System.out.println("     Status: " + jobStatus.getStatus());
        System.out.println("     Processed: " + jobStatus.getProcessedRecords() + "/" +
                         jobStatus.getTotalRecords());
        System.out.println("     Errors: " + jobStatus.getErrorCount());

        // Complete job
        if (jobStatus.isComplete()) {
            BatchJobResult result = batchService.getBatchJobResult(jobResponse.getJobId());
            System.out.println("   Job completed:");
            System.out.println("     Duration: " + result.getDurationSeconds() + "s");
            System.out.println("     Output file: " + result.getOutputFile());
            System.out.println("     Records processed: " + result.getProcessedCount());
        }
    }
}
