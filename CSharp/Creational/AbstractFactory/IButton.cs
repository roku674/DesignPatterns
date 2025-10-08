namespace AbstractFactory;

/// <summary>
/// Abstract product interface for buttons.
/// </summary>
public interface IButton
{
    /// <summary>
    /// Renders the button on screen.
    /// </summary>
    void Render();

    /// <summary>
    /// Handles click event.
    /// </summary>
    void OnClick();
}
