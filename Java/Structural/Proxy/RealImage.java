import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * RealSubject - performs actual expensive HTTP requests
 */
public class RealImage implements Image {
    private String filename; // URL in this case
    private String data;
    private long loadTime;

    public RealImage(String filename) {
        this.filename = filename;
    }

    /**
     * Expensive operation - loads data from remote API
     */
    private void loadFromDisk() throws Exception {
        System.out.println("RealImage: Loading data from remote API: " + filename);
        long startTime = System.currentTimeMillis();

        URL url = new URL(filename);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
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

        data = response.toString();
        loadTime = System.currentTimeMillis() - startTime;

        System.out.println("RealImage: Data loaded in " + loadTime + "ms");
    }

    @Override
    public String display() throws Exception {
        if (data == null) {
            loadFromDisk();
        }
        System.out.println("RealImage: Displaying data from " + filename);
        return data;
    }

    @Override
    public String getMetadata() {
        return "RealImage[url=" + filename + ", loaded=" + (data != null) +
                ", size=" + (data != null ? data.length() : 0) + " bytes]";
    }

    public long getLoadTime() {
        return loadTime;
    }
}
