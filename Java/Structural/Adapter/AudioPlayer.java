import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

/**
 * Concrete implementation of MediaPlayer that can fetch JSON natively
 * and uses adapter for XML/CSV formats
 */
public class AudioPlayer implements MediaPlayer {

    private MediaAdapter mediaAdapter;

    @Override
    public Map<String, Object> fetchData(String endpoint) throws Exception {
        // Determine format from endpoint or default to JSON
        String format = detectFormat(endpoint);

        // Built-in support for JSON
        if (format.equals("json")) {
            return fetchJsonData(endpoint);
        }
        // Use adapter for other formats
        else if (format.equals("xml") || format.equals("csv")) {
            mediaAdapter = new MediaAdapter(format);
            return mediaAdapter.fetchData(endpoint);
        } else {
            throw new IllegalArgumentException(
                "Invalid format: " + format + ". Supported formats: JSON, XML, CSV"
            );
        }
    }

    /**
     * Detects the format from the endpoint URL
     */
    private String detectFormat(String endpoint) {
        String lower = endpoint.toLowerCase();
        if (lower.contains("xml") || lower.endsWith(".xml")) {
            return "xml";
        } else if (lower.contains("csv") || lower.endsWith(".csv")) {
            return "csv";
        } else {
            return "json";
        }
    }

    /**
     * Fetches JSON data directly (native support)
     */
    private Map<String, Object> fetchJsonData(String endpoint) throws Exception {
        URL url = new URL(endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Accept", "application/json");
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);

        int responseCode = connection.getResponseCode();
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw new Exception("HTTP error code: " + responseCode);
        }

        BufferedReader reader = new BufferedReader(
            new InputStreamReader(connection.getInputStream())
        );
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }
        reader.close();
        connection.disconnect();

        // Simple JSON parsing to Map
        Map<String, Object> result = new HashMap<>();
        result.put("format", "json");
        result.put("data", response.toString());
        result.put("raw", response.toString());

        return result;
    }
}
