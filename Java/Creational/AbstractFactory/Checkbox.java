import javax.swing.JCheckBox;
import java.awt.event.ItemListener;

/**
 * Abstract Product B - Checkbox interface with real Swing functionality
 */
public interface Checkbox {

    /**
     * Gets the underlying Swing component
     *
     * @return JCheckBox component
     */
    JCheckBox getComponent();

    /**
     * Sets the checkbox label text
     *
     * @param text the text to display
     */
    void setText(String text);

    /**
     * Sets the checked state
     *
     * @param selected true to check, false to uncheck
     */
    void setSelected(boolean selected);

    /**
     * Gets the checked state
     *
     * @return true if checked, false otherwise
     */
    boolean isSelected();

    /**
     * Sets the state change listener
     *
     * @param listener the listener for state changes
     */
    void setOnChangeListener(ItemListener listener);

    /**
     * Gets the checkbox style name
     *
     * @return the style identifier
     */
    String getStyle();
}
