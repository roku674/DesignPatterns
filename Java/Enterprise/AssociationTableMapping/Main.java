package Enterprise.AssociationTableMapping;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Association Table Mapping Pattern Demonstration
 *
 * Intent: Maps many-to-many associations using an intermediary association table.
 * This pattern is essential for handling complex relationships between entities
 * where neither side owns the relationship exclusively.
 *
 * Key Concepts:
 * - Association table contains foreign keys to both sides
 * - Handles many-to-many relationships cleanly
 * - Separates association logic from domain objects
 * - Enables additional attributes on relationships
 *
 * Real-world examples:
 * - Students enrolled in courses
 * - Employees assigned to projects
 * - Products in shopping carts
 * - Actors appearing in movies
 * - Authors writing books
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Association Table Mapping Pattern Demo ===\n");

        // Scenario 1: Student-Course Enrollment System
        demonstrateStudentCourseEnrollment();

        // Scenario 2: Employee-Project Assignment
        demonstrateEmployeeProjectAssignment();

        // Scenario 3: Shopping Cart with Products
        demonstrateShoppingCart();

        // Scenario 4: Actor-Movie Casting
        demonstrateActorMovieCasting();

        // Scenario 5: Author-Book Publishing
        demonstrateAuthorBookPublishing();

        // Scenario 6: Doctor-Patient Appointments
        demonstrateDoctorPatientAppointments();

        // Scenario 7: Restaurant Menu Items with Tags
        demonstrateMenuItemTags();

        // Scenario 8: Conference Speaker-Session Assignment
        demonstrateConferenceSessions();

        // Scenario 9: Social Media User Following
        demonstrateSocialMediaFollowing();

        // Scenario 10: Product Categories and Filters
        demonstrateProductCategoryFilters();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: University course enrollment with grades
     */
    private static void demonstrateStudentCourseEnrollment() {
        System.out.println("--- Scenario 1: Student-Course Enrollment ---");

        StudentCourseMapper mapper = new StudentCourseMapper();

        // Create students
        Student alice = new Student(1, "Alice Johnson", "Computer Science");
        Student bob = new Student(2, "Bob Smith", "Mathematics");
        Student carol = new Student(3, "Carol Williams", "Physics");

        // Create courses
        Course dataStructures = new Course(101, "Data Structures", 4);
        Course calculus = new Course(102, "Calculus II", 3);
        Course physics = new Course(103, "Quantum Physics", 3);

        // Enroll students in courses with grades
        mapper.enroll(alice, dataStructures, "A", "2024-01-15");
        mapper.enroll(alice, calculus, "B+", "2024-01-15");
        mapper.enroll(bob, calculus, "A-", "2024-01-16");
        mapper.enroll(bob, dataStructures, "B", "2024-01-16");
        mapper.enroll(carol, physics, "A", "2024-01-17");
        mapper.enroll(carol, calculus, "A-", "2024-01-17");

        System.out.println("Alice's courses:");
        mapper.getCoursesForStudent(alice).forEach(System.out::println);

        System.out.println("\nStudents in Calculus:");
        mapper.getStudentsInCourse(calculus).forEach(System.out::println);

        System.out.println("\nAlice's grade in Data Structures: " +
                mapper.getGrade(alice, dataStructures));

        System.out.println();
    }

    /**
     * Scenario 2: Project management with employee assignments
     */
    private static void demonstrateEmployeeProjectAssignment() {
        System.out.println("--- Scenario 2: Employee-Project Assignment ---");

        EmployeeProjectMapper mapper = new EmployeeProjectMapper();

        // Create employees
        Employee john = new Employee(1, "John Doe", "Senior Developer");
        Employee jane = new Employee(2, "Jane Smith", "Project Manager");
        Employee mike = new Employee(3, "Mike Johnson", "QA Engineer");

        // Create projects
        Project webApp = new Project(101, "Web Application", "2024-12-31");
        Project mobileApp = new Project(102, "Mobile App", "2024-11-30");
        Project api = new Project(103, "REST API", "2024-10-15");

        // Assign employees to projects with roles
        mapper.assign(john, webApp, "Lead Developer", 40);
        mapper.assign(john, api, "Backend Developer", 20);
        mapper.assign(jane, webApp, "Project Manager", 30);
        mapper.assign(jane, mobileApp, "Project Manager", 30);
        mapper.assign(mike, webApp, "QA Lead", 35);
        mapper.assign(mike, mobileApp, "QA Engineer", 25);

        System.out.println("John's projects:");
        mapper.getProjectsForEmployee(john).forEach(System.out::println);

        System.out.println("\nWeb Application team:");
        mapper.getEmployeesOnProject(webApp).forEach(System.out::println);

        System.out.println("\nJohn's role in Web App: " +
                mapper.getAssignmentDetails(john, webApp));

        System.out.println();
    }

    /**
     * Scenario 3: E-commerce shopping cart
     */
    private static void demonstrateShoppingCart() {
        System.out.println("--- Scenario 3: Shopping Cart ---");

        ShoppingCartMapper mapper = new ShoppingCartMapper();

        // Create customers
        Customer customer1 = new Customer(1, "Alice Brown", "alice@example.com");
        Customer customer2 = new Customer(2, "Bob Green", "bob@example.com");

        // Create products
        Product laptop = new Product(101, "Gaming Laptop", 1299.99);
        Product mouse = new Product(102, "Wireless Mouse", 49.99);
        Product keyboard = new Product(103, "Mechanical Keyboard", 149.99);
        Product monitor = new Product(104, "4K Monitor", 499.99);

        // Add items to carts
        mapper.addToCart(customer1, laptop, 1, 1299.99);
        mapper.addToCart(customer1, mouse, 2, 49.99);
        mapper.addToCart(customer1, keyboard, 1, 149.99);
        mapper.addToCart(customer2, monitor, 1, 499.99);
        mapper.addToCart(customer2, mouse, 1, 49.99);

        System.out.println("Alice's cart:");
        List<CartItem> aliceCart = mapper.getCartItems(customer1);
        aliceCart.forEach(System.out::println);
        System.out.println("Total: $" + mapper.getCartTotal(customer1));

        System.out.println("\nBob's cart:");
        List<CartItem> bobCart = mapper.getCartItems(customer2);
        bobCart.forEach(System.out::println);
        System.out.println("Total: $" + mapper.getCartTotal(customer2));

        System.out.println();
    }

    /**
     * Scenario 4: Movie casting database
     */
    private static void demonstrateActorMovieCasting() {
        System.out.println("--- Scenario 4: Actor-Movie Casting ---");

        ActorMovieMapper mapper = new ActorMovieMapper();

        // Create actors
        Actor actor1 = new Actor(1, "Tom Hanks", "American");
        Actor actor2 = new Actor(2, "Meryl Streep", "American");
        Actor actor3 = new Actor(3, "Leonardo DiCaprio", "American");

        // Create movies
        Movie forrestGump = new Movie(101, "Forrest Gump", 1994);
        Movie inception = new Movie(102, "Inception", 2010);
        Movie thePost = new Movie(103, "The Post", 2017);

        // Cast actors in movies
        mapper.cast(actor1, forrestGump, "Forrest Gump", 10000000);
        mapper.cast(actor2, thePost, "Katharine Graham", 5000000);
        mapper.cast(actor1, thePost, "Ben Bradlee", 6000000);
        mapper.cast(actor3, inception, "Dom Cobb", 12000000);

        System.out.println("Tom Hanks' movies:");
        mapper.getMoviesForActor(actor1).forEach(System.out::println);

        System.out.println("\nThe Post cast:");
        mapper.getActorsInMovie(thePost).forEach(System.out::println);

        System.out.println("\nTom Hanks' role in Forrest Gump: " +
                mapper.getRole(actor1, forrestGump));

        System.out.println();
    }

    /**
     * Scenario 5: Publishing house author-book relationships
     */
    private static void demonstrateAuthorBookPublishing() {
        System.out.println("--- Scenario 5: Author-Book Publishing ---");

        AuthorBookMapper mapper = new AuthorBookMapper();

        // Create authors
        Author author1 = new Author(1, "J.K. Rowling", "British");
        Author author2 = new Author(2, "Stephen King", "American");
        Author author3 = new Author(3, "Neil Gaiman", "British");

        // Create books
        Book book1 = new Book(101, "Harry Potter and the Philosopher's Stone", "Fantasy");
        Book book2 = new Book(102, "The Shining", "Horror");
        Book book3 = new Book(103, "Good Omens", "Fantasy");

        // Link authors to books
        mapper.addAuthorship(author1, book1, "Primary Author", 100.0);
        mapper.addAuthorship(author2, book2, "Primary Author", 100.0);
        mapper.addAuthorship(author3, book3, "Co-Author", 50.0);
        mapper.addAuthorship(new Author(4, "Terry Pratchett", "British"),
                book3, "Co-Author", 50.0);

        System.out.println("J.K. Rowling's books:");
        mapper.getBooksForAuthor(author1).forEach(System.out::println);

        System.out.println("\nGood Omens authors:");
        mapper.getAuthorsForBook(book3).forEach(System.out::println);

        System.out.println();
    }

    /**
     * Scenario 6: Medical appointment scheduling
     */
    private static void demonstrateDoctorPatientAppointments() {
        System.out.println("--- Scenario 6: Doctor-Patient Appointments ---");

        DoctorPatientMapper mapper = new DoctorPatientMapper();

        // Create doctors
        Doctor doctor1 = new Doctor(1, "Dr. Sarah Johnson", "Cardiology");
        Doctor doctor2 = new Doctor(2, "Dr. Michael Lee", "Orthopedics");

        // Create patients
        Patient patient1 = new Patient(101, "John Smith", "1980-05-15");
        Patient patient2 = new Patient(102, "Emma Davis", "1992-08-20");
        Patient patient3 = new Patient(103, "Robert Wilson", "1975-12-03");

        // Schedule appointments
        mapper.scheduleAppointment(doctor1, patient1, "2024-10-20 09:00", "Checkup");
        mapper.scheduleAppointment(doctor1, patient2, "2024-10-20 10:30", "Follow-up");
        mapper.scheduleAppointment(doctor2, patient3, "2024-10-21 14:00", "Consultation");
        mapper.scheduleAppointment(doctor1, patient3, "2024-10-22 11:00", "Surgery prep");

        System.out.println("Dr. Johnson's appointments:");
        mapper.getAppointmentsForDoctor(doctor1).forEach(System.out::println);

        System.out.println("\nJohn Smith's appointments:");
        mapper.getAppointmentsForPatient(patient1).forEach(System.out::println);

        System.out.println();
    }

    /**
     * Scenario 7: Restaurant menu with dietary tags
     */
    private static void demonstrateMenuItemTags() {
        System.out.println("--- Scenario 7: Menu Item Tags ---");

        MenuItemTagMapper mapper = new MenuItemTagMapper();

        // Create menu items
        MenuItem item1 = new MenuItem(1, "Grilled Salmon", 24.99);
        MenuItem item2 = new MenuItem(2, "Vegetable Curry", 15.99);
        MenuItem item3 = new MenuItem(3, "Beef Burger", 12.99);

        // Create tags
        DietaryTag glutenFree = new DietaryTag(1, "Gluten-Free");
        DietaryTag vegan = new DietaryTag(2, "Vegan");
        DietaryTag vegetarian = new DietaryTag(3, "Vegetarian");
        DietaryTag lowCarb = new DietaryTag(4, "Low-Carb");

        // Tag menu items
        mapper.addTag(item1, glutenFree);
        mapper.addTag(item1, lowCarb);
        mapper.addTag(item2, vegan);
        mapper.addTag(item2, vegetarian);
        mapper.addTag(item2, glutenFree);

        System.out.println("Grilled Salmon tags:");
        mapper.getTagsForMenuItem(item1).forEach(System.out::println);

        System.out.println("\nGluten-Free items:");
        mapper.getMenuItemsWithTag(glutenFree).forEach(System.out::println);

        System.out.println();
    }

    /**
     * Scenario 8: Conference speaker assignments
     */
    private static void demonstrateConferenceSessions() {
        System.out.println("--- Scenario 8: Conference Sessions ---");

        SpeakerSessionMapper mapper = new SpeakerSessionMapper();

        // Create speakers
        Speaker speaker1 = new Speaker(1, "Dr. Jane Wilson", "AI Research");
        Speaker speaker2 = new Speaker(2, "Prof. Mark Johnson", "Quantum Computing");
        Speaker speaker3 = new Speaker(3, "Dr. Lisa Chen", "Cybersecurity");

        // Create sessions
        ConferenceSession session1 = new ConferenceSession(101, "Future of AI", "Hall A", "10:00 AM");
        ConferenceSession session2 = new ConferenceSession(102, "Quantum Algorithms", "Hall B", "2:00 PM");
        ConferenceSession session3 = new ConferenceSession(103, "Security Best Practices", "Hall A", "4:00 PM");

        // Assign speakers
        mapper.assignSpeaker(speaker1, session1, "Keynote", 60);
        mapper.assignSpeaker(speaker2, session2, "Presenter", 45);
        mapper.assignSpeaker(speaker3, session3, "Workshop Leader", 90);
        mapper.assignSpeaker(speaker3, session1, "Panelist", 15);

        System.out.println("Dr. Jane Wilson's sessions:");
        mapper.getSessionsForSpeaker(speaker1).forEach(System.out::println);

        System.out.println("\nFuture of AI speakers:");
        mapper.getSpeakersForSession(session1).forEach(System.out::println);

        System.out.println();
    }

    /**
     * Scenario 9: Social media following relationships
     */
    private static void demonstrateSocialMediaFollowing() {
        System.out.println("--- Scenario 9: Social Media Following ---");

        UserFollowingMapper mapper = new UserFollowingMapper();

        // Create users
        SocialUser user1 = new SocialUser(1, "alice_tech", "Alice Johnson");
        SocialUser user2 = new SocialUser(2, "bob_coder", "Bob Smith");
        SocialUser user3 = new SocialUser(3, "carol_dev", "Carol Williams");
        SocialUser user4 = new SocialUser(4, "dave_design", "Dave Brown");

        // Create following relationships
        mapper.follow(user1, user2, "2024-01-15");
        mapper.follow(user1, user3, "2024-02-20");
        mapper.follow(user2, user1, "2024-01-20");
        mapper.follow(user2, user4, "2024-03-10");
        mapper.follow(user3, user1, "2024-02-25");
        mapper.follow(user4, user1, "2024-03-15");

        System.out.println("Alice is following:");
        mapper.getFollowing(user1).forEach(System.out::println);

        System.out.println("\nAlice's followers:");
        mapper.getFollowers(user1).forEach(System.out::println);

        System.out.println("\nAre Alice and Bob following each other? " +
                mapper.areFollowingEachOther(user1, user2));

        System.out.println();
    }

    /**
     * Scenario 10: E-commerce product filtering
     */
    private static void demonstrateProductCategoryFilters() {
        System.out.println("--- Scenario 10: Product Category Filters ---");

        ProductCategoryMapper mapper = new ProductCategoryMapper();

        // Create products
        EcommerceProduct product1 = new EcommerceProduct(1, "Laptop", 999.99);
        EcommerceProduct product2 = new EcommerceProduct(2, "Smartphone", 699.99);
        EcommerceProduct product3 = new EcommerceProduct(3, "Tablet", 499.99);

        // Create categories
        Category electronics = new Category(1, "Electronics");
        Category computers = new Category(2, "Computers");
        Category mobile = new Category(3, "Mobile Devices");
        Category featured = new Category(4, "Featured");

        // Categorize products
        mapper.addToCategory(product1, electronics, 1);
        mapper.addToCategory(product1, computers, 1);
        mapper.addToCategory(product1, featured, 1);
        mapper.addToCategory(product2, electronics, 2);
        mapper.addToCategory(product2, mobile, 1);
        mapper.addToCategory(product3, electronics, 3);
        mapper.addToCategory(product3, mobile, 2);

        System.out.println("Products in Electronics:");
        mapper.getProductsInCategory(electronics).forEach(System.out::println);

        System.out.println("\nLaptop's categories:");
        mapper.getCategoriesForProduct(product1).forEach(System.out::println);

        System.out.println("\nFeatured products:");
        mapper.getProductsInCategory(featured).forEach(System.out::println);

        System.out.println();
    }
}

