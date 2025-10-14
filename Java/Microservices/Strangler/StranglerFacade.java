package Microservices.Strangler;
import java.util.Random;

public class StranglerFacade {
    private LegacySystem legacy;
    private NewMicroservice newService;
    private int migrationPercent;
    private int legacyCount = 0;
    private int newCount = 0;
    private Random random = new Random();

    public StranglerFacade(LegacySystem legacy, NewMicroservice newService) {
        this.legacy = legacy;
        this.newService = newService;
        this.migrationPercent = 0;
    }

    public void setMigrationPercent(int percent) {
        this.migrationPercent = percent;
        System.out.println("Migration percentage set to: " + percent + "%");
    }

    public void handleRequest(String request) {
        boolean useNew = random.nextInt(100) < migrationPercent;
        
        if (useNew) {
            newService.handleRequest(request);
            newCount++;
        } else {
            legacy.handleRequest(request);
            legacyCount++;
        }
    }

    public void showStats() {
        int total = legacyCount + newCount;
        System.out.println("Total requests: " + total);
        System.out.println("Legacy requests: " + legacyCount + " (" + (legacyCount * 100 / total) + "%)");
        System.out.println("New service requests: " + newCount + " (" + (newCount * 100 / total) + "%)");
    }
}
