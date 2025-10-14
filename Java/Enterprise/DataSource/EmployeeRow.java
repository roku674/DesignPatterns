package Enterprise.DataSource;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Row Data Gateway Pattern
 * Object that acts as a gateway to a single database row
 */
public class EmployeeRow {
    private static final AtomicLong idGenerator = new AtomicLong(1);
    private static final Map<Long, EmployeeRow> storage = new HashMap<>();

    private Long id;
    private String name;
    private String department;
    private double salary;

    public EmployeeRow(String name, String department, double salary) {
        this.name = name;
        this.department = department;
        this.salary = salary;
    }

    private EmployeeRow(Long id, String name, String department, double salary) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.salary = salary;
    }

    public void insert() {
        if (id != null) {
            throw new IllegalStateException("Employee already inserted");
        }
        this.id = idGenerator.getAndIncrement();
        storage.put(this.id, this);
    }

    public void update() {
        if (id == null) {
            throw new IllegalStateException("Employee not yet inserted");
        }
        storage.put(id, this);
    }

    public void delete() {
        if (id == null) {
            throw new IllegalStateException("Employee not yet inserted");
        }
        storage.remove(id);
    }

    public static EmployeeRow load(Long id) {
        EmployeeRow row = storage.get(id);
        if (row == null) {
            throw new IllegalArgumentException("Employee not found: " + id);
        }
        return row;
    }

    public static List<EmployeeRow> findByDepartment(String department) {
        return storage.values().stream()
                .filter(e -> e.getDepartment().equals(department))
                .collect(Collectors.toList());
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public double getSalary() {
        return salary;
    }

    public void setSalary(double salary) {
        this.salary = salary;
    }

    @Override
    public String toString() {
        return "Employee{id=" + id + ", name='" + name + "', department='" + department +
               "', salary=" + salary + "}";
    }
}
