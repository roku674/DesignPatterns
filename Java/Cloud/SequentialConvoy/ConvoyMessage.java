package Cloud.SequentialConvoy;

public class ConvoyMessage {
    private final String convoyId;
    private final String action;
    private final int sequenceNumber;
    
    public ConvoyMessage(String convoyId, String action, int sequenceNumber) {
        this.convoyId = convoyId;
        this.action = action;
        this.sequenceNumber = sequenceNumber;
    }
    
    public String getConvoyId() { return convoyId; }
    public String getAction() { return action; }
    public int getSequenceNumber() { return sequenceNumber; }
}
