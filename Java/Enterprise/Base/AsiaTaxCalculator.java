package Enterprise.Base;

/**
 * Asia tax calculation implementation
 */
public class AsiaTaxCalculator implements TaxCalculator {
    private static final double TAX_RATE = 0.10; // 10% tax

    @Override
    public double calculateTax(double amount) {
        return amount * TAX_RATE;
    }

    @Override
    public String getRegion() {
        return "ASIA";
    }
}
