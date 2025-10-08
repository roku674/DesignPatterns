/**
 * Abstraction - defines high-level control interface
 */
public class RemoteControl {
    protected Device device;

    public RemoteControl(Device device) {
        this.device = device;
    }

    public void togglePower() {
        System.out.print("RemoteControl: ");
        if (device.isEnabled()) {
            device.disable();
        } else {
            device.enable();
        }
    }

    public void volumeDown() {
        System.out.print("RemoteControl: ");
        device.setVolume(device.getVolume() - 10);
    }

    public void volumeUp() {
        System.out.print("RemoteControl: ");
        device.setVolume(device.getVolume() + 10);
    }

    public void channelDown() {
        System.out.print("RemoteControl: ");
        device.setChannel(device.getChannel() - 1);
    }

    public void channelUp() {
        System.out.print("RemoteControl: ");
        device.setChannel(device.getChannel() + 1);
    }
}
