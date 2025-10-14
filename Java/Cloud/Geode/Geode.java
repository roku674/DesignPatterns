package Cloud.Geode;

public class Geode {
    private final String region;
    private final double latitude;
    private final double longitude;
    
    public Geode(String region, double latitude, double longitude) {
        this.region = region;
        this.latitude = latitude;
        this.longitude = longitude;
    }
    
    public String getRegion() { return region; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    
    public void handleRequest(String requestId) {
        System.out.println("  [" + region + "] Processing: " + requestId);
    }
}
