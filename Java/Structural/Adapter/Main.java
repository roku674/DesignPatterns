/**
 * Main class to demonstrate the Adapter pattern
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Adapter Pattern Demo ===\n");

        AudioPlayer audioPlayer = new AudioPlayer();

        System.out.println("--- Playing Different Audio Formats ---\n");

        // Play MP3 (built-in support)
        audioPlayer.play("mp3", "song.mp3");

        System.out.println();

        // Play MP4 (through adapter)
        audioPlayer.play("mp4", "video_audio.mp4");

        System.out.println();

        // Play VLC (through adapter)
        audioPlayer.play("vlc", "movie_audio.vlc");

        System.out.println();

        // Try unsupported format
        audioPlayer.play("avi", "video.avi");

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\n--- Playing Multiple Files ---\n");

        String[] files = {
            "mp3:favorite_song.mp3",
            "mp4:workout_music.mp4",
            "vlc:podcast.vlc",
            "mp3:audiobook.mp3"
        };

        for (String file : files) {
            String[] parts = file.split(":");
            String format = parts[0];
            String fileName = parts[1];

            System.out.println("Attempting to play: " + fileName);
            audioPlayer.play(format, fileName);
            System.out.println();
        }

        System.out.println("=".repeat(50));
        System.out.println("\nAdapter Pattern Benefits:");
        System.out.println("- AudioPlayer can play formats it doesn't natively support");
        System.out.println("- New formats can be added without modifying AudioPlayer");
        System.out.println("- Incompatible interfaces work together seamlessly");
    }
}
