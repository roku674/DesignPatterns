package Enterprise.ApplicationController;

import java.util.*;
import java.util.function.Consumer;

/**
 * ApplicationController Pattern Demonstration
 *
 * Intent: Centralizes retrieval and invocation of request-processing components,
 * handling view management and navigation logic in a single location.
 *
 * This pattern is particularly useful in web applications where you need to:
 * - Centralize navigation logic
 * - Manage complex workflow flows
 * - Separate presentation from application flow
 * - Handle command dispatching and routing
 *
 * Real-world examples:
 * - E-commerce checkout processes
 * - Multi-step form wizards
 * - Complex approval workflows
 * - Document processing pipelines
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ApplicationController Pattern Demo ===\n");

        // Scenario 1: E-commerce Order Processing
        demonstrateEcommerceCheckout();

        // Scenario 2: Multi-step Registration Wizard
        demonstrateRegistrationWizard();

        // Scenario 3: Document Approval Workflow
        demonstrateApprovalWorkflow();

        // Scenario 4: Banking Transaction Processing
        demonstrateBankingTransactions();

        // Scenario 5: Customer Support Ticket System
        demonstrateSupportTicketSystem();

        // Scenario 6: Insurance Claim Processing
        demonstrateInsuranceClaims();

        // Scenario 7: Hotel Booking System
        demonstrateHotelBooking();

        // Scenario 8: Employee Onboarding Process
        demonstrateEmployeeOnboarding();

        // Scenario 9: Healthcare Patient Intake
        demonstratePatientIntake();

        // Scenario 10: Loan Application Processing
        demonstrateLoanApplication();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: E-commerce checkout with multiple steps
     */
    private static void demonstrateEcommerceCheckout() {
        System.out.println("--- Scenario 1: E-commerce Checkout ---");

        EcommerceController controller = new EcommerceController();
        CheckoutSession session = new CheckoutSession();

        session.addItem("Laptop", 999.99);
        session.addItem("Mouse", 29.99);

        controller.processCommand("VIEW_CART", session);
        controller.processCommand("ENTER_SHIPPING", session);
        controller.processCommand("SELECT_PAYMENT", session);
        controller.processCommand("REVIEW_ORDER", session);
        controller.processCommand("PLACE_ORDER", session);

        System.out.println();
    }

    /**
     * Scenario 2: Multi-step user registration wizard
     */
    private static void demonstrateRegistrationWizard() {
        System.out.println("--- Scenario 2: Registration Wizard ---");

        RegistrationController controller = new RegistrationController();
        RegistrationSession session = new RegistrationSession();

        controller.processCommand("START_REGISTRATION", session);
        session.setBasicInfo("john.doe@example.com", "password123");
        controller.processCommand("SUBMIT_BASIC_INFO", session);

        session.setProfileInfo("John Doe", "Software Engineer");
        controller.processCommand("SUBMIT_PROFILE", session);

        session.setPreferences("daily", true);
        controller.processCommand("SUBMIT_PREFERENCES", session);

        controller.processCommand("COMPLETE_REGISTRATION", session);

        System.out.println();
    }

    /**
     * Scenario 3: Document approval workflow with multiple reviewers
     */
    private static void demonstrateApprovalWorkflow() {
        System.out.println("--- Scenario 3: Document Approval Workflow ---");

        ApprovalController controller = new ApprovalController();
        DocumentSession session = new DocumentSession("Contract_2024.pdf");

        controller.processCommand("SUBMIT_FOR_REVIEW", session);
        session.addReview("manager", "APPROVED", "Looks good");
        controller.processCommand("MANAGER_REVIEW", session);

        session.addReview("legal", "APPROVED", "Legally compliant");
        controller.processCommand("LEGAL_REVIEW", session);

        session.addReview("cfo", "APPROVED", "Budget approved");
        controller.processCommand("CFO_REVIEW", session);

        controller.processCommand("FINALIZE_DOCUMENT", session);

        System.out.println();
    }

    /**
     * Scenario 4: Banking transaction processing with validation
     */
    private static void demonstrateBankingTransactions() {
        System.out.println("--- Scenario 4: Banking Transaction Processing ---");

        BankingController controller = new BankingController();
        TransactionSession session = new TransactionSession("ACC123456");

        session.setTransactionDetails("TRANSFER", 5000.00, "ACC789012");
        controller.processCommand("INITIATE_TRANSACTION", session);

        controller.processCommand("VERIFY_IDENTITY", session);
        controller.processCommand("CHECK_BALANCE", session);
        controller.processCommand("APPLY_FEES", session);
        controller.processCommand("EXECUTE_TRANSACTION", session);

        System.out.println();
    }

    /**
     * Scenario 5: Customer support ticket lifecycle
     */
    private static void demonstrateSupportTicketSystem() {
        System.out.println("--- Scenario 5: Support Ticket System ---");

        SupportTicketController controller = new SupportTicketController();
        TicketSession session = new TicketSession();

        session.createTicket("LOGIN_ISSUE", "Cannot access my account", "HIGH");
        controller.processCommand("CREATE_TICKET", session);

        controller.processCommand("ASSIGN_AGENT", session);
        session.addComment("Agent: Investigating the issue");
        controller.processCommand("UPDATE_TICKET", session);

        session.addComment("Agent: Password reset link sent");
        controller.processCommand("RESOLVE_TICKET", session);

        controller.processCommand("CLOSE_TICKET", session);

        System.out.println();
    }

    /**
     * Scenario 6: Insurance claim processing workflow
     */
    private static void demonstrateInsuranceClaims() {
        System.out.println("--- Scenario 6: Insurance Claim Processing ---");

        InsuranceClaimController controller = new InsuranceClaimController();
        ClaimSession session = new ClaimSession();

        session.setClaimDetails("AUTO", "Accident on Highway 101", 15000.00);
        controller.processCommand("FILE_CLAIM", session);

        controller.processCommand("VERIFY_POLICY", session);
        session.addDocument("police_report.pdf");
        session.addDocument("photos.zip");
        controller.processCommand("SUBMIT_DOCUMENTS", session);

        controller.processCommand("ASSESS_DAMAGE", session);
        controller.processCommand("APPROVE_CLAIM", session);
        controller.processCommand("PROCESS_PAYMENT", session);

        System.out.println();
    }

    /**
     * Scenario 7: Hotel booking with room selection and payment
     */
    private static void demonstrateHotelBooking() {
        System.out.println("--- Scenario 7: Hotel Booking System ---");

        HotelBookingController controller = new HotelBookingController();
        BookingSession session = new BookingSession();

        session.searchHotels("New York", "2024-12-20", "2024-12-23");
        controller.processCommand("SEARCH_HOTELS", session);

        session.selectHotel("Grand Plaza Hotel");
        controller.processCommand("SELECT_HOTEL", session);

        session.selectRoom("Deluxe Suite", 299.99);
        controller.processCommand("SELECT_ROOM", session);

        session.setGuestInfo("Jane Smith", "jane@example.com", "555-1234");
        controller.processCommand("ENTER_GUEST_INFO", session);

        session.setPaymentInfo("**** **** **** 1234");
        controller.processCommand("CONFIRM_BOOKING", session);

        System.out.println();
    }

    /**
     * Scenario 8: Employee onboarding process
     */
    private static void demonstrateEmployeeOnboarding() {
        System.out.println("--- Scenario 8: Employee Onboarding ---");

        OnboardingController controller = new OnboardingController();
        OnboardingSession session = new OnboardingSession("EMP2024-001");

        controller.processCommand("START_ONBOARDING", session);

        session.completeTask("SIGN_DOCUMENTS", "All employment contracts signed");
        controller.processCommand("COMPLETE_HR_PAPERWORK", session);

        session.completeTask("IT_SETUP", "Laptop and accounts created");
        controller.processCommand("COMPLETE_IT_SETUP", session);

        session.completeTask("TRAINING", "Completed orientation training");
        controller.processCommand("COMPLETE_TRAINING", session);

        controller.processCommand("FINALIZE_ONBOARDING", session);

        System.out.println();
    }

    /**
     * Scenario 9: Healthcare patient intake process
     */
    private static void demonstratePatientIntake() {
        System.out.println("--- Scenario 9: Healthcare Patient Intake ---");

        PatientIntakeController controller = new PatientIntakeController();
        PatientSession session = new PatientSession();

        session.setPatientInfo("Robert Johnson", "1980-05-15", "M");
        controller.processCommand("REGISTER_PATIENT", session);

        session.setInsuranceInfo("BlueCross", "POL123456789");
        controller.processCommand("VERIFY_INSURANCE", session);

        session.setMedicalHistory("Diabetes", "Metformin");
        controller.processCommand("COLLECT_MEDICAL_HISTORY", session);

        session.setVitalSigns(120, 80, 98.6, 72);
        controller.processCommand("RECORD_VITALS", session);

        controller.processCommand("SCHEDULE_APPOINTMENT", session);

        System.out.println();
    }

    /**
     * Scenario 10: Loan application processing
     */
    private static void demonstrateLoanApplication() {
        System.out.println("--- Scenario 10: Loan Application Processing ---");

        LoanApplicationController controller = new LoanApplicationController();
        LoanSession session = new LoanSession();

        session.setLoanDetails("MORTGAGE", 350000.00, 30);
        controller.processCommand("SUBMIT_APPLICATION", session);

        session.setApplicantInfo("Sarah Williams", 85000.00, 750);
        controller.processCommand("VERIFY_IDENTITY", session);

        controller.processCommand("CHECK_CREDIT_SCORE", session);
        controller.processCommand("VERIFY_INCOME", session);
        controller.processCommand("CALCULATE_DTI", session);
        controller.processCommand("UNDERWRITING_REVIEW", session);
        controller.processCommand("APPROVE_LOAN", session);

        System.out.println();
    }
}

