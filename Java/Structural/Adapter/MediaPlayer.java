/**
 * Target interface - the interface that clients expect
 */
public interface MediaPlayer {

    /**
     * Plays audio in the specified format
     *
     * @param audioType the type of audio file
     * @param fileName the name of the file to play
     */
    void play(String audioType, String fileName);
}
