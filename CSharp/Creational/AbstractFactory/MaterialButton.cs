using System.Text;

namespace AbstractFactory;

/// <summary>
/// Production-ready Material Design button implementation.
/// Actually generates HTML and renders to console.
/// </summary>
public class MaterialButton : IButton, IUIComponent
{
    private string _text;
    private string _id;
    private ButtonType _type;
    private bool _disabled;
    private Dictionary<string, string> _attributes;
    private Action? _onClick;

    public MaterialButton(string text, ButtonType type = ButtonType.Primary)
    {
        _text = text ?? throw new ArgumentNullException(nameof(text));
        _id = $"btn_{Guid.NewGuid():N}";
        _type = type;
        _disabled = false;
        _attributes = new Dictionary<string, string>();
    }

    public void Click()
    {
        if (_disabled)
        {
            Console.WriteLine($"[Material Button] Button '{_text}' is disabled");
            return;
        }

        Console.WriteLine($"[Material Button] Clicked: {_text}");
        _onClick?.Invoke();
    }

    public void SetEnabled(bool enabled)
    {
        _disabled = !enabled;
    }

    public void SetText(string text)
    {
        _text = text ?? throw new ArgumentNullException(nameof(text));
    }

    public void SetOnClick(Action handler)
    {
        _onClick = handler;
    }

    public string RenderToHtml()
    {
        StringBuilder html = new StringBuilder();
        string cssClasses = GetCssClasses();
        string styles = GetInlineStyles();

        html.Append($"<button id=\"{_id}\" class=\"{cssClasses}\" style=\"{styles}\"");

        if (_disabled)
        {
            html.Append(" disabled");
        }

        foreach (KeyValuePair<string, string> attr in _attributes)
        {
            html.Append($" {attr.Key}=\"{attr.Value}\"");
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

        string status = _disabled ? " (disabled)" : "";
        string border = new string('═', _text.Length + 4);

        Console.WriteLine($"╔{border}╗");
        Console.WriteLine($"║  {_text}  ║ {prefix}{status}");
        Console.WriteLine($"╚{border}╝");
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
        string baseClass = "mdc-button mdc-button--raised";
        string typeClass = _type switch
        {
            ButtonType.Primary => "mdc-button--primary",
            ButtonType.Secondary => "mdc-button--secondary",
            ButtonType.Danger => "mdc-button--danger",
            _ => ""
        };

        return $"{baseClass} {typeClass}".Trim();
    }

    private string GetInlineStyles()
    {
        return _type switch
        {
            ButtonType.Primary => "background-color: #6200ee; color: white; padding: 8px 16px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);",
            ButtonType.Secondary => "background-color: #03dac6; color: black; padding: 8px 16px; border-radius: 4px;",
            ButtonType.Danger => "background-color: #b00020; color: white; padding: 8px 16px; border-radius: 4px;",
            _ => "padding: 8px 16px; border-radius: 4px;"
        };
    }
}

public enum ButtonType
{
    Primary,
    Secondary,
    Danger
}
