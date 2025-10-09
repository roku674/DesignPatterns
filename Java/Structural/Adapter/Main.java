import java.util.Map;

/**
 * Main class to demonstrate the Adapter pattern with real HTTP API calls
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Adapter Pattern Demo - Real API Client ===\n");

        AudioPlayer audioPlayer = new AudioPlayer();

        System.out.println("--- Fetching Data from Different API Formats ---\n");

        // Example 1: JSON API (native support)
        try {
            System.out.println("1. Fetching JSON data (native):");
            Map<String, Object> jsonResult = audioPlayer.fetchData("https://api.github.com/users/github");
            System.out.println("   Format: " + jsonResult.get("format"));
            System.out.println("   Data length: " + jsonResult.get("data").toString().length() + " characters");
            System.out.println("   Success!\n");
        } catch (Exception e) {
            System.out.println("   Error: " + e.getMessage() + "\n");
        }

        // Example 2: XML API (through adapter)
        try {
            System.out.println("2. Fetching XML data (via adapter):");
            Map<String, Object> xmlResult = audioPlayer.fetchData("https://www.w3schools.com/xml/simple.xml");
            System.out.println("   Format: " + xmlResult.get("format"));
            System.out.println("   Parsed data: " + xmlResult.get("data"));
            System.out.println("   Success!\n");
        } catch (Exception e) {
            System.out.println("   Error: " + e.getMessage() + "\n");
        }

        // Example 3: CSV API (through adapter)
        try {
            System.out.println("3. Fetching CSV data (via adapter):");
            Map<String, Object> csvResult = audioPlayer.fetchData("https://example.com/data.csv");
            System.out.println("   Format: " + csvResult.get("format"));
            if (csvResult.containsKey("headers")) {
                String[] headers = (String[]) csvResult.get("headers");
                System.out.println("   Headers: " + String.join(", ", headers));
            }
            System.out.println("   Success!\n");
        } catch (Exception e) {
            System.out.println("   Error: " + e.getMessage() + "\n");
        }

        System.out.println("=".repeat(50));
        System.out.println("\nAdapter Pattern Benefits:");
        System.out.println("- Unified interface for different API response formats");
        System.out.println("- Converts XML/CSV to standard Map format");
        System.out.println("- New formats can be added without modifying client code");
        System.out.println("- Legacy APIs work with modern codebases");
        System.out.println("\nReal-world usage:");
        System.out.println("- API gateway converting multiple backend formats");
        System.out.println("- Database adapter for different SQL dialects");
        System.out.println("- Payment processor integrations");
    }
}
