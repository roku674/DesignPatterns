import java.util.List;
import java.util.Map;

/**
 * Abstraction - defines high-level database operations interface
 */
public class RemoteControl {
    protected Device device;

    public RemoteControl(Device device) {
        this.device = device;
    }

    public void open() throws Exception {
        System.out.println("RemoteControl: Opening database connection");
        device.connect();
    }

    public void close() throws Exception {
        System.out.println("RemoteControl: Closing database connection");
        device.disconnect();
    }

    public List<Map<String, Object>> findAll(String tableName) throws Exception {
        if (!device.isConnected()) {
            throw new Exception("Database not connected");
        }
        System.out.println("RemoteControl: Finding all records from " + tableName);
        return device.executeQuery("SELECT * FROM " + tableName);
    }

    public int insert(String tableName, Map<String, Object> data) throws Exception {
        if (!device.isConnected()) {
            throw new Exception("Database not connected");
        }
        System.out.println("RemoteControl: Inserting record into " + tableName);
        return device.executeUpdate("INSERT INTO " + tableName + " VALUES (...)");
    }

    public String getDatabaseInfo() {
        return "Connected to: " + device.getDatabaseType();
    }
}
