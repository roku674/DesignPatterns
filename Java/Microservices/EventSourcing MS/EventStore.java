package Microservices.EventSourcingMS;
import java.util.*;

public class EventStore {
    private Map<String, List<Event>> events = new HashMap<>();

    public void append(String aggregateId, Event event) {
        events.computeIfAbsent(aggregateId, k -> new ArrayList<>()).add(event);
        System.out.println("  Event stored: " + event);
    }

    public List<Event> getEvents(String aggregateId) {
        return events.getOrDefault(aggregateId, new ArrayList<>());
    }

    public void printEvents(String aggregateId) {
        List<Event> eventList = getEvents(aggregateId);
        System.out.println("Total events: " + eventList.size());
        for (int i = 0; i < eventList.size(); i++) {
            System.out.println("  " + (i + 1) + ". " + eventList.get(i));
        }
    }
}

class Event {
    String type;
    Map<String, Object> data;
    long timestamp;

    Event(String type, Map<String, Object> data) {
        this.type = type;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    public String toString() {
        return String.format("%s: %s", type, data);
    }
}
