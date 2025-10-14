package Enterprise.RecordSet;

import java.sql.*;
import java.util.*;

/**
 * RecordSet Pattern Demonstration
 *
 * The RecordSet pattern provides an in-memory representation of tabular data
 * that mimics the behavior of database result sets. It supports navigation,
 * modification, filtering, and CRUD operations on data.
 *
 * Key Benefits:
 * - Disconnected data manipulation
 * - Memory-efficient for small to medium datasets
 * - Familiar interface for database developers
 * - Supports bi-directional navigation
 *
 * Use Cases:
 * - Caching query results
 * - Data transfer between layers
 * - Batch processing
 * - Testing without database
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== RecordSet Pattern Demo ===\n");

        // Scenario 1: Basic RecordSet creation and navigation
        demonstrateBasicNavigation();

        // Scenario 2: RecordSet from database query
        demonstrateDatabaseIntegration();

        // Scenario 3: Modifying data in RecordSet
        demonstrateDataModification();

        // Scenario 4: Filtering and searching
        demonstrateFilteringAndSearching();

        // Scenario 5: Sorting RecordSet data
        demonstrateSorting();

        // Scenario 6: Batch updates
        demonstrateBatchUpdates();

        // Scenario 7: RecordSet serialization
        demonstrateSerialization();

        // Scenario 8: Master-Detail RecordSets
        demonstrateMasterDetail();

        // Scenario 9: Error handling
        demonstrateErrorHandling();

        // Scenario 10: Performance comparison
        demonstratePerformanceComparison();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic RecordSet creation and navigation
     * Demonstrates creating a RecordSet and navigating through rows.
     */
    private static void demonstrateBasicNavigation() {
        System.out.println("--- Scenario 1: Basic Navigation ---");
        try {
            // Create columns
            List<String> columns = Arrays.asList("ID", "Name", "Department", "Salary");
            RecordSetImpl recordSet = new RecordSetImpl(columns);

            // Add sample data
            recordSet.addRow(createEmployeeRow(1, "Alice Johnson", "Engineering", 95000));
            recordSet.addRow(createEmployeeRow(2, "Bob Smith", "Marketing", 75000));
            recordSet.addRow(createEmployeeRow(3, "Carol White", "Engineering", 88000));
            recordSet.addRow(createEmployeeRow(4, "David Brown", "Sales", 82000));
            recordSet.addRow(createEmployeeRow(5, "Eve Davis", "HR", 71000));

            System.out.println("Total rows: " + recordSet.getRowCount());
            System.out.println("Total columns: " + recordSet.getColumnCount());

            // Navigate forward
            System.out.println("\nForward navigation:");
            recordSet.first();
            do {
                printCurrentRow(recordSet);
            } while (recordSet.next());

            // Navigate backward
            System.out.println("\nBackward navigation:");
            recordSet.last();
            do {
                printCurrentRow(recordSet);
            } while (recordSet.previous());

            System.out.println("Navigation successful!\n");
        } catch (Exception e) {
            System.err.println("Error in basic navigation: " + e.getMessage());
        }
    }

    /**
     * Scenario 2: RecordSet from database query
     * Demonstrates loading data from a database into a RecordSet.
     */
    private static void demonstrateDatabaseIntegration() {
        System.out.println("--- Scenario 2: Database Integration ---");
        try {
            // Simulate database connection and query
            Connection conn = createInMemoryDatabase();

            // Execute query and load into RecordSet
            String query = "SELECT employee_id, name, department, salary FROM employees WHERE salary > 70000";
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(query);

            // Convert ResultSet to RecordSet
            RecordSetImpl recordSet = convertResultSetToRecordSet(rs);

            System.out.println("Loaded " + recordSet.getRowCount() + " employees from database");
            System.out.println("Columns: " + recordSet.getColumnNames());

            // Display data
            recordSet.first();
            int count = 0;
            do {
                count++;
                System.out.println(count + ". " +
                    recordSet.getValue("name") + " - " +
                    recordSet.getValue("department") + " - $" +
                    recordSet.getValue("salary"));
            } while (recordSet.next());

            rs.close();
            stmt.close();
            conn.close();
            System.out.println("Database integration successful!\n");
        } catch (Exception e) {
            System.err.println("Error in database integration: " + e.getMessage());
        }
    }

    /**
     * Scenario 3: Modifying data in RecordSet
     * Demonstrates updating, inserting, and deleting rows.
     */
    private static void demonstrateDataModification() {
        System.out.println("--- Scenario 3: Data Modification ---");
        try {
            RecordSetImpl recordSet = createSampleRecordSet();

            System.out.println("Original data count: " + recordSet.getRowCount());

            // Update salary for first employee
            recordSet.first();
            System.out.println("Before update: " + recordSet.getValue("Name") + " - $" + recordSet.getValue("Salary"));
            recordSet.setValue("Salary", 100000);
            System.out.println("After update: " + recordSet.getValue("Name") + " - $" + recordSet.getValue("Salary"));

            // Add new employee
            recordSet.addRow(createEmployeeRow(6, "Frank Miller", "IT", 78000));
            System.out.println("After insert: " + recordSet.getRowCount() + " rows");

            // Delete third employee
            recordSet.first();
            recordSet.next();
            recordSet.next();
            String deletedName = (String) recordSet.getValue("Name");
            recordSet.deleteRow();
            System.out.println("Deleted: " + deletedName);
            System.out.println("After delete: " + recordSet.getRowCount() + " rows");

            System.out.println("Data modification successful!\n");
        } catch (Exception e) {
            System.err.println("Error in data modification: " + e.getMessage());
        }
    }

    /**
     * Scenario 4: Filtering and searching
     * Demonstrates finding specific records based on criteria.
     */
    private static void demonstrateFilteringAndSearching() {
        System.out.println("--- Scenario 4: Filtering and Searching ---");
        try {
            RecordSetImpl recordSet = createSampleRecordSet();

            // Find all Engineering employees
            RecordSetImpl engineeringEmployees = filterByDepartment(recordSet, "Engineering");
            System.out.println("Engineering employees: " + engineeringEmployees.getRowCount());

            engineeringEmployees.first();
            do {
                System.out.println("  - " + engineeringEmployees.getValue("Name") +
                    " ($" + engineeringEmployees.getValue("Salary") + ")");
            } while (engineeringEmployees.next());

            // Find employees with salary > 80000
            RecordSetImpl highEarners = filterBySalaryGreaterThan(recordSet, 80000);
            System.out.println("\nHigh earners (>$80K): " + highEarners.getRowCount());

            highEarners.first();
            do {
                System.out.println("  - " + highEarners.getValue("Name") +
                    " - " + highEarners.getValue("Department") +
                    " ($" + highEarners.getValue("Salary") + ")");
            } while (highEarners.next());

            // Search by name
            String searchName = "Bob";
            RecordSetImpl searchResults = searchByName(recordSet, searchName);
            System.out.println("\nSearch results for '" + searchName + "': " + searchResults.getRowCount());

            if (searchResults.first()) {
                do {
                    System.out.println("  - " + searchResults.getValue("Name"));
                } while (searchResults.next());
            }

            System.out.println("Filtering and searching successful!\n");
        } catch (Exception e) {
            System.err.println("Error in filtering: " + e.getMessage());
        }
    }

    /**
     * Scenario 5: Sorting RecordSet data
     * Demonstrates sorting data by different columns.
     */
    private static void demonstrateSorting() {
        System.out.println("--- Scenario 5: Sorting ---");
        try {
            RecordSetImpl recordSet = createSampleRecordSet();

            // Sort by name
            RecordSetImpl sortedByName = sortByColumn(recordSet, "Name");
            System.out.println("Sorted by Name:");
            sortedByName.first();
            do {
                System.out.println("  " + sortedByName.getValue("Name"));
            } while (sortedByName.next());

            // Sort by salary (descending)
            RecordSetImpl sortedBySalary = sortBySalaryDescending(recordSet);
            System.out.println("\nSorted by Salary (descending):");
            sortedBySalary.first();
            do {
                System.out.println("  " + sortedBySalary.getValue("Name") +
                    " - $" + sortedBySalary.getValue("Salary"));
            } while (sortedBySalary.next());

            System.out.println("Sorting successful!\n");
        } catch (Exception e) {
            System.err.println("Error in sorting: " + e.getMessage());
        }
    }

    /**
     * Scenario 6: Batch updates
     * Demonstrates performing bulk updates on RecordSet.
     */
    private static void demonstrateBatchUpdates() {
        System.out.println("--- Scenario 6: Batch Updates ---");
        try {
            RecordSetImpl recordSet = createSampleRecordSet();

            System.out.println("Applying 10% salary increase to all employees...");

            recordSet.first();
            int updateCount = 0;
            do {
                Integer currentSalary = (Integer) recordSet.getValue("Salary");
                Integer newSalary = (int) (currentSalary * 1.10);
                recordSet.setValue("Salary", newSalary);
                updateCount++;
            } while (recordSet.next());

            System.out.println("Updated " + updateCount + " records");

            // Display updated salaries
            System.out.println("\nUpdated salaries:");
            recordSet.first();
            do {
                System.out.println("  " + recordSet.getValue("Name") +
                    " - $" + recordSet.getValue("Salary"));
            } while (recordSet.next());

            System.out.println("Batch updates successful!\n");
        } catch (Exception e) {
            System.err.println("Error in batch updates: " + e.getMessage());
        }
    }

    /**
     * Scenario 7: RecordSet serialization
     * Demonstrates converting RecordSet to/from portable formats.
     */
    private static void demonstrateSerialization() {
        System.out.println("--- Scenario 7: Serialization ---");
        try {
            RecordSetImpl recordSet = createSampleRecordSet();

            // Convert to XML-like string
            String xml = toXML(recordSet);
            System.out.println("Serialized to XML:");
            System.out.println(xml.substring(0, Math.min(200, xml.length())) + "...");

            // Convert to JSON-like string
            String json = toJSON(recordSet);
            System.out.println("\nSerialized to JSON:");
            System.out.println(json.substring(0, Math.min(200, json.length())) + "...");

            // Convert to CSV
            String csv = toCSV(recordSet);
            System.out.println("\nSerialized to CSV:");
            System.out.println(csv);

            System.out.println("Serialization successful!\n");
        } catch (Exception e) {
            System.err.println("Error in serialization: " + e.getMessage());
        }
    }

    /**
     * Scenario 8: Master-Detail RecordSets
     * Demonstrates hierarchical data with parent-child relationships.
     */
    private static void demonstrateMasterDetail() {
        System.out.println("--- Scenario 8: Master-Detail ---");
        try {
            // Master: Departments
            RecordSetImpl departments = new RecordSetImpl(
                Arrays.asList("DeptID", "DeptName", "Budget")
            );
            departments.addRow(createDeptRow(1, "Engineering", 500000));
            departments.addRow(createDeptRow(2, "Marketing", 300000));
            departments.addRow(createDeptRow(3, "Sales", 400000));

            // Detail: Employees
            RecordSetImpl employees = createSampleRecordSet();

            System.out.println("Master-Detail Relationship:");
            departments.first();
            do {
                String deptName = (String) departments.getValue("DeptName");
                System.out.println("\nDepartment: " + deptName +
                    " (Budget: $" + departments.getValue("Budget") + ")");

                // Find employees in this department
                RecordSetImpl deptEmployees = filterByDepartment(employees, deptName);
                if (deptEmployees.first()) {
                    System.out.println("  Employees:");
                    do {
                        System.out.println("    - " + deptEmployees.getValue("Name") +
                            " ($" + deptEmployees.getValue("Salary") + ")");
                    } while (deptEmployees.next());
                }
            } while (departments.next());

            System.out.println("\nMaster-Detail successful!\n");
        } catch (Exception e) {
            System.err.println("Error in master-detail: " + e.getMessage());
        }
    }

    /**
     * Scenario 9: Error handling
     * Demonstrates proper error handling in RecordSet operations.
     */
    private static void demonstrateErrorHandling() {
        System.out.println("--- Scenario 9: Error Handling ---");

        // Test 1: Access without positioning
        try {
            RecordSetImpl recordSet = new RecordSetImpl(Arrays.asList("ID", "Name"));
            recordSet.getValue("Name"); // Should throw exception
            System.out.println("ERROR: Should have thrown exception!");
        } catch (IllegalStateException e) {
            System.out.println("Correctly caught: " + e.getMessage());
        }

        // Test 2: Add column after data added
        try {
            RecordSetImpl recordSet = new RecordSetImpl(Arrays.asList("ID"));
            recordSet.addRow(Collections.singletonMap("ID", 1));
            recordSet.addColumn("Name"); // Should throw exception
            System.out.println("ERROR: Should have thrown exception!");
        } catch (IllegalStateException e) {
            System.out.println("Correctly caught: " + e.getMessage());
        }

        // Test 3: Navigation on empty RecordSet
        try {
            RecordSetImpl recordSet = new RecordSetImpl(Arrays.asList("ID"));
            boolean moved = recordSet.first();
            System.out.println("Move on empty RecordSet returned: " + moved);
            if (moved) {
                System.out.println("ERROR: Should return false!");
            } else {
                System.out.println("Correctly handled empty RecordSet");
            }
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
        }

        // Test 4: Delete from empty position
        try {
            RecordSetImpl recordSet = new RecordSetImpl(Arrays.asList("ID"));
            recordSet.deleteRow(); // Should throw exception
            System.out.println("ERROR: Should have thrown exception!");
        } catch (IllegalStateException e) {
            System.out.println("Correctly caught: " + e.getMessage());
        }

        System.out.println("Error handling successful!\n");
    }

    /**
     * Scenario 10: Performance comparison
     * Demonstrates performance characteristics of RecordSet operations.
     */
    private static void demonstratePerformanceComparison() {
        System.out.println("--- Scenario 10: Performance Comparison ---");
        try {
            int[] sizes = {100, 1000, 10000};

            for (int size : sizes) {
                RecordSetImpl recordSet = createLargeRecordSet(size);

                // Test navigation performance
                long startTime = System.nanoTime();
                recordSet.first();
                int count = 0;
                do {
                    count++;
                } while (recordSet.next());
                long endTime = System.nanoTime();
                double milliseconds = (endTime - startTime) / 1_000_000.0;

                System.out.println("Size: " + size + " rows");
                System.out.println("  Navigation time: " + String.format("%.3f", milliseconds) + " ms");
                System.out.println("  Rows processed: " + count);

                // Test update performance
                startTime = System.nanoTime();
                recordSet.first();
                do {
                    recordSet.setValue("Salary", 50000);
                } while (recordSet.next());
                endTime = System.nanoTime();
                milliseconds = (endTime - startTime) / 1_000_000.0;

                System.out.println("  Update time: " + String.format("%.3f", milliseconds) + " ms\n");
            }

            System.out.println("Performance comparison successful!\n");
        } catch (Exception e) {
            System.err.println("Error in performance comparison: " + e.getMessage());
        }
    }

    // Helper methods

    private static Map<String, Object> createEmployeeRow(int id, String name, String dept, int salary) {
        Map<String, Object> row = new HashMap<>();
        row.put("ID", id);
        row.put("Name", name);
        row.put("Department", dept);
        row.put("Salary", salary);
        return row;
    }

    private static Map<String, Object> createDeptRow(int id, String name, int budget) {
        Map<String, Object> row = new HashMap<>();
        row.put("DeptID", id);
        row.put("DeptName", name);
        row.put("Budget", budget);
        return row;
    }

    private static void printCurrentRow(RecordSetImpl recordSet) {
        System.out.println("  " + recordSet.getValue("ID") + " - " +
            recordSet.getValue("Name") + " (" +
            recordSet.getValue("Department") + ") - $" +
            recordSet.getValue("Salary"));
    }

    private static RecordSetImpl createSampleRecordSet() {
        List<String> columns = Arrays.asList("ID", "Name", "Department", "Salary");
        RecordSetImpl recordSet = new RecordSetImpl(columns);
        recordSet.addRow(createEmployeeRow(1, "Alice Johnson", "Engineering", 95000));
        recordSet.addRow(createEmployeeRow(2, "Bob Smith", "Marketing", 75000));
        recordSet.addRow(createEmployeeRow(3, "Carol White", "Engineering", 88000));
        recordSet.addRow(createEmployeeRow(4, "David Brown", "Sales", 82000));
        recordSet.addRow(createEmployeeRow(5, "Eve Davis", "HR", 71000));
        return recordSet;
    }

    private static RecordSetImpl filterByDepartment(RecordSetImpl source, String department) {
        RecordSetImpl filtered = new RecordSetImpl(source.getColumnNames());
        source.first();
        do {
            if (department.equals(source.getValue("Department"))) {
                Map<String, Object> row = new HashMap<>();
                for (String col : source.getColumnNames()) {
                    row.put(col, source.getValue(col));
                }
                filtered.addRow(row);
            }
        } while (source.next());
        return filtered;
    }

    private static RecordSetImpl filterBySalaryGreaterThan(RecordSetImpl source, int minSalary) {
        RecordSetImpl filtered = new RecordSetImpl(source.getColumnNames());
        source.first();
        do {
            Integer salary = (Integer) source.getValue("Salary");
            if (salary > minSalary) {
                Map<String, Object> row = new HashMap<>();
                for (String col : source.getColumnNames()) {
                    row.put(col, source.getValue(col));
                }
                filtered.addRow(row);
            }
        } while (source.next());
        return filtered;
    }

    private static RecordSetImpl searchByName(RecordSetImpl source, String searchTerm) {
        RecordSetImpl results = new RecordSetImpl(source.getColumnNames());
        source.first();
        do {
            String name = (String) source.getValue("Name");
            if (name.toLowerCase().contains(searchTerm.toLowerCase())) {
                Map<String, Object> row = new HashMap<>();
                for (String col : source.getColumnNames()) {
                    row.put(col, source.getValue(col));
                }
                results.addRow(row);
            }
        } while (source.next());
        return results;
    }

    private static RecordSetImpl sortByColumn(RecordSetImpl source, String columnName) {
        List<Map<String, Object>> rows = new ArrayList<>();
        source.first();
        do {
            Map<String, Object> row = new HashMap<>();
            for (String col : source.getColumnNames()) {
                row.put(col, source.getValue(col));
            }
            rows.add(row);
        } while (source.next());

        rows.sort((r1, r2) -> {
            Object v1 = r1.get(columnName);
            Object v2 = r2.get(columnName);
            if (v1 instanceof Comparable) {
                return ((Comparable) v1).compareTo(v2);
            }
            return 0;
        });

        RecordSetImpl sorted = new RecordSetImpl(source.getColumnNames());
        for (Map<String, Object> row : rows) {
            sorted.addRow(row);
        }
        return sorted;
    }

    private static RecordSetImpl sortBySalaryDescending(RecordSetImpl source) {
        List<Map<String, Object>> rows = new ArrayList<>();
        source.first();
        do {
            Map<String, Object> row = new HashMap<>();
            for (String col : source.getColumnNames()) {
                row.put(col, source.getValue(col));
            }
            rows.add(row);
        } while (source.next());

        rows.sort((r1, r2) -> {
            Integer s1 = (Integer) r1.get("Salary");
            Integer s2 = (Integer) r2.get("Salary");
            return s2.compareTo(s1);
        });

        RecordSetImpl sorted = new RecordSetImpl(source.getColumnNames());
        for (Map<String, Object> row : rows) {
            sorted.addRow(row);
        }
        return sorted;
    }

    private static String toXML(RecordSetImpl recordSet) {
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\"?>\n<RecordSet>\n");
        recordSet.first();
        do {
            xml.append("  <Row>\n");
            for (String col : recordSet.getColumnNames()) {
                xml.append("    <").append(col).append(">")
                   .append(recordSet.getValue(col))
                   .append("</").append(col).append(">\n");
            }
            xml.append("  </Row>\n");
        } while (recordSet.next());
        xml.append("</RecordSet>");
        return xml.toString();
    }

    private static String toJSON(RecordSetImpl recordSet) {
        StringBuilder json = new StringBuilder("[\n");
        recordSet.first();
        boolean first = true;
        do {
            if (!first) json.append(",\n");
            json.append("  {\n");
            boolean firstCol = true;
            for (String col : recordSet.getColumnNames()) {
                if (!firstCol) json.append(",\n");
                json.append("    \"").append(col).append("\": ");
                Object value = recordSet.getValue(col);
                if (value instanceof String) {
                    json.append("\"").append(value).append("\"");
                } else {
                    json.append(value);
                }
                firstCol = false;
            }
            json.append("\n  }");
            first = false;
        } while (recordSet.next());
        json.append("\n]");
        return json.toString();
    }

    private static String toCSV(RecordSetImpl recordSet) {
        StringBuilder csv = new StringBuilder();

        // Header
        List<String> columns = recordSet.getColumnNames();
        csv.append(String.join(",", columns)).append("\n");

        // Data
        recordSet.first();
        do {
            List<String> values = new ArrayList<>();
            for (String col : columns) {
                values.add(String.valueOf(recordSet.getValue(col)));
            }
            csv.append(String.join(",", values)).append("\n");
        } while (recordSet.next());

        return csv.toString();
    }

    private static Connection createInMemoryDatabase() throws SQLException {
        Connection conn = DriverManager.getConnection("jdbc:h2:mem:test");
        Statement stmt = conn.createStatement();

        stmt.execute("CREATE TABLE employees (" +
            "employee_id INT PRIMARY KEY, " +
            "name VARCHAR(100), " +
            "department VARCHAR(50), " +
            "salary INT)");

        stmt.execute("INSERT INTO employees VALUES (1, 'Alice Johnson', 'Engineering', 95000)");
        stmt.execute("INSERT INTO employees VALUES (2, 'Bob Smith', 'Marketing', 75000)");
        stmt.execute("INSERT INTO employees VALUES (3, 'Carol White', 'Engineering', 88000)");
        stmt.execute("INSERT INTO employees VALUES (4, 'David Brown', 'Sales', 82000)");
        stmt.execute("INSERT INTO employees VALUES (5, 'Eve Davis', 'HR', 71000)");

        stmt.close();
        return conn;
    }

    private static RecordSetImpl convertResultSetToRecordSet(ResultSet rs) throws SQLException {
        ResultSetMetaData metaData = rs.getMetaData();
        int columnCount = metaData.getColumnCount();

        List<String> columns = new ArrayList<>();
        for (int i = 1; i <= columnCount; i++) {
            columns.add(metaData.getColumnName(i));
        }

        RecordSetImpl recordSet = new RecordSetImpl(columns);

        while (rs.next()) {
            Map<String, Object> row = new HashMap<>();
            for (int i = 1; i <= columnCount; i++) {
                row.put(metaData.getColumnName(i), rs.getObject(i));
            }
            recordSet.addRow(row);
        }

        return recordSet;
    }

    private static RecordSetImpl createLargeRecordSet(int size) {
        RecordSetImpl recordSet = new RecordSetImpl(
            Arrays.asList("ID", "Name", "Department", "Salary")
        );

        String[] departments = {"Engineering", "Marketing", "Sales", "HR", "IT"};
        for (int i = 0; i < size; i++) {
            recordSet.addRow(createEmployeeRow(
                i,
                "Employee" + i,
                departments[i % departments.length],
                50000 + (i % 50000)
            ));
        }

        return recordSet;
    }
}
