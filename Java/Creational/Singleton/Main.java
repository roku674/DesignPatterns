/**
 * Main class to demonstrate the Singleton pattern
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Singleton Pattern Demo ===\n");

        // Get the singleton instance
        DatabaseConnection db1 = DatabaseConnection.getInstance();
        db1.connect();
        db1.executeQuery("SELECT * FROM users");

        System.out.println();

        // Try to get another instance - should return the same object
        DatabaseConnection db2 = DatabaseConnection.getInstance();
        db2.executeQuery("INSERT INTO users VALUES (1, 'John')");

        System.out.println();

        // Verify both references point to the same instance
        System.out.println("Are db1 and db2 the same instance? " + (db1 == db2));
        System.out.println("db1 hashCode: " + db1.hashCode());
        System.out.println("db2 hashCode: " + db2.hashCode());

        System.out.println();

        // Disconnect using db1
        db1.disconnect();

        // Try to execute query using db2 - should show disconnected
        db2.executeQuery("SELECT * FROM products");
    }
}
