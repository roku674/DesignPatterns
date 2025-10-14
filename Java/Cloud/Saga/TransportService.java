package Cloud.Saga;
public class TransportService {
    public String schedulePickup(String po, String date) { return "Pickup scheduled"; }
    public String cancelPickup(String po) { return "Pickup cancelled"; }
}