// ============= Application Controller Base =============

/**
 * Base Application Controller that manages command routing
 */
abstract class ApplicationController {
    protected Map<String, Command> commands = new HashMap<>();

    public void processCommand(String commandName, SessionContext context) {
        Command command = commands.get(commandName);
        if (command != null) {
            System.out.println("Processing: " + commandName);
            command.execute(context);
        } else {
            System.out.println("Unknown command: " + commandName);
        }
    }

    protected void registerCommand(String name, Command command) {
        commands.put(name, command);
    }
}

/**
 * Command interface for all commands
 */
interface Command {
    void execute(SessionContext context);
}

/**
 * Base session context
 */
interface SessionContext {
    String getStatus();
    void setStatus(String status);
}

// ============= E-commerce Implementation =============

class EcommerceController extends ApplicationController {
    public EcommerceController() {
        registerCommand("VIEW_CART", ctx -> System.out.println("  → Displaying cart contents"));
        registerCommand("ENTER_SHIPPING", ctx -> System.out.println("  → Collecting shipping address"));
        registerCommand("SELECT_PAYMENT", ctx -> System.out.println("  → Processing payment information"));
        registerCommand("REVIEW_ORDER", ctx -> {
            CheckoutSession session = (CheckoutSession) ctx;
            System.out.println("  → Order total: $" + session.getTotal());
        });
        registerCommand("PLACE_ORDER", ctx -> {
            ctx.setStatus("COMPLETED");
            System.out.println("  → Order placed successfully!");
        });
    }
}

