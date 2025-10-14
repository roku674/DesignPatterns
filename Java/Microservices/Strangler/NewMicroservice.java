package Microservices.Strangler;

public class NewMicroservice {
    public String handleRequest(String request) {
        System.out.println("  [NEW] Processing: " + request);
        return "New microservice response";
    }
}
