package Cloud.Geode;
import java.util.*;

public class GeodeManager {
    private List<Geode> geodes = new ArrayList<>();
    
    public void addGeode(Geode geode) {
        geodes.add(geode);
        System.out.println("  Registered geode: " + geode.getRegion());
    }
    
    public void routeRequest(double lat, double lon) {
        Geode nearest = findNearestGeode(lat, lon);
        System.out.println("  Routing to nearest geode: " + nearest.getRegion());
        nearest.handleRequest("REQ-" + System.currentTimeMillis());
    }
    
    private Geode findNearestGeode(double lat, double lon) {
        Geode nearest = null;
        double minDistance = Double.MAX_VALUE;
        
        for (Geode geode : geodes) {
            double distance = calculateDistance(lat, lon, geode.getLatitude(), geode.getLongitude());
            if (distance < minDistance) {
                minDistance = distance;
                nearest = geode;
            }
        }
        
        return nearest;
    }
    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
    }
}
