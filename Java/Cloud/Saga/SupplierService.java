package Cloud.Saga;
public class SupplierService {
    public String placeOrder(String po, String item, int qty) { return "PO placed"; }
    public String cancelOrder(String po) { return "PO cancelled"; }
}
