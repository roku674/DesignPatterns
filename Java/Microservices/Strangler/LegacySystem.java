package Microservices.Strangler;

public class LegacySystem {
    public String handleRequest(String request) {
        System.out.println("  [LEGACY] Processing: " + request);
        return "Legacy response";
    }
}
