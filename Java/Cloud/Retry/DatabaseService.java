package Cloud.Retry;

/**
 * Simulates a database service with connection failures.
 */
public class DatabaseService {
    private final String databaseName;
    private int failuresRemaining;

    public DatabaseService(String databaseName, int initialFailures) {
        this.databaseName = databaseName;
        this.failuresRemaining = initialFailures;
    }

    public String connect() throws TimeoutException {
        if (failuresRemaining > 0) {
            failuresRemaining--;
            throw new TimeoutException("Database connection timeout for " + databaseName);
        }
        return "Connected to database: " + databaseName;
    }
}