// ============= Base Classes =============

class Student {
    private int id;
    private String name, major;

    public Student(int id, String name, String major) {
        this.id = id;
        this.name = name;
        this.major = major;
    }

    public int getId() { return id; }
    public String getName() { return name; }

    @Override
    public String toString() {
        return String.format("  Student[%d]: %s (%s)", id, name, major);
    }
}

class Course {
    private int id;
    private String name;
    private int credits;

    public Course(int id, String name, int credits) {
        this.id = id;
        this.name = name;
        this.credits = credits;
    }

    public int getId() { return id; }
    public String getName() { return name; }

    @Override
    public String toString() {
        return String.format("  Course[%d]: %s (%d credits)", id, name, credits);
    }
}

class StudentCourseMapper {
    private List<Enrollment> enrollments = new ArrayList<>();

    public void enroll(Student student, Course course, String grade, String date) {
        enrollments.add(new Enrollment(student.getId(), course.getId(), grade, date, student, course));
    }

    public List<Course> getCoursesForStudent(Student student) {
        return enrollments.stream()
                .filter(e -> e.studentId == student.getId())
                .map(e -> e.course)
                .collect(Collectors.toList());
    }

    public List<Student> getStudentsInCourse(Course course) {
        return enrollments.stream()
                .filter(e -> e.courseId == course.getId())
                .map(e -> e.student)
                .collect(Collectors.toList());
    }

