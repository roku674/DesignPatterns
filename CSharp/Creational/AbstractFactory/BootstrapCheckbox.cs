using System.Text;

namespace AbstractFactory;

/// <summary>
/// Production-ready Bootstrap checkbox implementation.
/// </summary>
public class BootstrapCheckbox : ICheckbox, IUIComponent
{
    private string _label;
    private string _id;
    private bool _checked;
    private bool _disabled;
    private bool _isSwitch;

    public BootstrapCheckbox(string label, bool isSwitch = false)
    {
        _label = label ?? throw new ArgumentNullException(nameof(label));
        _id = $"chk_{Guid.NewGuid():N}";
        _checked = false;
        _disabled = false;
        _isSwitch = isSwitch;
    }

    public void Check()
    {
        if (_disabled) return;

        _checked = true;
        Console.WriteLine($"[Bootstrap Checkbox] Checked: {_label}");
    }

    public void Uncheck()
    {
        if (_disabled) return;

        _checked = false;
        Console.WriteLine($"[Bootstrap Checkbox] Unchecked: {_label}");
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

    public string RenderToHtml()
    {
        StringBuilder html = new StringBuilder();
        string formCheckClass = _isSwitch ? "form-check form-switch" : "form-check";

        html.AppendLine($"<div class=\"{formCheckClass}\">");
        html.Append($"  <input class=\"form-check-input\" type=\"checkbox\" id=\"{_id}\"");

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

        html.AppendLine(">");
        html.AppendLine($"  <label class=\"form-check-label\" for=\"{_id}\">");
        html.AppendLine($"    {_label}");
        html.AppendLine("  </label>");
        html.AppendLine("</div>");

        return html.ToString();
    }

    public void RenderToConsole()
    {
        string checkmark = _checked ? "[X]" : "[ ]";
        string switchText = _isSwitch ? " (switch)" : "";
        string status = _disabled ? " (disabled)" : "";
        Console.WriteLine($"{checkmark} {_label}{switchText}{status}");
    }

    public Dictionary<string, string> GetAccessibilityAttributes()
    {
        return new Dictionary<string, string>
        {
            { "role", _isSwitch ? "switch" : "checkbox" },
            { "aria-label", _label },
            { "aria-checked", _checked.ToString().ToLower() },
            { "aria-disabled", _disabled.ToString().ToLower() }
        };
    }

    public bool Validate()
    {
        return !string.IsNullOrWhiteSpace(_label);
    }
}
