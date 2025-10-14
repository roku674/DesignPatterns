package Cloud.Saga;
public class ShippingService {
    public String scheduleDelivery(String orderId, String address) { 
        return "Delivery scheduled to " + address; 
    }
    public String cancelDelivery(String orderId) { return "Delivery cancelled"; }
}
