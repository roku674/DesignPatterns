package Enterprise.DataSource;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Table Data Gateway Pattern
 * Provides a gateway to the person table with all SQL in one place
 */
public class PersonGateway {
    private static final AtomicLong idGenerator = new AtomicLong(1);
    private final Map<Long, PersonData> table;

    public PersonGateway() {
        this.table = new HashMap<>();
    }

    public Long insert(String name, String email, int age) {
        Long id = idGenerator.getAndIncrement();
        PersonData data = new PersonData(id, name, email, age);
        table.put(id, data);
        return id;
    }

    public PersonData findById(Long id) {
        PersonData data = table.get(id);
        if (data == null) {
            throw new IllegalArgumentException("Person not found: " + id);
        }
        return data;
    }

    public List<PersonData> findAll() {
        return new ArrayList<>(table.values());
    }

    public List<PersonData> findByEmail(String email) {
        return table.values().stream()
                .filter(p -> p.getEmail().equals(email))
                .collect(Collectors.toList());
    }

    public void update(Long id, String name, String email, int age) {
        if (!table.containsKey(id)) {
            throw new IllegalArgumentException("Person not found: " + id);
        }
        table.put(id, new PersonData(id, name, email, age));
    }

    public void delete(Long id) {
        table.remove(id);
    }
}
