package Enterprise.Concurrency;

/**
 * Account entity with version control for optimistic locking
 */
public class Account {
    private final Long id;
    private String ownerName;
    private double balance;
    private int version;

    public Account(Long id, String ownerName, double balance) {
        this.id = id;
        this.ownerName = ownerName;
        this.balance = balance;
        this.version = 0;
    }

    public Long getId() {
        return id;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public double getBalance() {
        return balance;
    }

    public int getVersion() {
        return version;
    }

    public void incrementVersion() {
        this.version++;
    }

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        this.balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }
        if (amount > balance) {
            throw new IllegalStateException("Insufficient funds");
        }
        this.balance -= amount;
    }

    @Override
    public String toString() {
        return "Account{id=" + id + ", owner='" + ownerName + "', balance=" + balance +
               ", version=" + version + "}";
    }
}
