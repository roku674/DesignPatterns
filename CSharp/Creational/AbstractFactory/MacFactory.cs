namespace AbstractFactory;

/// <summary>
/// Concrete factory that creates macOS-themed GUI components.
/// </summary>
public class MacFactory : IGUIFactory
{
    public IButton CreateButton()
    {
        return new MacButton();
    }

    public ICheckbox CreateCheckbox()
    {
        return new MacCheckbox();
    }
}
