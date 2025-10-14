package Enterprise.ActiveRecord;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * ActiveRecord Pattern Implementation
 *
 * An object that wraps a row in a database table, encapsulates database access,
 * and adds domain logic on that data. Each Active Record object handles its own
 * persistence and contains both data and behavior.
 *
 * Key characteristics:
 * - One-to-one mapping with database table
 * - Contains both data and database operations
 * - Includes domain logic
 * - Persistence methods (save, delete, load)
 * - Static finder methods
 */
public class ActiveRecordImpl {
    private static final AtomicLong idGenerator = new AtomicLong(1);
    private static final Map<Long, PersonActiveRecord> storage = new HashMap<>();

    /**
     * Demonstrates the ActiveRecord pattern with comprehensive examples.
     */
    public void demonstrate() {
        System.out.println("Executing ActiveRecord pattern...\n");

        // Example 1: Create and Save
        demonstrateCreateAndSave();

        // Example 2: Load and Update
        demonstrateLoadAndUpdate();

        // Example 3: Finder Methods
        demonstrateFinders();

        // Example 4: Domain Logic
        demonstrateDomainLogic();

        // Example 5: Delete
        demonstrateDelete();

        // Example 6: Validation
        demonstrateValidation();

        System.out.println("\nPattern logic executed successfully");
    }

    private void demonstrateCreateAndSave() {
        System.out.println("1. Create and Save:");

        PersonActiveRecord person = new PersonActiveRecord("John Doe", "john@example.com", 30);
        person.save();

        System.out.println("   Created and saved: " + person);
        System.out.println("   Assigned ID: " + person.getId());
    }

    private void demonstrateLoadAndUpdate() {
        System.out.println("\n2. Load and Update:");

        // Create initial record
        PersonActiveRecord person = new PersonActiveRecord("Jane Smith", "jane@example.com", 25);
        person.save();
        Long id = person.getId();

        // Load from storage
        PersonActiveRecord loaded = PersonActiveRecord.find(id);
        System.out.println("   Loaded: " + loaded);

        // Update
        loaded.setEmail("jane.updated@example.com");
        loaded.incrementAge();
        loaded.save();

        System.out.println("   Updated: " + PersonActiveRecord.find(id));
    }

    private void demonstrateFinders() {
        System.out.println("\n3. Finder Methods:");

        // Create test data
        PersonActiveRecord p1 = new PersonActiveRecord("Alice", "alice@example.com", 28);
        PersonActiveRecord p2 = new PersonActiveRecord("Bob", "bob@example.com", 35);
        PersonActiveRecord p3 = new PersonActiveRecord("Charlie", "charlie@example.com", 22);
        p1.save();
        p2.save();
        p3.save();

        // Find all
        List<PersonActiveRecord> all = PersonActiveRecord.findAll();
        System.out.println("   Total persons: " + all.size());

        // Find by email
        PersonActiveRecord found = PersonActiveRecord.findByEmail("bob@example.com");
        System.out.println("   Found by email: " + found.getName());

        // Find by age range
        List<PersonActiveRecord> youngAdults = PersonActiveRecord.findByAgeRange(20, 30);
        System.out.println("   Young adults (20-30): " + youngAdults.size());
    }

    private void demonstrateDomainLogic() {
        System.out.println("\n4. Domain Logic:");

        PersonActiveRecord person = new PersonActiveRecord("David", "david@example.com", 17);
        person.save();

        System.out.println("   Person: " + person.getName() + ", Age: " + person.getAge());
        System.out.println("   Is adult: " + person.isAdult());
        System.out.println("   Can vote: " + person.canVote());
        System.out.println("   Age category: " + person.getAgeCategory());

        // Have birthday
        person.haveBirthday();
        System.out.println("   After birthday: Age = " + person.getAge());
        System.out.println("   Is adult now: " + person.isAdult());
    }

    private void demonstrateDelete() {
        System.out.println("\n5. Delete:");

        PersonActiveRecord person = new PersonActiveRecord("Temp User", "temp@example.com", 20);
        person.save();
        Long id = person.getId();

        System.out.println("   Created temp user with ID: " + id);
        System.out.println("   Total before delete: " + PersonActiveRecord.findAll().size());

        person.delete();
        System.out.println("   Deleted user");
        System.out.println("   Total after delete: " + PersonActiveRecord.findAll().size());
    }

    private void demonstrateValidation() {
        System.out.println("\n6. Validation:");

        try {
            PersonActiveRecord invalid = new PersonActiveRecord("", "invalid-email", -5);
            invalid.save();
        } catch (IllegalStateException e) {
            System.out.println("   Validation caught: " + e.getMessage());
        }

        try {
            PersonActiveRecord person = new PersonActiveRecord("Valid Name", "valid@example.com", 25);
            person.save();
            person.setEmail(""); // Invalid
            person.save();
        } catch (IllegalStateException e) {
            System.out.println("   Update validation caught: " + e.getMessage());
        }
    }

    /**
     * Example Active Record class
     */
    public static class PersonActiveRecord {
        private Long id;
        private String name;
        private String email;
        private int age;

        public PersonActiveRecord(String name, String email, int age) {
            this.name = name;
            this.email = email;
            this.age = age;
        }

        private PersonActiveRecord(Long id, String name, String email, int age) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.age = age;
        }

        // Persistence methods
        public void save() {
            validate();
            if (id == null) {
                insert();
            } else {
                update();
            }
        }

        private void insert() {
            this.id = idGenerator.getAndIncrement();
            storage.put(this.id, this);
        }

        private void update() {
            if (!storage.containsKey(this.id)) {
                throw new IllegalStateException("Person not found for update: " + id);
            }
            storage.put(this.id, this);
        }

        public void delete() {
            if (id != null) {
                storage.remove(id);
                id = null;
            }
        }

        // Finder methods (static)
        public static PersonActiveRecord find(Long id) {
            PersonActiveRecord person = storage.get(id);
            if (person == null) {
                throw new IllegalArgumentException("Person not found: " + id);
            }
            return person;
        }

        public static List<PersonActiveRecord> findAll() {
            return new ArrayList<>(storage.values());
        }

        public static PersonActiveRecord findByEmail(String email) {
            return storage.values().stream()
                    .filter(p -> p.getEmail().equals(email))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Person not found with email: " + email));
        }

        public static List<PersonActiveRecord> findByAgeRange(int minAge, int maxAge) {
            List<PersonActiveRecord> result = new ArrayList<>();
            for (PersonActiveRecord person : storage.values()) {
                if (person.getAge() >= minAge && person.getAge() <= maxAge) {
                    result.add(person);
                }
            }
            return result;
        }

        // Domain logic
        public boolean isAdult() {
            return age >= 18;
        }

        public boolean canVote() {
            return age >= 18;
        }

        public String getAgeCategory() {
            if (age < 13) return "Child";
            if (age < 20) return "Teenager";
            if (age < 65) return "Adult";
            return "Senior";
        }

        public void haveBirthday() {
            age++;
            if (id != null) {
                save();
            }
        }

        public void incrementAge() {
            age++;
        }

        // Validation
        private void validate() {
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalStateException("Name cannot be empty");
            }
            if (email == null || !email.contains("@")) {
                throw new IllegalStateException("Invalid email format");
            }
            if (age < 0 || age > 150) {
                throw new IllegalStateException("Age must be between 0 and 150");
            }
        }

        // Getters and setters
        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public int getAge() {
            return age;
        }

        public void setAge(int age) {
            this.age = age;
        }

        @Override
        public String toString() {
            return "Person{id=" + id + ", name='" + name + "', email='" + email + "', age=" + age + "}";
        }
    }
}
