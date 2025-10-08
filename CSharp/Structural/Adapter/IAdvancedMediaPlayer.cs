namespace Adapter;

/// <summary>
/// Adaptee interface - third-party or legacy interface with different method signatures.
/// This represents external media libraries with their own interfaces.
/// </summary>
public interface IAdvancedMediaPlayer
{
    /// <summary>
    /// Plays VLC format files.
    /// </summary>
    void PlayVlc(string fileName);

    /// <summary>
    /// Plays MP4 format files.
    /// </summary>
    void PlayMp4(string fileName);
}
