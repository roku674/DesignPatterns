package Enterprise.Base;

import java.util.HashMap;
import java.util.Map;

/**
 * Plugin Pattern - Factory
 * Creates appropriate tax calculator based on configuration
 */
public class TaxCalculatorFactory {
    private final Map<String, TaxCalculator> calculators;

    public TaxCalculatorFactory() {
        this.calculators = new HashMap<>();
        // Register plugins
        registerCalculator(new USTaxCalculator());
        registerCalculator(new EUTaxCalculator());
        registerCalculator(new AsiaTaxCalculator());
    }

    private void registerCalculator(TaxCalculator calculator) {
        calculators.put(calculator.getRegion(), calculator);
    }

    public TaxCalculator getCalculator(String region) {
        TaxCalculator calculator = calculators.get(region);
        if (calculator == null) {
            throw new IllegalArgumentException("No tax calculator found for region: " + region);
        }
        return calculator;
    }
}
