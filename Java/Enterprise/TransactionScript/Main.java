package Enterprise.TransactionScript;

import java.sql.Connection;
import java.sql.DriverManager;

public class Main {
    public static void main(String[] args) {
        try {
            Connection connection = DriverManager.getConnection(
                "jdbc:h2:mem:test", "sa", ""
            );

            TransactionScript script = new TransactionScript(connection);
            System.out.println("TransactionScript pattern: Organizes business logic by procedures");
            System.out.println("Each transaction is handled by a single procedure");

            connection.close();
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
