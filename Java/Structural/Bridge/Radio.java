/**
 * Concrete Implementation - Radio device
 */
public class Radio implements Device {
    private boolean on = false;
    private int volume = 20;
    private int channel = 881; // FM frequency

    @Override
    public boolean isEnabled() {
        return on;
    }

    @Override
    public void enable() {
        on = true;
        System.out.println("Radio is now ON");
    }

    @Override
    public void disable() {
        on = false;
        System.out.println("Radio is now OFF");
    }

    @Override
    public int getVolume() {
        return volume;
    }

    @Override
    public void setVolume(int volume) {
        this.volume = Math.max(0, Math.min(volume, 100));
        System.out.println("Radio volume set to: " + this.volume);
    }

    @Override
    public int getChannel() {
        return channel;
    }

    @Override
    public void setChannel(int channel) {
        this.channel = channel;
        System.out.println("Radio frequency set to: " + (channel / 10.0) + " FM");
    }
}
