import javax.swing.JCheckBox;
import java.awt.Color;
import java.awt.Font;
import java.awt.event.ItemListener;

/**
 * Concrete Product B1 - Windows-style checkbox with real Swing implementation
 */
public class WindowsCheckbox implements Checkbox {

    private final JCheckBox checkbox;

    public WindowsCheckbox() {
        checkbox = new JCheckBox();
        applyWindowsStyle();
    }

    /**
     * Applies Windows-specific styling to the checkbox
     */
    private void applyWindowsStyle() {
        checkbox.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        checkbox.setBackground(Color.WHITE);
        checkbox.setForeground(new Color(0, 0, 0));
        checkbox.setFocusPainted(false);
    }

    @Override
    public JCheckBox getComponent() {
        return checkbox;
    }

    @Override
    public void setText(String text) {
        checkbox.setText(text);
    }

    @Override
    public void setSelected(boolean selected) {
        checkbox.setSelected(selected);
    }

    @Override
    public boolean isSelected() {
        return checkbox.isSelected();
    }

    @Override
    public void setOnChangeListener(ItemListener listener) {
        checkbox.addItemListener(listener);
    }

    @Override
    public String getStyle() {
        return "Windows";
    }
}
