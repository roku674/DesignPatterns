package Enterprise.DataSource;

/**
 * Data structure representing a row in the person table
 */
public class PersonData {
    private final Long id;
    private final String name;
    private final String email;
    private final int age;

    public PersonData(Long id, String name, String email, int age) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.age = age;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public int getAge() {
        return age;
    }

    @Override
    public String toString() {
        return "Person{id=" + id + ", name='" + name + "', email='" + email + "', age=" + age + "}";
    }
}
