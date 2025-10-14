package Cloud.Geode;

/**
 * Geode Pattern - Deploy collection of backend instances across geographical regions.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Geode Pattern ===\n");
        
        GeodeManager manager = new GeodeManager();
        
        manager.addGeode(new Geode("us-east-1", 40.7128, -74.0060));
        manager.addGeode(new Geode("eu-west-1", 51.5074, -0.1278));
        manager.addGeode(new Geode("ap-south-1", 19.0760, 72.8777));
        
        System.out.println("1. Route request from New York:");
        manager.routeRequest(40.7589, -73.9851);
        
        System.out.println("\n2. Route request from London:");
        manager.routeRequest(51.5074, -0.1278);
        
        System.out.println("\n3. Route request from Mumbai:");
        manager.routeRequest(19.0760, 72.8777);
    }
}
