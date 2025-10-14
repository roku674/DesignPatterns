package Enterprise.Base;

/**
 * Special Case Pattern
 * Interface for customer accounts, including special cases
 */
public interface CustomerAccount {
    String getName();
    double getBalance();
    boolean canPurchase();
    double getDiscount();

    static CustomerAccount createUnknownCustomer() {
        return new UnknownCustomerAccount();
    }

    static CustomerAccount createBlockedCustomer() {
        return new BlockedCustomerAccount();
    }
}
