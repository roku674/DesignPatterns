import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Product class - represents a complex HTTP request being built
 */
public class HttpRequest {

    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;
    private final int connectTimeout;
    private final int readTimeout;
    private final boolean followRedirects;

    /**
     * Private constructor - only accessible through Builder
     */
    private HttpRequest(HttpRequestBuilder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = builder.headers;
        this.body = builder.body;
        this.connectTimeout = builder.connectTimeout;
        this.readTimeout = builder.readTimeout;
        this.followRedirects = builder.followRedirects;
    }

    /**
     * Executes the HTTP request and returns the response
     *
     * @return HttpResponse object containing status code and body
     * @throws IOException if the request fails
     */
    public HttpResponse execute() throws IOException {
        URL urlObject = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) urlObject.openConnection();

        try {
            connection.setRequestMethod(method);
            connection.setConnectTimeout(connectTimeout);
            connection.setReadTimeout(readTimeout);
            connection.setInstanceFollowRedirects(followRedirects);

            // Set headers
            for (Map.Entry<String, String> header : headers.entrySet()) {
                connection.setRequestProperty(header.getKey(), header.getValue());
            }

            // Send request body if present
            if (body != null && !body.isEmpty() &&
                (method.equals("POST") || method.equals("PUT") || method.equals("PATCH"))) {
                connection.setDoOutput(true);
                try (OutputStream os = connection.getOutputStream()) {
                    byte[] input = body.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }
            }

            // Get response
            int statusCode = connection.getResponseCode();
            String responseBody;

            try {
                BufferedReader br;
                if (statusCode >= 200 && statusCode < 300) {
                    br = new BufferedReader(new InputStreamReader(
                        connection.getInputStream(), StandardCharsets.UTF_8));
                } else {
                    br = new BufferedReader(new InputStreamReader(
                        connection.getErrorStream(), StandardCharsets.UTF_8));
                }

                responseBody = br.lines().collect(Collectors.joining("\n"));
                br.close();
            } catch (Exception e) {
                responseBody = "";
            }

            return new HttpResponse(statusCode, responseBody, connection.getHeaderFields());

        } finally {
            connection.disconnect();
        }
    }

    /**
     * Gets the request URL
     */
    public String getUrl() {
        return url;
    }

    /**
     * Gets the request method
     */
    public String getMethod() {
        return method;
    }

    /**
     * Gets the request headers
     */
    public Map<String, String> getHeaders() {
        return new HashMap<>(headers);
    }

    /**
     * Gets the request body
     */
    public String getBody() {
        return body;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("HttpRequest {\n");
        sb.append("  URL: ").append(url).append("\n");
        sb.append("  Method: ").append(method).append("\n");
        sb.append("  Headers: ").append(headers).append("\n");
        sb.append("  Body: ").append(body != null ? body.substring(0, Math.min(100, body.length())) : "null").append("\n");
        sb.append("  Connect Timeout: ").append(connectTimeout).append("ms\n");
        sb.append("  Read Timeout: ").append(readTimeout).append("ms\n");
        sb.append("  Follow Redirects: ").append(followRedirects).append("\n");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Static Builder class for constructing HttpRequest objects
     */
    public static class HttpRequestBuilder {
        // Required parameter
        private final String url;

        // Optional parameters with default values
        private String method = "GET";
        private Map<String, String> headers = new HashMap<>();
        private String body = null;
        private int connectTimeout = 5000;
        private int readTimeout = 5000;
        private boolean followRedirects = true;

        /**
         * Constructor with required URL parameter
         *
         * @param url the target URL
         */
        public HttpRequestBuilder(String url) {
            if (url == null || url.trim().isEmpty()) {
                throw new IllegalArgumentException("URL cannot be null or empty");
            }
            this.url = url;
        }

        /**
         * Sets the HTTP method (GET, POST, PUT, DELETE, etc.)
         */
        public HttpRequestBuilder method(String method) {
            this.method = method.toUpperCase();
            return this;
        }

        /**
         * Convenience method for GET requests
         */
        public HttpRequestBuilder get() {
            this.method = "GET";
            return this;
        }

        /**
         * Convenience method for POST requests
         */
        public HttpRequestBuilder post() {
            this.method = "POST";
            return this;
        }

        /**
         * Convenience method for PUT requests
         */
        public HttpRequestBuilder put() {
            this.method = "PUT";
            return this;
        }

        /**
         * Convenience method for DELETE requests
         */
        public HttpRequestBuilder delete() {
            this.method = "DELETE";
            return this;
        }

        /**
         * Adds a single header
         */
        public HttpRequestBuilder header(String key, String value) {
            this.headers.put(key, value);
            return this;
        }

        /**
         * Adds multiple headers
         */
        public HttpRequestBuilder headers(Map<String, String> headers) {
            this.headers.putAll(headers);
            return this;
        }

        /**
         * Sets the Content-Type header
         */
        public HttpRequestBuilder contentType(String contentType) {
            this.headers.put("Content-Type", contentType);
            return this;
        }

        /**
         * Sets JSON content type
         */
        public HttpRequestBuilder json() {
            return contentType("application/json");
        }

        /**
         * Sets the Authorization header
         */
        public HttpRequestBuilder authorization(String token) {
            this.headers.put("Authorization", token);
            return this;
        }

        /**
         * Sets Bearer token authorization
         */
        public HttpRequestBuilder bearerToken(String token) {
            return authorization("Bearer " + token);
        }

        /**
         * Sets the request body
         */
        public HttpRequestBuilder body(String body) {
            this.body = body;
            return this;
        }

        /**
         * Sets JSON body
         */
        public HttpRequestBuilder jsonBody(String json) {
            this.body = json;
            return json().post();
        }

        /**
         * Sets the connection timeout in milliseconds
         */
        public HttpRequestBuilder connectTimeout(int timeout) {
            this.connectTimeout = timeout;
            return this;
        }

        /**
         * Sets the read timeout in milliseconds
         */
        public HttpRequestBuilder readTimeout(int timeout) {
            this.readTimeout = timeout;
            return this;
        }

        /**
         * Sets whether to follow redirects
         */
        public HttpRequestBuilder followRedirects(boolean follow) {
            this.followRedirects = follow;
            return this;
        }

        /**
         * Builds and returns the HttpRequest object
         *
         * @return a new HttpRequest instance
         */
        public HttpRequest build() {
            return new HttpRequest(this);
        }
    }

    /**
     * Inner class to represent HTTP response
     */
    public static class HttpResponse {
        private final int statusCode;
        private final String body;
        private final Map<String, java.util.List<String>> headers;

        public HttpResponse(int statusCode, String body, Map<String, java.util.List<String>> headers) {
            this.statusCode = statusCode;
            this.body = body;
            this.headers = headers;
        }

        public int getStatusCode() {
            return statusCode;
        }

        public String getBody() {
            return body;
        }

        public Map<String, java.util.List<String>> getHeaders() {
            return headers;
        }

        public boolean isSuccess() {
            return statusCode >= 200 && statusCode < 300;
        }

        @Override
        public String toString() {
            return String.format("HttpResponse{statusCode=%d, bodyLength=%d}",
                statusCode, body != null ? body.length() : 0);
        }
    }
}
