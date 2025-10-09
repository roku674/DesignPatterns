/**
 * Subject interface - defines common interface for RealSubject and Proxy
 */
public interface Image {
    /**
     * Fetch data from remote API
     */
    String display() throws Exception;

    /**
     * Get metadata about the resource
     */
    String getMetadata();
}
