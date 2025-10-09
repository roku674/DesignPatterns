/**
 * Adaptee interface - legacy API with different response format (XML/CSV)
 */
public interface AdvancedMediaPlayer {
    /**
     * Fetches XML data from endpoint
     *
     * @param endpoint the API endpoint
     * @return XML response as String
     * @throws Exception if the request fails
     */
    String fetchXmlData(String endpoint) throws Exception;

    /**
     * Fetches CSV data from endpoint
     *
     * @param endpoint the API endpoint
     * @return CSV response as String
     * @throws Exception if the request fails
     */
    String fetchCsvData(String endpoint) throws Exception;
}