    public String getGrade(Student student, Course course) {
        return enrollments.stream()
                .filter(e -> e.studentId == student.getId() && e.courseId == course.getId())
                .findFirst()
                .map(e -> e.grade)
                .orElse("N/A");
    }

    static class Enrollment {
        int studentId, courseId;
        String grade, enrollmentDate;
        Student student;
        Course course;

        public Enrollment(int studentId, int courseId, String grade, String date, Student student, Course course) {
            this.studentId = studentId;
            this.courseId = courseId;
            this.grade = grade;
            this.enrollmentDate = date;
            this.student = student;
            this.course = course;
        }
    }
}

// ============= Employee-Project Mapping =============

class Employee {
    private int id;
    private String name, title;

    public Employee(int id, String name, String title) {
        this.id = id;
        this.name = name;
        this.title = title;
    }

    public int getId() { return id; }

    @Override
    public String toString() {
        return String.format("  Employee[%d]: %s (%s)", id, name, title);
    }
}

class Project {
    private int id;
    private String name, deadline;

    public Project(int id, String name, String deadline) {
        this.id = id;
        this.name = name;
        this.deadline = deadline;
    }

    public int getId() { return id; }

    @Override
    public String toString() {
        return String.format("  Project[%d]: %s (Due: %s)", id, name, deadline);
    }
}

