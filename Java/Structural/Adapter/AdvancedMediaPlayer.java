/**
 * Adaptee interface - the incompatible interface that needs to be adapted
 */
public interface AdvancedMediaPlayer {

    /**
     * Plays VLC format audio
     *
     * @param fileName the name of the VLC file
     */
    void playVlc(String fileName);

    /**
     * Plays MP4 format audio
     *
     * @param fileName the name of the MP4 file
     */
    void playMp4(String fileName);
}
