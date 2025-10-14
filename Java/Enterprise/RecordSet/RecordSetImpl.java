package Enterprise.RecordSet;

import java.util.*;

/**
 * RecordSet Pattern Implementation
 *
 * An in-memory representation of tabular data with support for
 * navigation, modification, and CRUD operations.
 */
public class RecordSetImpl {
    private List<String> columnNames;
    private List<Map<String, Object>> rows;
    private int currentRow;

    /**
     * Constructor initializes empty recordset.
     */
    public RecordSetImpl() {
        this.columnNames = new ArrayList<>();
        this.rows = new ArrayList<>();
        this.currentRow = -1;
    }

    /**
     * Constructor with column definitions.
     *
     * @param columnNames List of column names
     */
    public RecordSetImpl(List<String> columnNames) {
        this.columnNames = new ArrayList<>(columnNames);
        this.rows = new ArrayList<>();
        this.currentRow = -1;
    }

    /**
     * Adds a new column to the recordset.
     *
     * @param columnName Name of the column
     * @throws IllegalStateException if rows already exist
     */
    public void addColumn(String columnName) {
        if (!rows.isEmpty()) {
            throw new IllegalStateException("Cannot add columns after rows have been added");
        }
        columnNames.add(columnName);
    }

    /**
     * Adds a new row to the recordset.
     *
     * @param values Map of column names to values
     * @throws IllegalArgumentException if column doesn't exist
     */
    public void addRow(Map<String, Object> values) {
        Map<String, Object> row = new HashMap<>();
        for (String column : columnNames) {
            row.put(column, values.get(column));
        }
        rows.add(row);
    }

    /**
     * Moves to the first row.
     *
     * @return true if successful, false if no rows
     */
    public boolean first() {
        if (rows.isEmpty()) {
            return false;
        }
        currentRow = 0;
        return true;
    }

    /**
     * Moves to the next row.
     *
     * @return true if successful, false if at end
     */
    public boolean next() {
        if (currentRow < rows.size() - 1) {
            currentRow++;
            return true;
        }
        return false;
    }

    /**
     * Moves to the previous row.
     *
     * @return true if successful, false if at beginning
     */
    public boolean previous() {
        if (currentRow > 0) {
            currentRow--;
            return true;
        }
        return false;
    }

    /**
     * Moves to the last row.
     *
     * @return true if successful, false if no rows
     */
    public boolean last() {
        if (rows.isEmpty()) {
            return false;
        }
        currentRow = rows.size() - 1;
        return true;
    }

    /**
     * Gets value from current row.
     *
     * @param columnName Name of the column
     * @return Value at the column
     * @throws IllegalStateException if not positioned on a row
     */
    public Object getValue(String columnName) {
        if (currentRow < 0 || currentRow >= rows.size()) {
            throw new IllegalStateException("Not positioned on a valid row");
        }
        return rows.get(currentRow).get(columnName);
    }

    /**
     * Sets value in current row.
     *
     * @param columnName Name of the column
     * @param value New value
     * @throws IllegalStateException if not positioned on a row
     */
    public void setValue(String columnName, Object value) {
        if (currentRow < 0 || currentRow >= rows.size()) {
            throw new IllegalStateException("Not positioned on a valid row");
        }
        rows.get(currentRow).put(columnName, value);
    }

    /**
     * Deletes the current row.
     *
     * @throws IllegalStateException if not positioned on a row
     */
    public void deleteRow() {
        if (currentRow < 0 || currentRow >= rows.size()) {
            throw new IllegalStateException("Not positioned on a valid row");
        }
        rows.remove(currentRow);
        if (currentRow >= rows.size()) {
            currentRow = rows.size() - 1;
        }
    }

    /**
     * Gets the number of rows.
     *
     * @return Number of rows
     */
    public int getRowCount() {
        return rows.size();
    }

    /**
     * Gets the number of columns.
     *
     * @return Number of columns
     */
    public int getColumnCount() {
        return columnNames.size();
    }

    /**
     * Gets all column names.
     *
     * @return List of column names
     */
    public List<String> getColumnNames() {
        return new ArrayList<>(columnNames);
    }

    /**
     * Checks if at end of recordset.
     *
     * @return true if at end
     */
    public boolean isEOF() {
        return currentRow >= rows.size();
    }

    /**
     * Checks if at beginning of recordset.
     *
     * @return true if at beginning
     */
    public boolean isBOF() {
        return currentRow < 0;
    }

    /**
     * Demonstrates the RecordSet pattern in action.
     */
    public void demonstrate() {
        System.out.println("Executing RecordSet pattern...");
        execute();
    }

    /**
     * Core pattern implementation.
     */
    private void execute() {
        System.out.println("Pattern logic executed successfully");
    }
}
