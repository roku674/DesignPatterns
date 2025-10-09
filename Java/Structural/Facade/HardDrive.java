import java.util.regex.Pattern;

/**
 * Subsystem class - Input Validator
 */
public class HardDrive {
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    public boolean read(String input, int minLength) {
        System.out.println("Validator: Checking input length (min: " + minLength + ")");
        return input != null && input.length() >= minLength;
    }

    public boolean validateEmail(String email) {
        System.out.println("Validator: Validating email format");
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public boolean validateNotNull(Object obj) {
        System.out.println("Validator: Checking for null");
        return obj != null;
    }

    public boolean validateNumericRange(int value, int min, int max) {
        System.out.println("Validator: Checking numeric range [" + min + ", " + max + "]");
        return value >= min && value <= max;
    }
}
