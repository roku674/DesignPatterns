namespace Bridge;

/// <summary>
/// Implementation interface for all device types.
/// This interface separates the abstraction (RemoteControl) from implementation (Device).
/// </summary>
public interface IDevice
{
    /// <summary>
    /// Checks if the device is currently enabled.
    /// </summary>
    bool IsEnabled();

    /// <summary>
    /// Turns the device on or off.
    /// </summary>
    void Enable();

    void Disable();

    /// <summary>
    /// Gets the current volume level (0-100).
    /// </summary>
    int GetVolume();

    /// <summary>
    /// Sets the volume level (0-100).
    /// </summary>
    void SetVolume(int percent);

    /// <summary>
    /// Gets the current channel number.
    /// </summary>
    int GetChannel();

    /// <summary>
    /// Sets the channel number.
    /// </summary>
    void SetChannel(int channel);

    /// <summary>
    /// Prints device status information.
    /// </summary>
    void PrintStatus();
}
