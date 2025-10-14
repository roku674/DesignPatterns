package Enterprise.Base;

/**
 * Special Case: Blocked customer account
 */
public class BlockedCustomerAccount implements CustomerAccount {
    @Override
    public String getName() {
        return "Blocked Customer";
    }

    @Override
    public double getBalance() {
        return 0.0;
    }

    @Override
    public boolean canPurchase() {
        return false; // Blocked customers cannot purchase
    }

    @Override
    public double getDiscount() {
        return 0.0;
    }
}
