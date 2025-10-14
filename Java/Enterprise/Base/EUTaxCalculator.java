package Enterprise.Base;

/**
 * EU VAT calculation implementation
 */
public class EUTaxCalculator implements TaxCalculator {
    private static final double VAT_RATE = 0.20; // 20% VAT

    @Override
    public double calculateTax(double amount) {
        return amount * VAT_RATE;
    }

    @Override
    public String getRegion() {
        return "EU";
    }
}
