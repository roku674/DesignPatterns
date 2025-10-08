namespace Adapter;

/// <summary>
/// Concrete Adaptee - MP4 media player implementation.
/// Another third-party class with incompatible interface.
/// </summary>
public class Mp4Player : IAdvancedMediaPlayer
{
    public void PlayVlc(string fileName)
    {
        // MP4 player doesn't support VLC format
        // This method is part of the interface but does nothing
    }

    public void PlayMp4(string fileName)
    {
        Console.WriteLine($"Playing MP4 file: {fileName}");
    }
}