class EmployeeProjectMapper {
    private List<Assignment> assignments = new ArrayList<>();

    public void assign(Employee employee, Project project, String role, int hoursPerWeek) {
        assignments.add(new Assignment(employee.getId(), project.getId(), role, hoursPerWeek, employee, project));
    }

    public List<Project> getProjectsForEmployee(Employee employee) {
        return assignments.stream()
                .filter(a -> a.employeeId == employee.getId())
                .map(a -> a.project)
                .collect(Collectors.toList());
    }

    public List<Employee> getEmployeesOnProject(Project project) {
        return assignments.stream()
                .filter(a -> a.projectId == project.getId())
                .map(a -> a.employee)
                .collect(Collectors.toList());
    }

    public String getAssignmentDetails(Employee employee, Project project) {
        return assignments.stream()
                .filter(a -> a.employeeId == employee.getId() && a.projectId == project.getId())
                .findFirst()
                .map(a -> a.role + " (" + a.hoursPerWeek + " hrs/week)")
                .orElse("Not assigned");
    }

    static class Assignment {
        int employeeId, projectId, hoursPerWeek;
        String role;
        Employee employee;
        Project project;

        public Assignment(int employeeId, int projectId, String role, int hoursPerWeek,
                          Employee employee, Project project) {
            this.employeeId = employeeId;
            this.projectId = projectId;
            this.role = role;
            this.hoursPerWeek = hoursPerWeek;
            this.employee = employee;
            this.project = project;
        }
    }
}

