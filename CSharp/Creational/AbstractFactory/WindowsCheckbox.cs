namespace AbstractFactory;

/// <summary>
/// Concrete Windows-style checkbox.
/// </summary>
public class WindowsCheckbox : ICheckbox
{
    public void Render()
    {
        Console.WriteLine("Rendering Windows-style checkbox with square design");
    }

    public void Toggle()
    {
        Console.WriteLine("Windows checkbox toggled - Checkmark animation");
    }
}
