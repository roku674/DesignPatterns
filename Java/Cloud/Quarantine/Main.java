package Cloud.Quarantine;

/**
 * Quarantine Pattern - Isolate potentially problematic messages.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Quarantine Pattern ===\n");
        
        QuarantineQueue queue = new QuarantineQueue();
        MessageProcessor processor = new MessageProcessor(queue);
        
        System.out.println("1. Processing valid messages:");
        processor.process(new Message("1", "valid-order"));
        processor.process(new Message("2", "valid-payment"));
        
        System.out.println("\n2. Processing poison messages:");
        processor.process(new Message("3", "corrupt-data-!!##"));
        processor.process(new Message("4", "malformed-json-{{{"));
        
        System.out.println("\n3. Quarantined messages:");
        queue.showQuarantined();
    }
}
