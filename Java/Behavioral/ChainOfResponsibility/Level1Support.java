/**
 * Concrete Handler - handles basic issues
 */
public class Level1Support extends SupportHandler {
    @Override
    public void handleRequest(String issue, int priority) {
        if (priority <= 1) {
            System.out.println("Level 1 Support: Handling basic issue - " + issue);
        } else if (nextHandler != null) {
            System.out.println("Level 1 Support: Escalating to Level 2");
            nextHandler.handleRequest(issue, priority);
        }
    }
}
