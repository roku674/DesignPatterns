import javax.swing.JButton;
import javax.swing.BorderFactory;
import java.awt.Color;
import java.awt.Font;
import java.awt.Dimension;
import java.awt.event.ActionListener;

/**
 * Concrete Product A1 - Windows-style button with real Swing implementation
 */
public class WindowsButton implements Button {

    private final JButton button;

    public WindowsButton() {
        button = new JButton();
        applyWindowsStyle();
    }

    /**
     * Applies Windows-specific styling to the button
     */
    private void applyWindowsStyle() {
        // Windows typically uses a flat, modern design with subtle borders
        button.setBackground(new Color(0, 120, 215)); // Windows blue
        button.setForeground(Color.WHITE);
        button.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        button.setFocusPainted(false);
        button.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(0, 84, 153), 1),
            BorderFactory.createEmptyBorder(8, 16, 8, 16)
        ));
        button.setPreferredSize(new Dimension(120, 35));
        button.setOpaque(true);

        // Add hover effect
        button.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                button.setBackground(new Color(0, 102, 184)); // Darker blue on hover
            }

            public void mouseExited(java.awt.event.MouseEvent evt) {
                button.setBackground(new Color(0, 120, 215)); // Original blue
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
            button.setBackground(new Color(204, 204, 204)); // Gray when disabled
        } else {
            button.setBackground(new Color(0, 120, 215)); // Windows blue when enabled
        }
    }

    @Override
    public String getStyle() {
        return "Windows";
    }
}
