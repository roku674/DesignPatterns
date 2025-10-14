package Cloud.Retry;

/**
 * Represents an HTTP error with status code.
 */
public class HttpException extends Exception {
    private final int statusCode;

    public HttpException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