// ============= Shopping Cart Mapping =============

class Customer {
    private int id;
    private String name, email;

    public Customer(int id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public int getId() { return id; }
}

class Product {
    private int id;
    private String name;
    private double price;

    public Product(int id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public int getId() { return id; }
    public String getName() { return name; }
}

class CartItem {
    Product product;
    int quantity;
    double priceAtAdd;

    public CartItem(Product product, int quantity, double priceAtAdd) {
        this.product = product;
        this.quantity = quantity;
        this.priceAtAdd = priceAtAdd;
    }

    public double getSubtotal() {
        return quantity * priceAtAdd;
    }

    @Override
    public String toString() {
        return String.format("  %s x%d @ $%.2f = $%.2f",
                product.getName(), quantity, priceAtAdd, getSubtotal());
    }
}

class ShoppingCartMapper {
    private Map<Integer, List<CartItem>> carts = new HashMap<>();

    public void addToCart(Customer customer, Product product, int quantity, double price) {
        carts.computeIfAbsent(customer.getId(), k -> new ArrayList<>())
                .add(new CartItem(product, quantity, price));
    }

    public List<CartItem> getCartItems(Customer customer) {
        return carts.getOrDefault(customer.getId(), new ArrayList<>());
    }

    public double getCartTotal(Customer customer) {
        return getCartItems(customer).stream()
                .mapToDouble(CartItem::getSubtotal)
                .sum();
    }
}

// ============= Actor-Movie Mapping =============

class Actor {
    private int id;
    private String name, nationality;

