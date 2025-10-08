namespace AbstractFactory;

/// <summary>
/// The Abstract Factory interface declares a set of methods that return
/// different abstract products (Button and Checkbox).
/// These products form a family and are related by a high-level theme or concept.
/// </summary>
public interface IGUIFactory
{
    /// <summary>
    /// Creates a button appropriate for the platform.
    /// </summary>
    IButton CreateButton();

    /// <summary>
    /// Creates a checkbox appropriate for the platform.
    /// </summary>
    ICheckbox CreateCheckbox();
}
