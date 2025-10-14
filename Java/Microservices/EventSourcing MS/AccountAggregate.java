package Microservices.EventSourcingMS;
import java.util.*;

public class AccountAggregate {
    private String accountId;
    private String ownerName;
    private double balance;
    private EventStore eventStore;

    public AccountAggregate(String accountId, EventStore eventStore) {
        this.accountId = accountId;
        this.eventStore = eventStore;
        this.balance = 0.0;
    }

    public void create(String ownerName, double initialBalance) {
        Map<String, Object> data = new HashMap<>();
        data.put("ownerName", ownerName);
        data.put("initialBalance", initialBalance);
        Event event = new Event("ACCOUNT_CREATED", data);
        eventStore.append(accountId, event);
        apply(event);
    }

    public void deposit(double amount) {
        Map<String, Object> data = new HashMap<>();
        data.put("amount", amount);
        Event event = new Event("MONEY_DEPOSITED", data);
        eventStore.append(accountId, event);
        apply(event);
    }

    public void withdraw(double amount) {
        Map<String, Object> data = new HashMap<>();
        data.put("amount", amount);
        Event event = new Event("MONEY_WITHDRAWN", data);
        eventStore.append(accountId, event);
        apply(event);
    }

    private void apply(Event event) {
        switch (event.type) {
            case "ACCOUNT_CREATED":
                this.ownerName = (String) event.data.get("ownerName");
                this.balance = (Double) event.data.get("initialBalance");
                break;
            case "MONEY_DEPOSITED":
                this.balance += (Double) event.data.get("amount");
                break;
            case "MONEY_WITHDRAWN":
                this.balance -= (Double) event.data.get("amount");
                break;
        }
    }

    public void rebuildFromEvents() {
        System.out.println("Rebuilding state from events...");
        List<Event> events = eventStore.getEvents(accountId);
        for (Event event : events) {
            apply(event);
        }
    }

    public void printState() {
        System.out.println("Account ID: " + accountId);
        System.out.println("Owner: " + ownerName);
        System.out.println("Balance: $" + String.format("%.2f", balance));
    }
}
