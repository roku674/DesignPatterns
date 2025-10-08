namespace Bridge;

/// <summary>
/// Abstraction that defines the remote control interface.
/// It contains a reference to the implementation (IDevice) and delegates work to it.
/// </summary>
public class RemoteControl
{
    protected IDevice _device;

    public RemoteControl(IDevice device)
    {
        _device = device;
    }

    public virtual void TogglePower()
    {
        Console.WriteLine("RemoteControl: Toggle power");
        if (_device.IsEnabled())
        {
            _device.Disable();
        }
        else
        {
            _device.Enable();
        }
    }

    public virtual void VolumeDown()
    {
        Console.WriteLine("RemoteControl: Volume down");
        _device.SetVolume(_device.GetVolume() - 10);
    }

    public virtual void VolumeUp()
    {
        Console.WriteLine("RemoteControl: Volume up");
        _device.SetVolume(_device.GetVolume() + 10);
    }

    public virtual void ChannelDown()
    {
        Console.WriteLine("RemoteControl: Channel down");
        _device.SetChannel(_device.GetChannel() - 1);
    }

    public virtual void ChannelUp()
    {
        Console.WriteLine("RemoteControl: Channel up");
        _device.SetChannel(_device.GetChannel() + 1);
    }
}
