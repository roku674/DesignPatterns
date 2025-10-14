package Cloud.Saga;
public class AccountService {
    public String debit(String accountId, double amount) { return "Debited $" + amount; }
    public String credit(String accountId, double amount) { return "Credited $" + amount; }
}