    public Actor(int id, String name, String nationality) {
        this.id = id;
        this.name = name;
        this.nationality = nationality;
    }

    public int getId() { return id; }

    @Override
    public String toString() {
        return String.format("  Actor[%d]: %s (%s)", id, name, nationality);
    }
}

class Movie {
    private int id;
    private String title;
    private int year;

    public Movie(int id, String title, int year) {
        this.id = id;
        this.title = title;
        this.year = year;
    }

    public int getId() { return id; }

    @Override
    public String toString() {
        return String.format("  Movie[%d]: %s (%d)", id, title, year);
    }
}

class ActorMovieMapper {
    private List<Casting> castings = new ArrayList<>();

    public void cast(Actor actor, Movie movie, String role, double salary) {
        castings.add(new Casting(actor.getId(), movie.getId(), role, salary, actor, movie));
    }

    public List<Movie> getMoviesForActor(Actor actor) {
        return castings.stream()
                .filter(c -> c.actorId == actor.getId())
                .map(c -> c.movie)
                .collect(Collectors.toList());
    }

    public List<Actor> getActorsInMovie(Movie movie) {
        return castings.stream()
                .filter(c -> c.movieId == movie.getId())
                .map(c -> c.actor)
                .collect(Collectors.toList());
    }

    public String getRole(Actor actor, Movie movie) {
        return castings.stream()
                .filter(c -> c.actorId == actor.getId() && c.movieId == movie.getId())
                .findFirst()
                .map(c -> c.role)
                .orElse("Unknown");
    }

    static class Casting {
        int actorId, movieId;
        String role;
        double salary;
        Actor actor;
        Movie movie;

        public Casting(int actorId, int movieId, String role, double salary, Actor actor, Movie movie) {
            this.actorId = actorId;
            this.movieId = movieId;
            this.role = role;
            this.salary = salary;
            this.actor = actor;
            this.movie = movie;
        }
    }
}

// ============= Additional Mappings =============

class Author {
    int id;
    String name, nationality;

    public Author(int id, String name, String nationality) {
        this.id = id;
        this.name = name;
        this.nationality = nationality;
    }

    @Override
    public String toString() {
        return String.format("  Author[%d]: %s", id, name);
    }
}

class Book {
    int id;
    String title, genre;

    public Book(int id, String title, String genre) {
        this.id = id;
        this.title = title;
        this.genre = genre;
    }

    @Override
    public String toString() {
        return String.format("  Book[%d]: %s (%s)", id, title, genre);
    }
}

class AuthorBookMapper {
    private List<Authorship> authorships = new ArrayList<>();

    public void addAuthorship(Author author, Book book, String contributionType, double royaltyPercent) {
        authorships.add(new Authorship(author.id, book.id, contributionType, royaltyPercent, author, book));
    }

    public List<Book> getBooksForAuthor(Author author) {
        return authorships.stream()
                .filter(a -> a.authorId == author.id)
                .map(a -> a.book)
                .collect(Collectors.toList());
    }

