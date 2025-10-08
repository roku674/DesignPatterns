namespace Adapter;

/// <summary>
/// Demonstrates the Adapter pattern with a media player example.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Adapter Pattern Demo ===");
        Console.WriteLine("Media Player Application\n");

        AudioPlayer audioPlayer = new AudioPlayer();

        Console.WriteLine("--- Playing Different Media Formats ---\n");

        // Play MP3 (native support)
        audioPlayer.Play("mp3", "song.mp3");
        Console.WriteLine();

        // Play MP4 (using adapter)
        audioPlayer.Play("mp4", "video.mp4");
        Console.WriteLine();

        // Play VLC (using adapter)
        audioPlayer.Play("vlc", "movie.vlc");
        Console.WriteLine();

        // Unsupported format
        audioPlayer.Play("avi", "video.avi");
        Console.WriteLine();

        Console.WriteLine("\n" + new string('=', 60));
        Console.WriteLine("\n--- Direct Adapter Usage ---\n");

        // You can also use the adapter directly
        Console.WriteLine("Using MediaAdapter directly for VLC:");
        IMediaPlayer vlcAdapter = new MediaAdapter("vlc");
        vlcAdapter.Play("vlc", "documentary.vlc");

        Console.WriteLine("\nUsing MediaAdapter directly for MP4:");
        IMediaPlayer mp4Adapter = new MediaAdapter("mp4");
        mp4Adapter.Play("mp4", "presentation.mp4");

        Console.WriteLine("\n" + new string('=', 60));
        Console.WriteLine("\n--- Real-World Scenario ---\n");

        // Simulate a playlist with different formats
        string[] playlist = { "intro.mp3", "tutorial.mp4", "outro.vlc" };

        Console.WriteLine("Playing Playlist:");
        foreach (string file in playlist)
        {
            string extension = file.Split('.')[1];
            Console.Write($"  [{file}] -> ");
            audioPlayer.Play(extension, file);
        }
    }
}
