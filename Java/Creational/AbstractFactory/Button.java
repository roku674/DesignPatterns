import javax.swing.JButton;
import java.awt.event.ActionListener;

/**
 * Abstract Product A - Button interface with real Swing functionality
 */
public interface Button {

    /**
     * Gets the underlying Swing component
     *
     * @return JButton component
     */
    JButton getComponent();

    /**
     * Sets the button text
     *
     * @param text the text to display
     */
    void setText(String text);

    /**
     * Sets the click action listener
     *
     * @param listener the action to perform on click
     */
    void setOnClickListener(ActionListener listener);

    /**
     * Sets whether the button is enabled
     *
     * @param enabled true to enable, false to disable
     */
    void setEnabled(boolean enabled);

    /**
     * Gets the button style name
     *
     * @return the style identifier
     */
    String getStyle();
}
