namespace Adapter;

/// <summary>
/// Target interface that the client expects to work with.
/// This is the interface our application uses for media playback.
/// </summary>
public interface IMediaPlayer
{
    /// <summary>
    /// Plays a media file of the specified type.
    /// </summary>
    void Play(string audioType, string fileName);
}
