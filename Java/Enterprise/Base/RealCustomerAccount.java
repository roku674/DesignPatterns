package Enterprise.Base;

/**
 * Real customer account implementation
 */
public class RealCustomerAccount implements CustomerAccount {
    private final String name;
    private final double balance;

    public RealCustomerAccount(String name, double balance) {
        this.name = name;
        this.balance = balance;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public double getBalance() {
        return balance;
    }

    @Override
    public boolean canPurchase() {
        return balance > 0;
    }

    @Override
    public double getDiscount() {
        return 10.0; // 10% discount for regular customers
    }
}
