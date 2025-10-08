/**
 * Main class to demonstrate the Bridge pattern
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Bridge Pattern Demo ===\n");

        System.out.println("--- Testing TV with Basic Remote ---");
        Device tv = new TV();
        RemoteControl basicRemote = new RemoteControl(tv);

        basicRemote.togglePower();
        basicRemote.volumeUp();
        basicRemote.channelUp();
        basicRemote.channelUp();

        System.out.println("\n--- Testing TV with Advanced Remote ---");
        AdvancedRemoteControl advancedRemote = new AdvancedRemoteControl(tv);
        advancedRemote.setChannelDirectly(55);
        advancedRemote.mute();
        advancedRemote.togglePower();

        System.out.println("\n--- Testing Radio with Basic Remote ---");
        Device radio = new Radio();
        RemoteControl radioRemote = new RemoteControl(radio);

        radioRemote.togglePower();
        radioRemote.volumeUp();
        radioRemote.volumeUp();
        radioRemote.channelUp();

        System.out.println("\n--- Testing Radio with Advanced Remote ---");
        AdvancedRemoteControl advancedRadioRemote = new AdvancedRemoteControl(radio);
        advancedRadioRemote.setChannelDirectly(1013);
        advancedRadioRemote.mute();

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nBridge Pattern Benefits:");
        System.out.println("- Abstractions and implementations can vary independently");
        System.out.println("- New devices can be added without changing remote controls");
        System.out.println("- New remote types can be added without changing devices");
    }
}
