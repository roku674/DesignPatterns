package Enterprise.Base;

/**
 * Special Case: Unknown customer (null object pattern)
 */
public class UnknownCustomerAccount implements CustomerAccount {
    @Override
    public String getName() {
        return "Guest";
    }

    @Override
    public double getBalance() {
        return 0.0;
    }

    @Override
    public boolean canPurchase() {
        return true; // Guests can purchase with credit card
    }

    @Override
    public double getDiscount() {
        return 0.0; // No discount for guests
    }
}
