package Cloud.Saga;
public class CarRentalService {
    public String reserveCar(String id, String date, int days) { return "Car reserved for " + days + " days"; }
    public String cancelCar(String id) { return "Car cancelled"; }
}
