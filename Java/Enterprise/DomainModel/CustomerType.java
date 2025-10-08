package Enterprise.DomainModel;

import java.math.BigDecimal;

/**
 * Represents different types of customers with different business rules.
 */
public enum CustomerType {
    REGULAR(new BigDecimal("1000"), new BigDecimal("0.00")),
    PREMIUM(new BigDecimal("5000"), new BigDecimal("0.05")),
    VIP(new BigDecimal("20000"), new BigDecimal("0.10"));

    private final BigDecimal defaultCreditLimit;
    private final BigDecimal discountPercentage;

    CustomerType(BigDecimal defaultCreditLimit, BigDecimal discountPercentage) {
        this.defaultCreditLimit = defaultCreditLimit;
        this.discountPercentage = discountPercentage;
    }

    public BigDecimal getDefaultCreditLimit() {
        return defaultCreditLimit;
    }

    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }
}
