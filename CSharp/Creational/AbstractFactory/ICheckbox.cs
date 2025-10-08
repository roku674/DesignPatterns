namespace AbstractFactory;

/// <summary>
/// Abstract product interface for checkboxes.
/// </summary>
public interface ICheckbox
{
    /// <summary>
    /// Renders the checkbox on screen.
    /// </summary>
    void Render();

    /// <summary>
    /// Toggles the checkbox state.
    /// </summary>
    void Toggle();
}