class CheckoutSession implements SessionContext {
    private List<OrderItem> items = new ArrayList<>();
    private String status = "ACTIVE";

    public void addItem(String name, double price) {
        items.add(new OrderItem(name, price));
    }

    public double getTotal() {
        return items.stream().mapToDouble(OrderItem::getPrice).sum();
    }

    @Override
    public String getStatus() { return status; }

    @Override
    public void setStatus(String status) { this.status = status; }

    static class OrderItem {
        private String name;
        private double price;

        public OrderItem(String name, double price) {
            this.name = name;
            this.price = price;
        }

        public double getPrice() { return price; }
    }
}

// ============= Registration Implementation =============

class RegistrationController extends ApplicationController {
    public RegistrationController() {
        registerCommand("START_REGISTRATION", ctx -> System.out.println("  → Registration wizard started"));
        registerCommand("SUBMIT_BASIC_INFO", ctx -> System.out.println("  → Basic information saved"));
        registerCommand("SUBMIT_PROFILE", ctx -> System.out.println("  → Profile information saved"));
        registerCommand("SUBMIT_PREFERENCES", ctx -> System.out.println("  → Preferences saved"));
        registerCommand("COMPLETE_REGISTRATION", ctx -> {
            ctx.setStatus("REGISTERED");
            System.out.println("  → Registration completed successfully!");
        });
    }
}

