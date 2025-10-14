package Microservices.APIComposition;
import java.util.*;
public class RecommendationService {
    public List<String> getRecommendations(String userId) {
        simulateDelay(100);
        return Arrays.asList("PROD-201", "PROD-202", "PROD-203");
    }
    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
