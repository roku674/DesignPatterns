namespace AbstractFactory;

/// <summary>
/// Concrete macOS-style button.
/// </summary>
public class MacButton : IButton
{
    public void Render()
    {
        Console.WriteLine("Rendering macOS-style button with rounded corners");
    }

    public void OnClick()
    {
        Console.WriteLine("Mac button clicked - Smooth fade animation");
    }
}
