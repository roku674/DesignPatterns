import java.io.IOException;

/**
 * Component interface - declares interface for file system objects
 */
public interface Component {
    /**
     * Gets the name of the component
     */
    String getName();

    /**
     * Gets the size in bytes
     */
    long getSize() throws IOException;

    /**
     * Displays the component hierarchy
     */
    void display(String indent);

    /**
     * Checks if component is a directory
     */
    boolean isDirectory();

    /**
     * Deletes the component
     */
    boolean delete() throws IOException;
}
