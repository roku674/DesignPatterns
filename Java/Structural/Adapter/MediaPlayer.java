import java.util.Map;

/**
 * Target interface - standard API response interface
 */
public interface MediaPlayer {
    /**
     * Fetches data from an API endpoint
     *
     * @param endpoint the API endpoint
     * @return response data as a Map
     * @throws Exception if the request fails
     */
    Map<String, Object> fetchData(String endpoint) throws Exception;
}
