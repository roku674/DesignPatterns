package Enterprise.Base;

/**
 * Plugin Pattern - Interface
 * Tax calculation strategy that can be plugged in
 */
public interface TaxCalculator {
    double calculateTax(double amount);
    String getRegion();
}
