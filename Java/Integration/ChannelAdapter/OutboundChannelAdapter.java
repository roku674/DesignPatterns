package Integration.ChannelAdapter;

import java.util.Map;

/**
 * OutboundChannelAdapter sends messages from the messaging system to external systems.
 * It consumes messages from a channel and sends them to an external handler.
 */
public class OutboundChannelAdapter implements ChannelAdapter {
    private final String adapterName;
    private final MessageChannel channel;
    private final MessageHandler handler;
    private boolean running;
    private Map<String, Object> config;

    /**
     * Constructs an OutboundChannelAdapter.
     *
     * @param adapterName The adapter name
     * @param channel The message channel
     * @param handler The message handler
     */
    public OutboundChannelAdapter(String adapterName, MessageChannel channel, MessageHandler handler) {
        this.adapterName = adapterName;
        this.channel = channel;
        this.handler = handler;
        this.running = false;
    }

    @Override
    public void configure(Map<String, Object> config) {
        this.config = config;
        handler.configure(config);
    }

    @Override
    public void start() {
        running = true;
        handler.start();
    }

    @Override
    public void stop() {
        running = false;
        handler.stop();
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
