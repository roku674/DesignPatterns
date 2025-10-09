namespace AbstractFactory;

/// <summary>
/// Concrete factory that creates Bootstrap UI components.
/// Produces real, renderable UI elements.
/// </summary>
public class BootstrapFactory : IGUIFactory
{
    private readonly int _version;
    private readonly string _theme;

    public BootstrapFactory(int version = 5, string theme = "light")
    {
        _version = version;
        _theme = theme;
    }

    public IButton CreateButton()
    {
        return new BootstrapButton("Bootstrap Button", ButtonType.Primary);
    }

    public ICheckbox CreateCheckbox()
    {
        return new BootstrapCheckbox("Bootstrap Checkbox");
    }

    public IButton CreateButton(string text, ButtonType type)
    {
        return new BootstrapButton(text, type);
    }

    public ICheckbox CreateCheckbox(string label)
    {
        return new BootstrapCheckbox(label);
    }

    public string GetTheme()
    {
        return $"Bootstrap {_version} ({_theme})";
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
        html.AppendLine($"  <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@{_version}.3.0/dist/css/bootstrap.min.css\" rel=\"stylesheet\">");

        if (_theme == "dark")
        {
            html.AppendLine("  <style>");
            html.AppendLine("    body { background-color: #212529; color: #fff; }");
            html.AppendLine("    .container { background-color: #343a40; }");
            html.AppendLine("  </style>");
        }

        html.AppendLine("</head>");
        html.AppendLine($"<body{(_theme == "dark" ? " data-bs-theme=\"dark\"" : "")}>");
        html.AppendLine("  <div class=\"container mt-5\">");
        html.AppendLine($"    <h1 class=\"mb-4\">{title}</h1>");

        foreach (IUIComponent component in components)
        {
            html.AppendLine("    <div class=\"mb-3\">");
            html.AppendLine($"      {component.RenderToHtml()}");
            html.AppendLine("    </div>");
        }

        html.AppendLine("  </div>");
        html.AppendLine($"  <script src=\"https://cdn.jsdelivr.net/npm/bootstrap@{_version}.3.0/dist/js/bootstrap.bundle.min.js\"></script>");
        html.AppendLine("</body>");
        html.AppendLine("</html>");

        return html.ToString();
    }
}
