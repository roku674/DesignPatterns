import java.util.HashMap;
import java.util.Map;

/**
 * Adapter class - converts XML/CSV responses to standard JSON-like Map format
 *
 * This adapter allows legacy XML and CSV APIs to work with modern code
 * that expects Map-based JSON responses.
 */
public class MediaAdapter implements MediaPlayer {

    private AdvancedMediaPlayer advancedMediaPlayer;
    private String format;

    /**
     * Constructor - creates appropriate player based on format type
     *
     * @param format the data format (xml or csv)
     */
    public MediaAdapter(String format) {
        this.format = format.toLowerCase();
        if (this.format.equals("xml")) {
            advancedMediaPlayer = new VlcPlayer();
        } else if (this.format.equals("csv")) {
            advancedMediaPlayer = new Mp4Player();
        } else {
            throw new IllegalArgumentException("Unsupported format: " + format);
        }
    }

    @Override
    public Map<String, Object> fetchData(String endpoint) throws Exception {
        Map<String, Object> result = new HashMap<>();

        if (format.equals("xml")) {
            String xmlData = advancedMediaPlayer.fetchXmlData(endpoint);
            result = parseXmlToMap(xmlData);
        } else if (format.equals("csv")) {
            String csvData = advancedMediaPlayer.fetchCsvData(endpoint);
            result = parseCsvToMap(csvData);
        }

        return result;
    }

    /**
     * Parses XML string into a Map structure
     */
    private Map<String, Object> parseXmlToMap(String xml) {
        Map<String, Object> map = new HashMap<>();
        // Simple XML parsing - extract content between tags
        String content = xml.replaceAll("<[^>]+>", "").trim();
        map.put("format", "xml");
        map.put("data", content);
        map.put("raw", xml);
        return map;
    }

    /**
     * Parses CSV string into a Map structure
     */
    private Map<String, Object> parseCsvToMap(String csv) {
        Map<String, Object> map = new HashMap<>();
        String[] lines = csv.split("\n");

        if (lines.length > 0) {
            String[] headers = lines[0].split(",");
            map.put("format", "csv");
            map.put("headers", headers);
            map.put("rowCount", lines.length - 1);
            map.put("raw", csv);
        }

        return map;
    }
}
