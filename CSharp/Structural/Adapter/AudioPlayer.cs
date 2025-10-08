namespace Adapter;

/// <summary>
/// Concrete implementation of IMediaPlayer that can play MP3 files natively
/// and uses MediaAdapter for other formats.
/// </summary>
public class AudioPlayer : IMediaPlayer
{
    /// <summary>
    /// Plays audio files. Uses adapter for advanced formats.
    /// </summary>
    public void Play(string audioType, string fileName)
    {
        string type = audioType.ToLower();

        // Built-in support for MP3
        if (type.Equals("mp3"))
        {
            Console.WriteLine($"Playing MP3 file: {fileName}");
        }
        // Use adapter for other formats
        else if (type.Equals("vlc") || type.Equals("mp4"))
        {
            MediaAdapter mediaAdapter = new MediaAdapter(audioType);
            mediaAdapter.Play(audioType, fileName);
        }
        else
        {
            Console.WriteLine($"Invalid media type: {audioType}. Format not supported.");
        }
    }
}
