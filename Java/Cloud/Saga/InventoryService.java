package Cloud.Saga;
public class InventoryService {
    public String reserveItems(String orderId, String itemId, int quantity) { 
        return "Reserved " + quantity + " units of " + itemId; 
    }
    public String releaseItems(String orderId) { return "Inventory released"; }
}
