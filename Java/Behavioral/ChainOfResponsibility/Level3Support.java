/**
 * Concrete Handler - handles critical issues
 */
public class Level3Support extends SupportHandler {
    @Override
    public void handleRequest(String issue, int priority) {
        System.out.println("Level 3 Support: Handling critical issue - " + issue);
    }
}
