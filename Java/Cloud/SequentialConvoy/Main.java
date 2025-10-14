package Cloud.SequentialConvoy;

/**
 * Sequential Convoy Pattern - Process related messages in order.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Sequential Convoy Pattern ===\n");
        
        ConvoyProcessor processor = new ConvoyProcessor();
        
        System.out.println("1. Send messages for Order-123:");
        processor.enqueue(new ConvoyMessage("Order-123", "created", 1));
        processor.enqueue(new ConvoyMessage("Order-123", "paid", 2));
        processor.enqueue(new ConvoyMessage("Order-123", "shipped", 3));
        
        System.out.println("\n2. Send messages for Order-456:");
        processor.enqueue(new ConvoyMessage("Order-456", "created", 1));
        processor.enqueue(new ConvoyMessage("Order-456", "paid", 2));
        
        System.out.println("\n3. Process convoys sequentially:");
        processor.processConvoys();
    }
}
