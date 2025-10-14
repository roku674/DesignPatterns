package Cloud.Saga;
public class LedgerService {
    public String record(String txnId, String from, String to, double amount) { return "Ledger recorded"; }
    public String reverse(String txnId) { return "Ledger reversed"; }
}
