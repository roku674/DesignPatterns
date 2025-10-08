/**
 * Singleton Pattern Implementation - Thread-Safe Database Connection
 *
 * This class demonstrates the Singleton pattern using the Bill Pugh Singleton Design
 * which is thread-safe without requiring synchronization.
 */
public class DatabaseConnection {

    private String connectionString;
    private boolean isConnected;

    /**
     * Private constructor prevents instantiation from other classes
     */
    private DatabaseConnection() {
        this.connectionString = "jdbc:mysql://localhost:3306/mydb";
        this.isConnected = false;
        System.out.println("DatabaseConnection instance created");
    }

    /**
     * Static inner class - inner classes are not loaded until they are referenced.
     * This provides thread-safe lazy initialization without synchronization overhead.
     */
    private static class SingletonHelper {
        private static final DatabaseConnection INSTANCE = new DatabaseConnection();
    }

    /**
     * Global access point to get the singleton instance
     *
     * @return the single instance of DatabaseConnection
     */
    public static DatabaseConnection getInstance() {
        return SingletonHelper.INSTANCE;
    }

    /**
     * Connects to the database
     */
    public void connect() {
        if (!isConnected) {
            isConnected = true;
            System.out.println("Connected to database: " + connectionString);
        } else {
            System.out.println("Already connected to database");
        }
    }

    /**
     * Disconnects from the database
     */
    public void disconnect() {
        if (isConnected) {
            isConnected = false;
            System.out.println("Disconnected from database");
        } else {
            System.out.println("Already disconnected");
        }
    }

    /**
     * Executes a query on the database
     *
     * @param query the SQL query to execute
     */
    public void executeQuery(String query) {
        if (isConnected) {
            System.out.println("Executing query: " + query);
        } else {
            System.out.println("Error: Not connected to database");
        }
    }

    /**
     * Gets the connection status
     *
     * @return true if connected, false otherwise
     */
    public boolean isConnected() {
        return isConnected;
    }
}
