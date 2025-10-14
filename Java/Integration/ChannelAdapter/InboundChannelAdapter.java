package Integration.ChannelAdapter;

import java.util.Map;

/**
 * InboundChannelAdapter brings external messages into the messaging system.
 * It polls external sources and publishes messages to a channel.
 */
public class InboundChannelAdapter implements ChannelAdapter {
    private final String adapterName;
    private final MessageChannel channel;
    private final DataPoller poller;
    private boolean running;
    private Map<String, Object> config;

    /**
     * Constructs an InboundChannelAdapter.
     *
     * @param adapterName The adapter name
     * @param channel The message channel
     * @param poller The data poller
     */
    public InboundChannelAdapter(String adapterName, MessageChannel channel, DataPoller poller) {
        this.adapterName = adapterName;
        this.channel = channel;
        this.poller = poller;
        this.running = false;
    }

    @Override
    public void configure(Map<String, Object> config) {
        this.config = config;
        poller.configure(config);
    }

    @Override
    public void start() {
        running = true;
        poller.start();
    }

    @Override
    public void stop() {
        running = false;
        poller.stop();
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
