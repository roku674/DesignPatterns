package Integration.ChannelAdapter;

import java.util.Map;

/**
 * BidirectionalChannelAdapter supports both inbound and outbound communication.
 * It combines the functionality of inbound and outbound adapters.
 */
public class BidirectionalChannelAdapter implements ChannelAdapter {
    private final String adapterName;
    private final MessageChannel channel;
    private final MessageHandler inboundHandler;
    private final MessageHandler outboundHandler;
    private boolean running;
    private Map<String, Object> config;

    /**
     * Constructs a BidirectionalChannelAdapter.
     *
     * @param adapterName The adapter name
     * @param channel The message channel
     * @param inboundHandler The inbound message handler
     * @param outboundHandler The outbound message handler
     */
    public BidirectionalChannelAdapter(String adapterName, MessageChannel channel,
                                      MessageHandler inboundHandler, MessageHandler outboundHandler) {
        this.adapterName = adapterName;
        this.channel = channel;
        this.inboundHandler = inboundHandler;
        this.outboundHandler = outboundHandler;
        this.running = false;
    }

    @Override
    public void configure(Map<String, Object> config) {
        this.config = config;
        inboundHandler.configure(config);
        outboundHandler.configure(config);
    }

    @Override
    public void start() {
        running = true;
        inboundHandler.start();
        outboundHandler.start();
    }

    @Override
    public void stop() {
        running = false;
        inboundHandler.stop();
        outboundHandler.stop();
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    @Override
    public String getAdapterName() {
        return adapterName;
    }

    /**
     * Gets the message channel.
     *
     * @return The message channel
     */
    public MessageChannel getChannel() {
        return channel;
    }
}
