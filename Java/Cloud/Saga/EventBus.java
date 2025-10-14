package Cloud.Saga;
import java.util.*;
import java.util.function.Consumer;
public class EventBus {
    private Map<String, List<Consumer<SagaEvent>>> subscribers = new HashMap<>();
    public void subscribe(String eventType, Consumer<SagaEvent> handler) {
        subscribers.computeIfAbsent(eventType, k -> new ArrayList<>()).add(handler);
    }
    public void publish(SagaEvent event) {
        System.out.println("  [Event] " + event.getType() + " published");
        subscribers.getOrDefault(event.getType(), Collections.emptyList()).forEach(h -> h.accept(event));
    }
}
