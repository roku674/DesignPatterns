import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.Properties;

/**
 * Singleton Pattern Implementation - Real Thread-Safe Connection Pool
 *
 * This class demonstrates a production-ready Singleton pattern with an actual
 * JDBC connection pool that manages multiple database connections efficiently.
 * Uses the Bill Pugh Singleton Design for thread-safe lazy initialization.
 */
public class DatabaseConnection {

    private final String jdbcUrl;
    private final String username;
    private final String password;
    private final BlockingQueue<Connection> connectionPool;
    private final int maxPoolSize;
    private int currentPoolSize;
    private volatile boolean isShutdown;

    /**
     * Private constructor prevents instantiation from other classes
     */
    private DatabaseConnection() {
        this.jdbcUrl = "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1";
        this.username = "sa";
        this.password = "";
        this.maxPoolSize = 10;
        this.currentPoolSize = 0;
        this.isShutdown = false;
        this.connectionPool = new ArrayBlockingQueue<>(maxPoolSize);

        try {
            Class.forName("org.h2.Driver");
            initializePool(3);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("H2 Database Driver not found", e);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to initialize connection pool", e);
        }
    }

    /**
     * Static inner class - provides thread-safe lazy initialization
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
     * Initializes the connection pool with a specified number of connections
     *
     * @param initialSize number of connections to create initially
     * @throws SQLException if connection creation fails
     */
    private void initializePool(int initialSize) throws SQLException {
        for (int i = 0; i < initialSize && i < maxPoolSize; i++) {
            connectionPool.offer(createNewConnection());
            currentPoolSize++;
        }
    }

    /**
     * Creates a new database connection
     *
     * @return a new Connection object
     * @throws SQLException if connection cannot be established
     */
    private Connection createNewConnection() throws SQLException {
        Properties props = new Properties();
        props.setProperty("user", username);
        props.setProperty("password", password);

        Connection conn = DriverManager.getConnection(jdbcUrl, props);
        conn.setAutoCommit(true);
        return conn;
    }

    /**
     * Gets a connection from the pool or creates a new one if available
     *
     * @return a database Connection
     * @throws SQLException if unable to get a connection
     * @throws IllegalStateException if pool is shutdown
     */
    public Connection getConnection() throws SQLException {
        if (isShutdown) {
            throw new IllegalStateException("Connection pool has been shut down");
        }

        Connection conn = null;
        try {
            conn = connectionPool.poll(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new SQLException("Interrupted while waiting for connection", e);
        }

        if (conn == null) {
            synchronized (this) {
                if (currentPoolSize < maxPoolSize) {
                    conn = createNewConnection();
                    currentPoolSize++;
                } else {
                    throw new SQLException("Connection pool exhausted, max size: " + maxPoolSize);
                }
            }
        }

        if (conn != null && conn.isClosed()) {
            synchronized (this) {
                currentPoolSize--;
            }
            return getConnection();
        }

        return conn;
    }

    /**
     * Returns a connection back to the pool
     *
     * @param conn the connection to return
     */
    public void releaseConnection(Connection conn) {
        if (conn == null || isShutdown) {
            return;
        }

        try {
            if (!conn.isClosed()) {
                if (!connectionPool.offer(conn)) {
                    conn.close();
                    synchronized (this) {
                        currentPoolSize--;
                    }
                }
            } else {
                synchronized (this) {
                    currentPoolSize--;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error releasing connection: " + e.getMessage());
        }
    }

    /**
     * Executes a SQL query and returns the result set
     *
     * @param query the SQL query to execute
     * @return ResultSet containing query results
     * @throws SQLException if query execution fails
     */
    public ResultSet executeQuery(String query) throws SQLException {
        Connection conn = getConnection();
        try {
            PreparedStatement stmt = conn.prepareStatement(query);
            return stmt.executeQuery();
        } catch (SQLException e) {
            releaseConnection(conn);
            throw e;
        }
    }

    /**
     * Executes a SQL update statement (INSERT, UPDATE, DELETE)
     *
     * @param sql the SQL statement to execute
     * @return number of rows affected
     * @throws SQLException if execution fails
     */
    public int executeUpdate(String sql) throws SQLException {
        Connection conn = getConnection();
        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            int result = stmt.executeUpdate();
            stmt.close();
            return result;
        } finally {
            releaseConnection(conn);
        }
    }

    /**
     * Executes a parameterized query with prepared statement
     *
     * @param sql the SQL with placeholders
     * @param params parameters to bind to the query
     * @return ResultSet containing query results
     * @throws SQLException if execution fails
     */
    public ResultSet executePreparedQuery(String sql, Object... params) throws SQLException {
        Connection conn = getConnection();
        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            for (int i = 0; i < params.length; i++) {
                stmt.setObject(i + 1, params[i]);
            }
            return stmt.executeQuery();
        } catch (SQLException e) {
            releaseConnection(conn);
            throw e;
        }
    }

    /**
     * Gets the current size of the connection pool
     *
     * @return number of connections in the pool
     */
    public int getPoolSize() {
        return currentPoolSize;
    }

    /**
     * Gets the number of available connections
     *
     * @return number of available connections
     */
    public int getAvailableConnections() {
        return connectionPool.size();
    }

    /**
     * Shuts down the connection pool and closes all connections
     */
    public void shutdown() {
        isShutdown = true;
        Connection conn;
        while ((conn = connectionPool.poll()) != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                System.err.println("Error closing connection: " + e.getMessage());
            }
        }
        currentPoolSize = 0;
    }

    /**
     * Checks if the pool is shutdown
     *
     * @return true if shutdown, false otherwise
     */
    public boolean isShutdown() {
        return isShutdown;
    }
}
