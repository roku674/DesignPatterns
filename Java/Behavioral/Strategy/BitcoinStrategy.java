/** Concrete Strategy */
public class BitcoinStrategy implements PaymentStrategy {
    private String walletAddress;

    public BitcoinStrategy(String walletAddress) {
        this.walletAddress = walletAddress;
    }

    @Override
    public void pay(double amount) {
        System.out.println("Paid $" + amount + " using Bitcoin wallet: " + walletAddress);
    }
}
