using System.Text;

namespace AbstractFactory;

/// <summary>
/// Production-ready Material Design checkbox implementation.
/// </summary>
public class MaterialCheckbox : ICheckbox, IUIComponent
{
    private string _label;
    private string _id;
    private bool _checked;
    private bool _disabled;
    private Action<bool>? _onChange;

    public MaterialCheckbox(string label)
    {
        _label = label ?? throw new ArgumentNullException(nameof(label));
        _id = $"chk_{Guid.NewGuid():N}";
        _checked = false;
        _disabled = false;
    }

    public void Check()
    {
        if (_disabled) return;

        _checked = true;
        Console.WriteLine($"[Material Checkbox] Checked: {_label}");
        _onChange?.Invoke(true);
    }

    public void Uncheck()
    {
        if (_disabled) return;

        _checked = false;
        Console.WriteLine($"[Material Checkbox] Unchecked: {_label}");
        _onChange?.Invoke(false);
    }

    public void Toggle()
    {
        if (_checked)
        {
            Uncheck();
        }
        else
        {
            Check();
        }
    }

    public bool IsChecked()
    {
        return _checked;
    }

    public void SetOnChange(Action<bool> handler)
    {
        _onChange = handler;
    }

    public string RenderToHtml()
    {
        StringBuilder html = new StringBuilder();

        html.Append("<div class=\"mdc-form-field\">");
        html.Append($"  <div class=\"mdc-checkbox\" style=\"{GetInlineStyles()}\">");
        html.Append($"    <input type=\"checkbox\" id=\"{_id}\" class=\"mdc-checkbox__native-control\"");

        if (_checked)
        {
            html.Append(" checked");
        }

        if (_disabled)
        {
            html.Append(" disabled");
        }

        Dictionary<string, string> a11y = GetAccessibilityAttributes();
        foreach (KeyValuePair<string, string> attr in a11y)
        {
            html.Append($" {attr.Key}=\"{attr.Value}\"");
        }

        html.Append(" />");
        html.Append("    <div class=\"mdc-checkbox__background\">");
        html.Append("      <svg class=\"mdc-checkbox__checkmark\" viewBox=\"0 0 24 24\">");
        html.Append("        <path class=\"mdc-checkbox__checkmark-path\" fill=\"none\" d=\"M1.73,12.91 8.1,19.28 22.79,4.59\"/>");
        html.Append("      </svg>");
        html.Append("    </div>");
        html.Append("  </div>");
        html.Append($"  <label for=\"{_id}\">{_label}</label>");
        html.Append("</div>");

        return html.ToString();
    }

    public void RenderToConsole()
    {
        string checkmark = _checked ? "☑" : "☐";
        string status = _disabled ? " (disabled)" : "";
        Console.WriteLine($"{checkmark} {_label}{status}");
    }

    public Dictionary<string, string> GetAccessibilityAttributes()
    {
        return new Dictionary<string, string>
        {
            { "role", "checkbox" },
            { "aria-label", _label },
            { "aria-checked", _checked.ToString().ToLower() },
            { "aria-disabled", _disabled.ToString().ToLower() }
        };
    }

    public bool Validate()
    {
        return !string.IsNullOrWhiteSpace(_label);
    }

    private string GetInlineStyles()
    {
        return "display: inline-flex; position: relative; align-items: center; cursor: pointer;";
    }
}
