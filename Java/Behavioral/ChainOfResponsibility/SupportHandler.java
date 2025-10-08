/**
 * Handler - defines interface for handling requests
 */
public abstract class SupportHandler {
    protected SupportHandler nextHandler;

    public void setNext(SupportHandler handler) {
        this.nextHandler = handler;
    }

    public abstract void handleRequest(String issue, int priority);
}
