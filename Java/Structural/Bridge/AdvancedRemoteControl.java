/**
 * Refined Abstraction - extends the interface defined by Abstraction
 */
public class AdvancedRemoteControl extends RemoteControl {

    public AdvancedRemoteControl(Device device) {
        super(device);
    }

    public void mute() {
        System.out.println("AdvancedRemote: Muting device");
        device.setVolume(0);
    }

    public void setChannelDirectly(int channel) {
        System.out.print("AdvancedRemote: ");
        device.setChannel(channel);
    }
}
