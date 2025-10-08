namespace Adapter;

/// <summary>
/// Concrete Adaptee - VLC media player implementation.
/// This is a third-party class that we want to use but has incompatible interface.
/// </summary>
public class VlcPlayer : IAdvancedMediaPlayer
{
    public void PlayVlc(string fileName)
    {
        Console.WriteLine($"Playing VLC file: {fileName}");
    }

    public void PlayMp4(string fileName)
    {
        // VLC player doesn't support MP4 directly
        // This method is part of the interface but does nothing
    }
}