class RegistrationSession implements SessionContext {
    private String email, password, name, occupation;
    private String status = "IN_PROGRESS";

    public void setBasicInfo(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public void setProfileInfo(String name, String occupation) {
        this.name = name;
        this.occupation = occupation;
    }

    public void setPreferences(String frequency, boolean newsletter) {
        // Store preferences
    }

    @Override
    public String getStatus() { return status; }

    @Override
    public void setStatus(String status) { this.status = status; }
}

// ============= Document Approval Implementation =============

class ApprovalController extends ApplicationController {
    public ApprovalController() {
        registerCommand("SUBMIT_FOR_REVIEW", ctx -> System.out.println("  → Document submitted for approval"));
        registerCommand("MANAGER_REVIEW", ctx -> System.out.println("  → Manager approval received"));
        registerCommand("LEGAL_REVIEW", ctx -> System.out.println("  → Legal approval received"));
        registerCommand("CFO_REVIEW", ctx -> System.out.println("  → CFO approval received"));
        registerCommand("FINALIZE_DOCUMENT", ctx -> {
            ctx.setStatus("APPROVED");
            System.out.println("  → Document finalized and approved!");
        });
    }
}

class DocumentSession implements SessionContext {
    private String documentName;
    private List<Review> reviews = new ArrayList<>();
    private String status = "DRAFT";

    public DocumentSession(String documentName) {
        this.documentName = documentName;
    }

    public void addReview(String reviewer, String decision, String comment) {
        reviews.add(new Review(reviewer, decision, comment));
    }

    @Override
    public String getStatus() { return status; }

    @Override
    public void setStatus(String status) { this.status = status; }

    static class Review {
        String reviewer, decision, comment;

        public Review(String reviewer, String decision, String comment) {
            this.reviewer = reviewer;
            this.decision = decision;
            this.comment = comment;
        }
    }
}

// ============= Additional Controller Implementations =============

class BankingController extends ApplicationController {
    public BankingController() {
        registerCommand("INITIATE_TRANSACTION", ctx -> System.out.println("  → Transaction initiated"));
        registerCommand("VERIFY_IDENTITY", ctx -> System.out.println("  → Identity verified"));
        registerCommand("CHECK_BALANCE", ctx -> System.out.println("  → Balance checked"));
        registerCommand("APPLY_FEES", ctx -> System.out.println("  → Fees calculated"));
        registerCommand("EXECUTE_TRANSACTION", ctx -> {
            ctx.setStatus("COMPLETED");
            System.out.println("  → Transaction executed successfully!");
        });
    }
}

class TransactionSession implements SessionContext {
    private String accountNumber, type, toAccount;
    private double amount;
    private String status = "PENDING";

