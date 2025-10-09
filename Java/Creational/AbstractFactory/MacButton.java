import javax.swing.JButton;
import javax.swing.BorderFactory;
import java.awt.Color;
import java.awt.Font;
import java.awt.Dimension;
import java.awt.event.ActionListener;

/**
 * Concrete Product A2 - Mac-style button with real Swing implementation
 */
public class MacButton implements Button {

    private final JButton button;

    public MacButton() {
        button = new JButton();
        applyMacStyle();
    }

    /**
     * Applies Mac-specific styling to the button
     */
    private void applyMacStyle() {
        // Mac uses rounded, glossy buttons with subtle gradients
        button.setBackground(new Color(0, 122, 255)); // Mac system blue
        button.setForeground(Color.WHITE);
        button.setFont(new Font("SF Pro Display", Font.PLAIN, 13));
        button.setFocusPainted(false);
        button.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(0, 100, 220), 1, true), // Rounded border
            BorderFactory.createEmptyBorder(6, 20, 6, 20)
        ));
        button.setPreferredSize(new Dimension(120, 32));
        button.setOpaque(true);

        // Add hover effect
        button.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                button.setBackground(new Color(10, 132, 255)); // Lighter blue on hover
            }

            public void mouseExited(java.awt.event.MouseEvent evt) {
                button.setBackground(new Color(0, 122, 255)); // Original blue
            }
        });
    }

    @Override
    public JButton getComponent() {
        return button;
    }

    @Override
    public void setText(String text) {
        button.setText(text);
    }

    @Override
    public void setOnClickListener(ActionListener listener) {
        button.addActionListener(listener);
    }

    @Override
    public void setEnabled(boolean enabled) {
        button.setEnabled(enabled);
        if (!enabled) {
            button.setBackground(new Color(229, 229, 234)); // Light gray when disabled
        } else {
            button.setBackground(new Color(0, 122, 255)); // Mac blue when enabled
        }
    }

    @Override
    public String getStyle() {
        return "Mac";
    }
}
