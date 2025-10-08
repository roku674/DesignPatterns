namespace AbstractFactory;

/// <summary>
/// Concrete factory that creates Windows-themed GUI components.
/// </summary>
public class WindowsFactory : IGUIFactory
{
    public IButton CreateButton()
    {
        return new WindowsButton();
    }

    public ICheckbox CreateCheckbox()
    {
        return new WindowsCheckbox();
    }
}