    public TransactionSession(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public void setTransactionDetails(String type, double amount, String toAccount) {
        this.type = type;
        this.amount = amount;
        this.toAccount = toAccount;
    }

    @Override
    public String getStatus() { return status; }

    @Override
    public void setStatus(String status) { this.status = status; }
}

class SupportTicketController extends ApplicationController {
    public SupportTicketController() {
        registerCommand("CREATE_TICKET", ctx -> System.out.println("  → Ticket created: #" + System.currentTimeMillis() % 10000));
        registerCommand("ASSIGN_AGENT", ctx -> System.out.println("  → Assigned to Agent Smith"));
        registerCommand("UPDATE_TICKET", ctx -> System.out.println("  → Ticket updated"));
        registerCommand("RESOLVE_TICKET", ctx -> System.out.println("  → Ticket resolved"));
        registerCommand("CLOSE_TICKET", ctx -> {
            ctx.setStatus("CLOSED");
            System.out.println("  → Ticket closed");
        });
    }
}

class TicketSession implements SessionContext {
    private String ticketId, category, description, priority;
    private List<String> comments = new ArrayList<>();
    private String status = "NEW";

    public void createTicket(String category, String description, String priority) {
        this.category = category;
        this.description = description;
        this.priority = priority;
    }

    public void addComment(String comment) {
        comments.add(comment);
    }

    @Override
    public String getStatus() { return status; }

    @Override
    public void setStatus(String status) { this.status = status; }
}

class InsuranceClaimController extends ApplicationController {
    public InsuranceClaimController() {
        registerCommand("FILE_CLAIM", ctx -> System.out.println("  → Claim filed"));
        registerCommand("VERIFY_POLICY", ctx -> System.out.println("  → Policy verified"));
        registerCommand("SUBMIT_DOCUMENTS", ctx -> System.out.println("  → Documents submitted"));
        registerCommand("ASSESS_DAMAGE", ctx -> System.out.println("  → Damage assessed"));
        registerCommand("APPROVE_CLAIM", ctx -> System.out.println("  → Claim approved"));
        registerCommand("PROCESS_PAYMENT", ctx -> {
            ctx.setStatus("PAID");
            System.out.println("  → Payment processed");
        });
    }
}

class ClaimSession implements SessionContext {
    private String claimType, description;
    private double amount;
    private List<String> documents = new ArrayList<>();
    private String status = "FILED";

    public void setClaimDetails(String claimType, String description, double amount) {
        this.claimType = claimType;
        this.description = description;
        this.amount = amount;
    }

    public void addDocument(String document) {
        documents.add(document);
    }

    @Override
    public String getStatus() { return status; }

    @Override
    public void setStatus(String status) { this.status = status; }
}

class HotelBookingController extends ApplicationController {
    public HotelBookingController() {
        registerCommand("SEARCH_HOTELS", ctx -> System.out.println("  → Searching available hotels"));
        registerCommand("SELECT_HOTEL", ctx -> System.out.println("  → Hotel selected"));
        registerCommand("SELECT_ROOM", ctx -> System.out.println("  → Room selected"));
        registerCommand("ENTER_GUEST_INFO", ctx -> System.out.println("  → Guest information entered"));
        registerCommand("CONFIRM_BOOKING", ctx -> {
            ctx.setStatus("CONFIRMED");
            System.out.println("  → Booking confirmed! Confirmation sent via email");
        });
    }
}

class BookingSession implements SessionContext {
    private String city, checkIn, checkOut, hotelName, roomType, guestName;
    private double roomPrice;
    private String status = "SEARCHING";

    public void searchHotels(String city, String checkIn, String checkOut) {
        this.city = city;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
    }

    public void selectHotel(String hotelName) {
        this.hotelName = hotelName;
    }

    public void selectRoom(String roomType, double roomPrice) {
        this.roomType = roomType;
        this.roomPrice = roomPrice;
    }

    public void setGuestInfo(String name, String email, String phone) {
        this.guestName = name;
    }

    public void setPaymentInfo(String cardNumber) {
        // Store payment info securely
    }

    @Override
    public String getStatus() { return status; }