    public List<Author> getAuthorsForBook(Book book) {
        return authorships.stream()
                .filter(a -> a.bookId == book.id)
                .map(a -> a.author)
                .collect(Collectors.toList());
    }

    static class Authorship {
        int authorId, bookId;
        String contributionType;
        double royaltyPercent;
        Author author;
        Book book;

        public Authorship(int authorId, int bookId, String contributionType, double royaltyPercent,
                          Author author, Book book) {
            this.authorId = authorId;
            this.bookId = bookId;
            this.contributionType = contributionType;
            this.royaltyPercent = royaltyPercent;
            this.author = author;
            this.book = book;
        }
    }
}

class Doctor {
    int id;
    String name, specialty;

    public Doctor(int id, String name, String specialty) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
    }
}

class Patient {
    int id;
    String name, dob;

    public Patient(int id, String name, String dob) {
        this.id = id;
        this.name = name;
        this.dob = dob;
    }
}

class DoctorPatientMapper {
    private List<Appointment> appointments = new ArrayList<>();

    public void scheduleAppointment(Doctor doctor, Patient patient, String dateTime, String reason) {
        appointments.add(new Appointment(doctor.id, patient.id, dateTime, reason));
    }

    public List<String> getAppointmentsForDoctor(Doctor doctor) {
        return appointments.stream()
                .filter(a -> a.doctorId == doctor.id)
                .map(a -> "  " + a.dateTime + ": " + a.reason)
                .collect(Collectors.toList());
    }

    public List<String> getAppointmentsForPatient(Patient patient) {
        return appointments.stream()
                .filter(a -> a.patientId == patient.id)
                .map(a -> "  " + a.dateTime + ": " + a.reason)
                .collect(Collectors.toList());
    }

    static class Appointment {
        int doctorId, patientId;
        String dateTime, reason;

        public Appointment(int doctorId, int patientId, String dateTime, String reason) {
            this.doctorId = doctorId;
            this.patientId = patientId;
            this.dateTime = dateTime;
            this.reason = reason;
        }
    }
}

class MenuItem {
    int id;
    String name;
    double price;

    public MenuItem(int id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    @Override
    public String toString() {
        return String.format("  %s ($%.2f)", name, price);
    }
}

class DietaryTag {
    int id;
    String name;

    public DietaryTag(int id, String name) {
        this.id = id;
        this.name = name;
    }

    @Override
    public String toString() {
        return "  " + name;
    }
}

class MenuItemTagMapper {
    private Map<Integer, Set<Integer>> itemTags = new HashMap<>();
    private Map<Integer, MenuItem> items = new HashMap<>();
    private Map<Integer, DietaryTag> tags = new HashMap<>();

    public void addTag(MenuItem item, DietaryTag tag) {
        items.put(item.id, item);
        tags.put(tag.id, tag);
        itemTags.computeIfAbsent(item.id, k -> new HashSet<>()).add(tag.id);
    }

    public List<DietaryTag> getTagsForMenuItem(MenuItem item) {
        return itemTags.getOrDefault(item.id, new HashSet<>()).stream()
                .map(tags::get)
                .collect(Collectors.toList());
    }

    public List<MenuItem> getMenuItemsWithTag(DietaryTag tag) {
        return itemTags.entrySet().stream()
                .filter(e -> e.getValue().contains(tag.id))
                .map(e -> items.get(e.getKey()))
                .collect(Collectors.toList());
    }
}

class Speaker {
    int id;
    String name, expertise;

    public Speaker(int id, String name, String expertise) {
        this.id = id;
        this.name = name;
        this.expertise = expertise;
    }

    @Override
    public String toString() {
        return String.format("  %s (%s)", name, expertise);
    }
}

class ConferenceSession {
    int id;
    String title, location, time;

    public ConferenceSession(int id, String title, String location, String time) {
        this.id = id;
        this.title = title;
        this.location = location;
        this.time = time;
    }

    @Override
    public String toString() {
        return String.format("  %s at %s (%s)", title, time, location);
    }
}

class SpeakerSessionMapper {
    private List<SpeakerAssignment> assignments = new ArrayList<>();

    public void assignSpeaker(Speaker speaker, ConferenceSession session, String role, int duration) {
        assignments.add(new SpeakerAssignment(speaker.id, session.id, role, duration, speaker, session));
    }

