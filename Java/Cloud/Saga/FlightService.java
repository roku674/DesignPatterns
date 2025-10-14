package Cloud.Saga;
public class FlightService {
    public String bookFlight(String id, String from, String to) { return "Flight booked: " + from + "->" + to; }
    public String cancelFlight(String id) { return "Flight cancelled"; }
}
