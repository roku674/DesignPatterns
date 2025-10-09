namespace AbstractFactory;

/// <summary>
/// Concrete factory that creates Material Design UI components.
/// Produces real, renderable UI elements.
/// </summary>
public class MaterialFactory : IGUIFactory
{
    private readonly string _theme;
    private readonly Dictionary<string, string> _themeColors;

    public MaterialFactory(string theme = "light")
    {
        _theme = theme;
        _themeColors = theme == "dark"
            ? new Dictionary<string, string>
            {
                { "primary", "#bb86fc" },
                { "secondary", "#03dac6" },
                { "background", "#121212" },
                { "surface", "#1e1e1e" }
            }
            : new Dictionary<string, string>
            {
                { "primary", "#6200ee" },
                { "secondary", "#03dac6" },
                { "background", "#ffffff" },
                { "surface", "#f5f5f5" }
            };
    }

    public IButton CreateButton()
    {
        return new MaterialButton("Material Button", ButtonType.Primary);
    }

    public ICheckbox CreateCheckbox()
    {
        return new MaterialCheckbox("Material Checkbox");
    }

    public IButton CreateButton(string text, ButtonType type)
    {
        return new MaterialButton(text, type);
    }

    public ICheckbox CreateCheckbox(string label)
    {
        return new MaterialCheckbox(label);
    }

    public string GetTheme()
    {
        return $"Material Design ({_theme})";
    }

    public Dictionary<string, string> GetThemeColors()
    {
        return new Dictionary<string, string>(_themeColors);
    }

    public string RenderPage(string title, List<IUIComponent> components)
    {
        System.Text.StringBuilder html = new System.Text.StringBuilder();

        html.AppendLine("<!DOCTYPE html>");
        html.AppendLine("<html lang=\"en\">");
        html.AppendLine("<head>");
        html.AppendLine("  <meta charset=\"UTF-8\">");
        html.AppendLine("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.AppendLine($"  <title>{title}</title>");
        html.AppendLine("  <link href=\"https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css\" rel=\"stylesheet\">");
        html.AppendLine("  <style>");
        html.AppendLine($"    body {{ background-color: {_themeColors["background"]}; padding: 20px; }}");
        html.AppendLine($"    .container {{ max-width: 800px; margin: 0 auto; background: {_themeColors["surface"]}; padding: 20px; border-radius: 8px; }}");
        html.AppendLine("    .component { margin: 16px 0; }");
        html.AppendLine("  </style>");
        html.AppendLine("</head>");
        html.AppendLine("<body>");
        html.AppendLine("  <div class=\"container\">");
        html.AppendLine($"    <h1>{title}</h1>");

        foreach (IUIComponent component in components)
        {
            html.AppendLine("    <div class=\"component\">");
            html.AppendLine($"      {component.RenderToHtml()}");
            html.AppendLine("    </div>");
        }

        html.AppendLine("  </div>");
        html.AppendLine("  <script src=\"https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js\"></script>");
        html.AppendLine("</body>");
        html.AppendLine("</html>");

        return html.ToString();
    }
}
