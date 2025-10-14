package Microservices.CQRS;
import java.util.*;
public class CommandService {
    private List<Event> eventStore = new ArrayList<>();
    
    public void createProduct(String id, String name, double price) {
        Event event = new Event("PRODUCT_CREATED", id, Map.of("name", name, "price", price));
        eventStore.add(event);
        System.out.println("Command: Product created - " + id);
        publishEvent(event);
    }
    
    public void updatePrice(String id, double newPrice) {
        Event event = new Event("PRICE_UPDATED", id, Map.of("price", newPrice));
        eventStore.add(event);
        System.out.println("Command: Price updated - " + id);
        publishEvent(event);
    }
    
    private void publishEvent(Event event) {
        System.out.println("  Event published: " + event.type);
    }
}
class Event {
    String type, entityId;
    Map<String, Object> data;
    Event(String type, String entityId, Map<String, Object> data) {
        this.type = type;
        this.entityId = entityId;
        this.data = data;
    }
}
