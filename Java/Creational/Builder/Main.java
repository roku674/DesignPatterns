import java.io.IOException;

/**
 * Main class to demonstrate the Builder pattern with real HTTP requests
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Builder Pattern - Real HTTP Request Demo ===\n");

        try {
            // Example 1: Simple GET request
            System.out.println("--- Example 1: Simple GET Request ---");
            HttpRequest getRequest = new HttpRequest.HttpRequestBuilder("https://jsonplaceholder.typicode.com/posts/1")
                    .get()
                    .build();
            System.out.println("Request: " + getRequest);
            HttpRequest.HttpResponse response1 = getRequest.execute();
            System.out.println("Response: " + response1);
            System.out.println("Body preview: " + response1.getBody().substring(0, Math.min(200, response1.getBody().length())));
            System.out.println();

            // Example 2: GET with headers
            System.out.println("--- Example 2: GET with Custom Headers ---");
            HttpRequest getWithHeaders = new HttpRequest.HttpRequestBuilder("https://jsonplaceholder.typicode.com/users/1")
                    .get()
                    .header("User-Agent", "Java-Builder-Pattern/1.0")
                    .header("Accept", "application/json")
                    .connectTimeout(10000)
                    .readTimeout(10000)
                    .build();
            System.out.println("Request: " + getWithHeaders);
            HttpRequest.HttpResponse response2 = getWithHeaders.execute();
            System.out.println("Status: " + response2.getStatusCode() + " - Success: " + response2.isSuccess());
            System.out.println("Body preview: " + response2.getBody().substring(0, Math.min(200, response2.getBody().length())));
            System.out.println();

            // Example 3: POST request with JSON body
            System.out.println("--- Example 3: POST with JSON Body ---");
            String jsonPayload = "{"
                + "\"title\": \"Test Post\","
                + "\"body\": \"This is a test post from Builder Pattern\","
                + "\"userId\": 1"
                + "}";

            HttpRequest postRequest = new HttpRequest.HttpRequestBuilder("https://jsonplaceholder.typicode.com/posts")
                    .post()
                    .json()
                    .body(jsonPayload)
                    .build();
            System.out.println("Request: " + postRequest);
            HttpRequest.HttpResponse response3 = postRequest.execute();
            System.out.println("Status: " + response3.getStatusCode() + " - Success: " + response3.isSuccess());
            System.out.println("Response body: " + response3.getBody());
            System.out.println();

            // Example 4: PUT request
            System.out.println("--- Example 4: PUT Request ---");
            String updateJson = "{"
                + "\"id\": 1,"
                + "\"title\": \"Updated Title\","
                + "\"body\": \"Updated content\","
                + "\"userId\": 1"
                + "}";

            HttpRequest putRequest = new HttpRequest.HttpRequestBuilder("https://jsonplaceholder.typicode.com/posts/1")
                    .put()
                    .json()
                    .body(updateJson)
                    .build();
            HttpRequest.HttpResponse response4 = putRequest.execute();
            System.out.println("Status: " + response4.getStatusCode() + " - Success: " + response4.isSuccess());
            System.out.println("Response: " + response4.getBody().substring(0, Math.min(150, response4.getBody().length())));
            System.out.println();

            // Example 5: DELETE request
            System.out.println("--- Example 5: DELETE Request ---");
            HttpRequest deleteRequest = new HttpRequest.HttpRequestBuilder("https://jsonplaceholder.typicode.com/posts/1")
                    .delete()
                    .build();
            HttpRequest.HttpResponse response5 = deleteRequest.execute();
            System.out.println("Status: " + response5.getStatusCode() + " - Success: " + response5.isSuccess());
            System.out.println("Response: " + response5);
            System.out.println();

            // Example 6: Request with Bearer token
            System.out.println("--- Example 6: Request with Bearer Token ---");
            HttpRequest authRequest = new HttpRequest.HttpRequestBuilder("https://jsonplaceholder.typicode.com/posts")
                    .get()
                    .bearerToken("sample-token-12345")
                    .json()
                    .connectTimeout(15000)
                    .followRedirects(true)
                    .build();
            System.out.println("Request headers: " + authRequest.getHeaders());
            System.out.println();

            // Example 7: Fluent API demonstration
            System.out.println("--- Example 7: Complex Fluent Request ---");
            HttpRequest complexRequest = new HttpRequest.HttpRequestBuilder("https://jsonplaceholder.typicode.com/comments")
                    .method("GET")
                    .header("Accept", "application/json")
                    .header("Cache-Control", "no-cache")
                    .contentType("application/json")
                    .connectTimeout(8000)
                    .readTimeout(8000)
                    .followRedirects(false)
                    .build();

            HttpRequest.HttpResponse response7 = complexRequest.execute();
            System.out.println("Status: " + response7.getStatusCode());
            System.out.println("Response length: " + response7.getBody().length() + " characters");
            System.out.println("First 150 chars: " + response7.getBody().substring(0, Math.min(150, response7.getBody().length())));
            System.out.println();

        } catch (IOException e) {
            System.err.println("HTTP request failed: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("=== Builder Pattern Demo Complete ===");
    }
}
