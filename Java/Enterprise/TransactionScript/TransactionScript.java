package Enterprise.TransactionScript;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class TransactionScript {
    private Connection connection;

    public TransactionScript(Connection connection) {
        this.connection = connection;
    }

    public void processRevenue(int contractId) throws SQLException {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            connection.setAutoCommit(false);

            stmt = connection.prepareStatement(
                "SELECT revenue, recognizedRevenue FROM contracts WHERE id = ?"
            );
            stmt.setInt(1, contractId);
            rs = stmt.executeQuery();

            if (rs.next()) {
                BigDecimal revenue = rs.getBigDecimal("revenue");
                BigDecimal recognizedRevenue = rs.getBigDecimal("recognizedRevenue");
                BigDecimal toRecognize = revenue.subtract(recognizedRevenue);

                if (toRecognize.compareTo(BigDecimal.ZERO) > 0) {
                    PreparedStatement updateStmt = connection.prepareStatement(
                        "UPDATE contracts SET recognizedRevenue = ? WHERE id = ?"
                    );
                    updateStmt.setBigDecimal(1, revenue);
                    updateStmt.setInt(2, contractId);
                    updateStmt.executeUpdate();
                    updateStmt.close();
                }
            }

            connection.commit();
        } catch (SQLException e) {
            connection.rollback();
            throw e;
        } finally {
            if (rs != null) rs.close();
            if (stmt != null) stmt.close();
        }
    }
}
