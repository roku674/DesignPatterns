package Cloud.MessagingBridge;

public class MessagingBridge {
    private final AzureServiceBus source;
    private final AwsSqs destination;
    
    public MessagingBridge(AzureServiceBus source, AwsSqs destination) {
        this.source = source;
        this.destination = destination;
    }
    
    public void transferMessages() {
        System.out.println("  [Bridge] Transferring messages...");
        while (source.hasMessages()) {
            String message = source.receive();
            if (message != null) {
                destination.send("target-queue", message);
            }
        }
    }
}
