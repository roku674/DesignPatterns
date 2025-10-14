package Enterprise.Base;

/**
 * US tax calculation implementation
 */
public class USTaxCalculator implements TaxCalculator {
    private static final double TAX_RATE = 0.07; // 7% sales tax

    @Override
    public double calculateTax(double amount) {
        return amount * TAX_RATE;
    }

    @Override
    public String getRegion() {
        return "US";
    }
}
