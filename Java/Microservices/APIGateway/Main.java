package Microservices.APIGateway;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== API Gateway Pattern ===\n");
        Gateway gateway = new Gateway();
        gateway.route("/api/users/123", "GET");
        gateway.route("/api/products/456", "GET");
        gateway.route("/api/orders", "POST");
        gateway.showMetrics();
    }
}
