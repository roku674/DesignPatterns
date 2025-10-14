package Microservices.APIComposition;
import java.util.*;
public class UserDashboardComposer {
    private final UserService userService;
    private final OrderService orderService;
    private final RecommendationService recommendationService;
    public UserDashboardComposer(UserService userService, OrderService orderService, RecommendationService recommendationService) {
        this.userService = userService; this.orderService = orderService; this.recommendationService = recommendationService;
    }
    public UserDashboardResponse composeUserDashboard(String userId) {
        System.out.println("Composing dashboard for user: " + userId);
        User user = userService.getUser(userId);
        List<Order> orders = orderService.getUserOrders(userId);
        List<String> recommendations = recommendationService.getRecommendations(userId);
        return new UserDashboardResponse(user, orders, recommendations);
    }
}
class UserDashboardResponse {
    private final User user;
    private final List<Order> orders;
    private final List<String> recommendations;
    public UserDashboardResponse(User user, List<Order> orders, List<String> recommendations) {
        this.user = user; this.orders = orders; this.recommendations = recommendations;
    }
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("User Dashboard:\n  ").append(user).append("\n  Orders: ").append(orders.size()).append("\n");
        orders.forEach(o -> sb.append("    - ").append(o).append("\n"));
        sb.append("  Recommendations: ").append(recommendations).append("\n");
        return sb.toString();
    }
}
