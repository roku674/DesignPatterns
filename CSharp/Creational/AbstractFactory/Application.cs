namespace AbstractFactory;

/// <summary>
/// The application works with factories and products only through abstract types.
/// This lets you pass any factory or product subclass to the application without breaking it.
/// </summary>
public class Application
{
    private readonly IButton _button;
    private readonly ICheckbox _checkbox;

    /// <summary>
    /// Application constructor accepts a factory instance.
    /// </summary>
    public Application(IGUIFactory factory)
    {
        _button = factory.CreateButton();
        _checkbox = factory.CreateCheckbox();
    }

    /// <summary>
    /// Renders the UI using the components created by the factory.
    /// </summary>
    public void RenderUI()
    {
        Console.WriteLine("\n--- Rendering Application UI ---");
        _button.Render();
        _checkbox.Render();
    }

    /// <summary>
    /// Simulates user interaction with the UI components.
    /// </summary>
    public void InteractWithUI()
    {
        Console.WriteLine("\n--- User Interaction ---");
        _button.OnClick();
        _checkbox.Toggle();
    }
}