    @Override
    public void setStatus(String status) { this.status = status; }
}

class OnboardingController extends ApplicationController {
    public OnboardingController() {
        registerCommand("START_ONBOARDING", ctx -> System.out.println("  → Onboarding process started"));
        registerCommand("COMPLETE_HR_PAPERWORK", ctx -> System.out.println("  → HR paperwork completed"));
        registerCommand("COMPLETE_IT_SETUP", ctx -> System.out.println("  → IT setup completed"));
        registerCommand("COMPLETE_TRAINING", ctx -> System.out.println("  → Training completed"));
        registerCommand("FINALIZE_ONBOARDING", ctx -> {
            ctx.setStatus("ACTIVE");
            System.out.println("  → Onboarding finalized! Employee is now active");
        });
    }
}

class OnboardingSession implements SessionContext {
    private String employeeId;
    private Map<String, String> completedTasks = new HashMap<>();
    private String status = "IN_PROGRESS";

    public OnboardingSession(String employeeId) {
        this.employeeId = employeeId;
    }

    public void completeTask(String taskId, String details) {
        completedTasks.put(taskId, details);
    }

    @Override
    public String getStatus() { return status; }

    @Override
    public void setStatus(String status) { this.status = status; }
}

class PatientIntakeController extends ApplicationController {
    public PatientIntakeController() {
        registerCommand("REGISTER_PATIENT", ctx -> System.out.println("  → Patient registered"));
        registerCommand("VERIFY_INSURANCE", ctx -> System.out.println("  → Insurance verified"));
        registerCommand("COLLECT_MEDICAL_HISTORY", ctx -> System.out.println("  → Medical history collected"));
        registerCommand("RECORD_VITALS", ctx -> System.out.println("  → Vital signs recorded"));
        registerCommand("SCHEDULE_APPOINTMENT", ctx -> {
            ctx.setStatus("SCHEDULED");
            System.out.println("  → Appointment scheduled");
        });
    }
}

class PatientSession implements SessionContext {
    private String name, dob, gender, insurance, medicalHistory;
    private String status = "NEW";

    public void setPatientInfo(String name, String dob, String gender) {
        this.name = name;
        this.dob = dob;
        this.gender = gender;
    }

    public void setInsuranceInfo(String provider, String policyNumber) {
        this.insurance = provider + " - " + policyNumber;
    }

    public void setMedicalHistory(String conditions, String medications) {
        this.medicalHistory = conditions + "; Meds: " + medications;
    }

    public void setVitalSigns(int systolic, int diastolic, double temp, int pulse) {
        // Record vital signs
    }

    @Override
    public String getStatus() { return status; }

    @Override
    public void setStatus(String status) { this.status = status; }
}

class LoanApplicationController extends ApplicationController {
    public LoanApplicationController() {
        registerCommand("SUBMIT_APPLICATION", ctx -> System.out.println("  → Application submitted"));
        registerCommand("VERIFY_IDENTITY", ctx -> System.out.println("  → Identity verified"));
        registerCommand("CHECK_CREDIT_SCORE", ctx -> System.out.println("  → Credit score checked: 750 (Good)"));
        registerCommand("VERIFY_INCOME", ctx -> System.out.println("  → Income verified"));
        registerCommand("CALCULATE_DTI", ctx -> System.out.println("  → Debt-to-Income ratio: 28% (Acceptable)"));
        registerCommand("UNDERWRITING_REVIEW", ctx -> System.out.println("  → Underwriting review completed"));
        registerCommand("APPROVE_LOAN", ctx -> {
            ctx.setStatus("APPROVED");
            System.out.println("  → Loan approved! Congratulations!");
        });
    }
}

class LoanSession implements SessionContext {
    private String loanType, applicantName;
    private double amount, annualIncome;
    private int term, creditScore;
    private String status = "SUBMITTED";

    public void setLoanDetails(String loanType, double amount, int term) {
        this.loanType = loanType;
        this.amount = amount;
        this.term = term;
    }

    public void setApplicantInfo(String name, double annualIncome, int creditScore) {
        this.applicantName = name;
        this.annualIncome = annualIncome;
        this.creditScore = creditScore;
    }

    @Override
    public String getStatus() { return status; }

    @Override
    public void setStatus(String status) { this.status = status; }
}
