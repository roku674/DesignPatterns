/**
 * Concrete Adaptee - VLC player implementation
 */
public class VlcPlayer implements AdvancedMediaPlayer {

    @Override
    public void playVlc(String fileName) {
        System.out.println("Playing VLC file: " + fileName);
    }

    @Override
    public void playMp4(String fileName) {
        // VLC player doesn't support MP4 through this interface
        // Do nothing
    }
}
