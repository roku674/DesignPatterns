import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.BoxLayout;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;

/**
 * Client class - works with factories and products through abstract interfaces
 * Creates a real Swing window with styled components
 */
public class Application {

    private final Button button;
    private final Checkbox checkbox;
    private final String theme;
    private JFrame frame;

    /**
     * Constructs the application with a specific GUI factory
     *
     * @param factory the GUI factory to use for creating components
     */
    public Application(GUIFactory factory) {
        button = factory.createButton();
        checkbox = factory.createCheckbox();
        this.theme = button.getStyle();
        setupComponents();
    }

    /**
     * Sets up the GUI components with event listeners
     */
    private void setupComponents() {
        // Set button text and action
        button.setText("Click Me");
        button.setOnClickListener(e -> {
            System.out.println("[" + theme + "] Button clicked!");
            checkbox.setSelected(!checkbox.isSelected());
        });

        // Set checkbox text and action
        checkbox.setText("Enable feature");
        checkbox.setOnChangeListener(e -> {
            System.out.println("[" + theme + "] Checkbox " +
                (checkbox.isSelected() ? "CHECKED" : "UNCHECKED"));
            button.setEnabled(checkbox.isSelected());
        });

        // Initially enable the button
        button.setEnabled(true);
    }

    /**
     * Creates and displays the application window
     */
    public void show() {
        frame = new JFrame(theme + " Style Application - Abstract Factory Pattern");
        frame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        frame.setPreferredSize(new Dimension(400, 200));

        // Create main panel
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BoxLayout(mainPanel, BoxLayout.Y_AXIS));
        mainPanel.setBackground(Color.WHITE);
        mainPanel.setBorder(javax.swing.BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Add components
        JPanel buttonPanel = new JPanel();
        buttonPanel.setBackground(Color.WHITE);
        buttonPanel.add(button.getComponent());
        mainPanel.add(buttonPanel);

        mainPanel.add(javax.swing.Box.createVerticalStrut(20));

        JPanel checkboxPanel = new JPanel();
        checkboxPanel.setBackground(Color.WHITE);
        checkboxPanel.add(checkbox.getComponent());
        mainPanel.add(checkboxPanel);

        frame.add(mainPanel, BorderLayout.CENTER);
        frame.pack();
        frame.setLocationRelativeTo(null); // Center on screen
        frame.setVisible(true);

        System.out.println("[" + theme + "] Application window displayed");
    }

    /**
     * Closes the application window
     */
    public void close() {
        if (frame != null) {
            frame.dispose();
        }
    }

    /**
     * Gets the theme name
     */
    public String getTheme() {
        return theme;
    }
}
