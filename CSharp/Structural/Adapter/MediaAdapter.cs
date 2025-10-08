namespace Adapter;

/// <summary>
/// Adapter class that makes IAdvancedMediaPlayer compatible with IMediaPlayer interface.
/// This adapter allows us to use third-party media players through our standard interface.
/// </summary>
public class MediaAdapter : IMediaPlayer
{
    private readonly IAdvancedMediaPlayer _advancedMediaPlayer;

    /// <summary>
    /// Constructor creates the appropriate player based on audio type.
    /// </summary>
    public MediaAdapter(string audioType)
    {
        _advancedMediaPlayer = audioType.ToLower() switch
        {
            "vlc" => new VlcPlayer(),
            "mp4" => new Mp4Player(),
            _ => throw new ArgumentException($"Invalid media type: {audioType}")
        };
    }

    /// <summary>
    /// Adapts the Play method to use the appropriate advanced player method.
    /// </summary>
    public void Play(string audioType, string fileName)
    {
        string type = audioType.ToLower();

        if (type.Equals("vlc"))
        {
            _advancedMediaPlayer.PlayVlc(fileName);
        }
        else if (type.Equals("mp4"))
        {
            _advancedMediaPlayer.PlayMp4(fileName);
        }
    }
}
