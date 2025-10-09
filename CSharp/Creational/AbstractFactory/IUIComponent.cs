namespace AbstractFactory;

/// <summary>
/// Base interface for all UI components.
/// </summary>
public interface IUIComponent
{
    /// <summary>
    /// Renders the component to HTML.
    /// </summary>
    string RenderToHtml();

    /// <summary>
    /// Renders the component to console (text-based UI).
    /// </summary>
    void RenderToConsole();

    /// <summary>
    /// Gets the component's accessibility attributes.
    /// </summary>
    Dictionary<string, string> GetAccessibilityAttributes();

    /// <summary>
    /// Validates the component's state.
    /// </summary>
    bool Validate();
}
