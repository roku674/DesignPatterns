using System.Text;

namespace AbstractFactory;

/// <summary>
/// Production-ready Bootstrap button implementation.
/// </summary>
public class BootstrapButton : IButton, IUIComponent
{
    private string _text;
    private string _id;
    private ButtonType _type;
    private string _size;
    private bool _disabled;
    private bool _outline;

    public BootstrapButton(string text, ButtonType type = ButtonType.Primary, string size = "md")
    {
        _text = text ?? throw new ArgumentNullException(nameof(text));
        _id = $"btn_{Guid.NewGuid():N}";
        _type = type;
        _size = size;
        _disabled = false;
        _outline = false;
    }

    public void Click()
    {
        if (_disabled)
        {
            Console.WriteLine($"[Bootstrap Button] Button '{_text}' is disabled");
            return;
        }

        Console.WriteLine($"[Bootstrap Button] Clicked: {_text}");
    }

    public void SetEnabled(bool enabled)
    {
        _disabled = !enabled;
    }

    public void SetText(string text)
    {
        _text = text ?? throw new ArgumentNullException(nameof(text));
    }

    public void SetOutline(bool outline)
    {
        _outline = outline;
    }

    public string RenderToHtml()
    {
        StringBuilder html = new StringBuilder();
        string cssClasses = GetCssClasses();

        html.Append($"<button id=\"{_id}\" type=\"button\" class=\"{cssClasses}\"");

        if (_disabled)
        {
            html.Append(" disabled");
        }

        Dictionary<string, string> a11y = GetAccessibilityAttributes();
        foreach (KeyValuePair<string, string> attr in a11y)
        {
            html.Append($" {attr.Key}=\"{attr.Value}\"");
        }

        html.Append(">");
        html.Append(_text);
        html.Append("</button>");

        return html.ToString();
    }

    public void RenderToConsole()
    {
        string prefix = _type switch
        {
            ButtonType.Primary => "[PRIMARY]",
            ButtonType.Secondary => "[SECONDARY]",
            ButtonType.Danger => "[DANGER]",
            _ => "[BUTTON]"
        };

        string outlineText = _outline ? " outline" : "";
        string status = _disabled ? " (disabled)" : "";
        string border = new string('-', _text.Length + 4);

        Console.WriteLine($"+{border}+");
        Console.WriteLine($"| {_text}  | Bootstrap{outlineText} {prefix}{status}");
        Console.WriteLine($"+{border}+");
    }

    public Dictionary<string, string> GetAccessibilityAttributes()
    {
        return new Dictionary<string, string>
        {
            { "role", "button" },
            { "aria-label", _text },
            { "aria-disabled", _disabled.ToString().ToLower() }
        };
    }

    public bool Validate()
    {
        return !string.IsNullOrWhiteSpace(_text);
    }

    private string GetCssClasses()
    {
        string baseClass = "btn";
        string sizeClass = _size switch
        {
            "sm" => "btn-sm",
            "lg" => "btn-lg",
            _ => ""
        };

        string stylePrefix = _outline ? "btn-outline" : "btn";
        string typeClass = _type switch
        {
            ButtonType.Primary => $"{stylePrefix}-primary",
            ButtonType.Secondary => $"{stylePrefix}-secondary",
            ButtonType.Danger => $"{stylePrefix}-danger",
            _ => $"{stylePrefix}-primary"
        };

        return $"{baseClass} {typeClass} {sizeClass}".Trim();
    }
}
