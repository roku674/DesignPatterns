namespace AbstractFactory;

/// <summary>
/// Concrete Windows-style button.
/// </summary>
public class WindowsButton : IButton
{
    public void Render()
    {
        Console.WriteLine("Rendering Windows-style button with blue theme");
    }

    public void OnClick()
    {
        Console.WriteLine("Windows button clicked - Standard Windows behavior");
    }
}
