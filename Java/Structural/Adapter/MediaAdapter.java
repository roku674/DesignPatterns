/**
 * Adapter class - adapts AdvancedMediaPlayer to MediaPlayer interface
 *
 * This class makes incompatible AdvancedMediaPlayer interface compatible
 * with the MediaPlayer interface that clients expect.
 */
public class MediaAdapter implements MediaPlayer {

    private AdvancedMediaPlayer advancedMediaPlayer;

    /**
     * Constructor - creates appropriate advanced player based on audio type
     *
     * @param audioType the type of audio file
     */
    public MediaAdapter(String audioType) {
        if (audioType.equalsIgnoreCase("vlc")) {
            advancedMediaPlayer = new VlcPlayer();
        } else if (audioType.equalsIgnoreCase("mp4")) {
            advancedMediaPlayer = new Mp4Player();
        }
    }

    @Override
    public void play(String audioType, String fileName) {
        if (audioType.equalsIgnoreCase("vlc")) {
            advancedMediaPlayer.playVlc(fileName);
        } else if (audioType.equalsIgnoreCase("mp4")) {
            advancedMediaPlayer.playMp4(fileName);
        }
    }
}
