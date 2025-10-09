import javax.swing.JCheckBox;
import java.awt.Color;
import java.awt.Font;
import java.awt.event.ItemListener;

/**
 * Concrete Product B2 - Mac-style checkbox with real Swing implementation
 */
public class MacCheckbox implements Checkbox {

    private final JCheckBox checkbox;

    public MacCheckbox() {
        checkbox = new JCheckBox();
        applyMacStyle();
    }

    /**
     * Applies Mac-specific styling to the checkbox
     */
    private void applyMacStyle() {
        checkbox.setFont(new Font("SF Pro Display", Font.PLAIN, 13));
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
        return "Mac";
    }
}
