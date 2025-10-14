package Cloud.Saga;
public class HotelService {
    public String bookRoom(String id, String date, int nights) { return "Hotel booked for " + nights + " nights"; }
    public String cancelRoom(String id) { return "Hotel cancelled"; }
}
