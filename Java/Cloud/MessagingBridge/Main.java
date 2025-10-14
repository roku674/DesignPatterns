package Cloud.MessagingBridge;

/**
 * Messaging Bridge Pattern - Connect different messaging systems.
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== Messaging Bridge Pattern ===\n");
        
        AzureServiceBus azure = new AzureServiceBus();
        AwsSqs aws = new AwsSqs();
        
        MessagingBridge bridge = new MessagingBridge(azure, aws);
        
        System.out.println("1. Send message to Azure Service Bus:");
        azure.send("order-created", "Order #123");
        
        System.out.println("\n2. Bridge transfers to AWS SQS:");
        bridge.transferMessages();
        
        System.out.println("\n3. Receive from AWS SQS:");
        aws.receive();
    }
}
