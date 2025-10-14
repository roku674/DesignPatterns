package Enterprise.Base;

/**
 * Example service that can be registered in the Registry
 */
public class DatabaseConnection {
    private final String connectionString;

    public DatabaseConnection(String connectionString) {
        this.connectionString = connectionString;
    }

    public String getConnectionString() {
        return connectionString;
    }

    public void executeQuery(String query) {
        System.out.println("Executing query: " + query);
    }
}
