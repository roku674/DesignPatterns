import java.sql.ResultSet;
import java.util.List;
import java.util.Map;

/**
 * Implementation interface - defines database operations
 */
public interface Device {
    /**
     * Connects to the database
     */
    void connect() throws Exception;

    /**
     * Disconnects from the database
     */
    void disconnect() throws Exception;

    /**
     * Checks if connected
     */
    boolean isConnected();

    /**
     * Executes a query and returns results
     */
    List<Map<String, Object>> executeQuery(String query) throws Exception;

    /**
     * Executes an update/insert/delete command
     */
    int executeUpdate(String query) throws Exception;

    /**
     * Gets the database type
     */
    String getDatabaseType();
}
