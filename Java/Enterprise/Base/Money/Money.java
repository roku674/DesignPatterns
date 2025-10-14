package Enterprise.Base.Money;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;
import java.util.Objects;

/**
 * Money Pattern Implementation
 *
 * Represents monetary values with currency and amount.
 * Prevents floating-point arithmetic errors and ensures
 * currency-aware operations.
 */
public class Money {
    private final BigDecimal amount;
    private final Currency currency;

    /**
     * Constructor with amount and currency.
     *
     * @param amount Monetary amount
     * @param currency Currency code (e.g., "USD", "EUR")
     */
    public Money(double amount, String currency) {
        this.amount = BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP);
        this.currency = Currency.getInstance(currency);
    }

    /**
     * Constructor with BigDecimal amount and currency.
     *
     * @param amount Monetary amount
     * @param currency Currency code
     */
    public Money(BigDecimal amount, String currency) {
        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
        this.currency = Currency.getInstance(currency);
    }

    /**
     * Constructor with amount and Currency object.
     *
     * @param amount Monetary amount
     * @param currency Currency object
     */
    public Money(BigDecimal amount, Currency currency) {
        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
        this.currency = currency;
    }

    /**
     * Gets the amount.
     *
     * @return Amount as BigDecimal
     */
    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * Gets the currency.
     *
     * @return Currency object
     */
    public Currency getCurrency() {
        return currency;
    }

    /**
     * Adds two Money objects.
     *
     * @param other Money to add
     * @return New Money object with sum
     * @throws IllegalArgumentException if currencies don't match
     */
    public Money add(Money other) {
        assertSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    /**
     * Subtracts another Money object.
     *
     * @param other Money to subtract
     * @return New Money object with difference
     * @throws IllegalArgumentException if currencies don't match
     */
    public Money subtract(Money other) {
        assertSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    /**
     * Multiplies by a factor.
     *
     * @param factor Multiplication factor
     * @return New Money object with product
     */
    public Money multiply(double factor) {
        return new Money(this.amount.multiply(BigDecimal.valueOf(factor)), this.currency);
    }

    /**
     * Multiplies by a BigDecimal factor.
     *
     * @param factor Multiplication factor
     * @return New Money object with product
     */
    public Money multiply(BigDecimal factor) {
        return new Money(this.amount.multiply(factor), this.currency);
    }

    /**
     * Divides by a factor.
     *
     * @param divisor Division factor
     * @return New Money object with quotient
     * @throws ArithmeticException if divisor is zero
     */
    public Money divide(double divisor) {
        if (divisor == 0) {
            throw new ArithmeticException("Cannot divide by zero");
        }
        return new Money(this.amount.divide(BigDecimal.valueOf(divisor), 2, RoundingMode.HALF_UP), this.currency);
    }

    /**
     * Divides by a BigDecimal factor.
     *
     * @param divisor Division factor
     * @return New Money object with quotient
     */
    public Money divide(BigDecimal divisor) {
        return new Money(this.amount.divide(divisor, 2, RoundingMode.HALF_UP), this.currency);
    }

    /**
     * Allocates money into portions.
     *
     * @param n Number of portions
     * @return Array of Money objects
     */
    public Money[] allocate(int n) {
        if (n <= 0) {
            throw new IllegalArgumentException("Number of allocations must be positive");
        }

        Money[] results = new Money[n];
        BigDecimal lowResult = this.amount.divide(BigDecimal.valueOf(n), 2, RoundingMode.DOWN);
        BigDecimal remainder = this.amount.subtract(lowResult.multiply(BigDecimal.valueOf(n)));

        for (int i = 0; i < n; i++) {
            if (i < remainder.multiply(BigDecimal.valueOf(100)).intValue()) {
                results[i] = new Money(lowResult.add(new BigDecimal("0.01")), this.currency);
            } else {
                results[i] = new Money(lowResult, this.currency);
            }
        }

        return results;
    }

    /**
     * Allocates money by ratios.
     *
     * @param ratios Array of allocation ratios
     * @return Array of Money objects
     */
    public Money[] allocate(int[] ratios) {
        if (ratios == null || ratios.length == 0) {
            throw new IllegalArgumentException("Ratios cannot be null or empty");
        }

        int total = 0;
        for (int ratio : ratios) {
            total += ratio;
        }

        Money[] results = new Money[ratios.length];
        BigDecimal remainder = this.amount;

        for (int i = 0; i < ratios.length; i++) {
            BigDecimal share = this.amount.multiply(BigDecimal.valueOf(ratios[i]))
                .divide(BigDecimal.valueOf(total), 2, RoundingMode.DOWN);
            results[i] = new Money(share, this.currency);
            remainder = remainder.subtract(share);
        }

        // Add remainder to first allocation
        if (remainder.compareTo(BigDecimal.ZERO) > 0) {
            results[0] = results[0].add(new Money(remainder, this.currency));
        }

        return results;
    }

    /**
     * Compares if this money is greater than another.
     *
     * @param other Money to compare
     * @return true if greater
     */
    public boolean greaterThan(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) > 0;
    }

    /**
     * Compares if this money is greater than or equal to another.
     *
     * @param other Money to compare
     * @return true if greater or equal
     */
    public boolean greaterThanOrEqual(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) >= 0;
    }

    /**
     * Compares if this money is less than another.
     *
     * @param other Money to compare
     * @return true if less
     */
    public boolean lessThan(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) < 0;
    }

    /**
     * Compares if this money is less than or equal to another.
     *
     * @param other Money to compare
     * @return true if less or equal
     */
    public boolean lessThanOrEqual(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) <= 0;
    }

    /**
     * Checks if amount is zero.
     *
     * @return true if zero
     */
    public boolean isZero() {
        return this.amount.compareTo(BigDecimal.ZERO) == 0;
    }

    /**
     * Checks if amount is positive.
     *
     * @return true if positive
     */
    public boolean isPositive() {
        return this.amount.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Checks if amount is negative.
     *
     * @return true if negative
     */
    public boolean isNegative() {
        return this.amount.compareTo(BigDecimal.ZERO) < 0;
    }

    /**
     * Returns absolute value.
     *
     * @return New Money object with absolute value
     */
    public Money abs() {
        return new Money(this.amount.abs(), this.currency);
    }

    /**
     * Returns negated value.
     *
     * @return New Money object with negated value
     */
    public Money negate() {
        return new Money(this.amount.negate(), this.currency);
    }

    /**
     * Asserts that currencies match.
     *
     * @param other Money to compare currency
     * @throws IllegalArgumentException if currencies don't match
     */
    private void assertSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                "Currency mismatch: " + this.currency + " vs " + other.currency
            );
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Money money = (Money) o;
        return amount.compareTo(money.amount) == 0 && currency.equals(money.currency);
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount, currency);
    }

    @Override
    public String toString() {
        return currency.getSymbol() + amount.toString();
    }

    /**
     * Formats money with currency code.
     *
     * @return Formatted string
     */
    public String toStringWithCode() {
        return amount.toString() + " " + currency.getCurrencyCode();
    }
}
