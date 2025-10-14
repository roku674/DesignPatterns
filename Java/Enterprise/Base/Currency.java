package Enterprise.Base;

/**
 * Enum representing different currencies for the Money pattern
 */
public enum Currency {
    USD("$", "US Dollar"),
    EUR("€", "Euro"),
    GBP("£", "British Pound"),
    JPY("¥", "Japanese Yen"),
    CNY("¥", "Chinese Yuan");

    private final String symbol;
    private final String name;

    Currency(String symbol, String name) {
        this.symbol = symbol;
        this.name = name;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getName() {
        return name;
    }
}
