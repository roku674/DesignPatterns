/**
 * Concrete Handler - handles intermediate issues
 */
public class Level2Support extends SupportHandler {
    @Override
    public void handleRequest(String issue, int priority) {
        if (priority <= 2) {
            System.out.println("Level 2 Support: Handling intermediate issue - " + issue);
        } else if (nextHandler != null) {
            System.out.println("Level 2 Support: Escalating to Level 3");
            nextHandler.handleRequest(issue, priority);
        }
    }
}
