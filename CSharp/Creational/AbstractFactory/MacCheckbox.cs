namespace AbstractFactory;

/// <summary>
/// Concrete macOS-style checkbox.
/// </summary>
public class MacCheckbox : ICheckbox
{
    public void Render()
    {
        Console.WriteLine("Rendering macOS-style checkbox with circular design");
    }

    public void Toggle()
    {
        Console.WriteLine("Mac checkbox toggled - Smooth slide animation");
    }
}
