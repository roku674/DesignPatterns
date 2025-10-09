import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Component interface - defines interface for data streams
 */
public interface Coffee {
    /**
     * Writes data to the output stream
     */
    void write(byte[] data) throws IOException;

    /**
     * Reads data from the input stream
     */
    byte[] read() throws IOException;

    /**
     * Closes the stream
     */
    void close() throws IOException;

    /**
     * Gets description of the stream configuration
     */
    String getDescription();
}