    public List<ConferenceSession> getSessionsForSpeaker(Speaker speaker) {
        return assignments.stream()
                .filter(a -> a.speakerId == speaker.id)
                .map(a -> a.session)
                .collect(Collectors.toList());
    }

    public List<Speaker> getSpeakersForSession(ConferenceSession session) {
        return assignments.stream()
                .filter(a -> a.sessionId == session.id)
                .map(a -> a.speaker)
                .collect(Collectors.toList());
    }

    static class SpeakerAssignment {
        int speakerId, sessionId, duration;
        String role;
        Speaker speaker;
        ConferenceSession session;

        public SpeakerAssignment(int speakerId, int sessionId, String role, int duration,
                                 Speaker speaker, ConferenceSession session) {
            this.speakerId = speakerId;
            this.sessionId = sessionId;
            this.role = role;
            this.duration = duration;
            this.speaker = speaker;
            this.session = session;
        }
    }
}

class SocialUser {
    int id;
    String username, fullName;

    public SocialUser(int id, String username, String fullName) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
    }

    @Override
    public String toString() {
        return String.format("  @%s (%s)", username, fullName);
    }
}

class UserFollowingMapper {
    private List<Following> followings = new ArrayList<>();

    public void follow(SocialUser follower, SocialUser followed, String date) {
        followings.add(new Following(follower.id, followed.id, date, follower, followed));
    }

    public List<SocialUser> getFollowing(SocialUser user) {
        return followings.stream()
                .filter(f -> f.followerId == user.id)
                .map(f -> f.followed)
                .collect(Collectors.toList());
    }

    public List<SocialUser> getFollowers(SocialUser user) {
        return followings.stream()
                .filter(f -> f.followedId == user.id)
                .map(f -> f.follower)
                .collect(Collectors.toList());
    }

    public boolean areFollowingEachOther(SocialUser user1, SocialUser user2) {
        boolean user1FollowsUser2 = followings.stream()
                .anyMatch(f -> f.followerId == user1.id && f.followedId == user2.id);
        boolean user2FollowsUser1 = followings.stream()
                .anyMatch(f -> f.followerId == user2.id && f.followedId == user1.id);
        return user1FollowsUser2 && user2FollowsUser1;
    }

    static class Following {
        int followerId, followedId;
        String followDate;
        SocialUser follower, followed;

        public Following(int followerId, int followedId, String followDate,
                         SocialUser follower, SocialUser followed) {
            this.followerId = followerId;
            this.followedId = followedId;
            this.followDate = followDate;
            this.follower = follower;
            this.followed = followed;
        }
    }
}

class EcommerceProduct {
    int id;
    String name;
    double price;

    public EcommerceProduct(int id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    @Override
    public String toString() {
        return String.format("  %s ($%.2f)", name, price);
    }
}

class Category {
    int id;
    String name;

    public Category(int id, String name) {
        this.id = id;
        this.name = name;
    }

    @Override
    public String toString() {
        return "  " + name;
    }
}

class ProductCategoryMapper {
    private List<ProductCategory> mappings = new ArrayList<>();

    public void addToCategory(EcommerceProduct product, Category category, int sortOrder) {
        mappings.add(new ProductCategory(product.id, category.id, sortOrder, product, category));
    }

    public List<EcommerceProduct> getProductsInCategory(Category category) {
        return mappings.stream()
                .filter(m -> m.categoryId == category.id)
                .sorted(Comparator.comparingInt(m -> m.sortOrder))
                .map(m -> m.product)
                .collect(Collectors.toList());
    }

    public List<Category> getCategoriesForProduct(EcommerceProduct product) {
        return mappings.stream()
                .filter(m -> m.productId == product.id)
                .map(m -> m.category)
                .collect(Collectors.toList());
    }

    static class ProductCategory {
        int productId, categoryId, sortOrder;
        EcommerceProduct product;
        Category category;

        public ProductCategory(int productId, int categoryId, int sortOrder,
                               EcommerceProduct product, Category category) {
            this.productId = productId;
            this.categoryId = categoryId;
            this.sortOrder = sortOrder;
            this.product = product;
            this.category = category;
        }
    }
}
