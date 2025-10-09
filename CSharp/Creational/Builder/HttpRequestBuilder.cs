using System.Text;
using System.Text.Json;

namespace Builder;

/// <summary>
/// Production-ready Builder for constructing complex HttpRequestMessage objects.
/// Provides fluent API for building HTTP requests with headers, authentication, content, etc.
/// </summary>
public class HttpRequestBuilder
{
    private HttpMethod _method;
    private Uri? _uri;
    private HttpContent? _content;
    private readonly Dictionary<string, string> _headers;
    private readonly Dictionary<string, string> _queryParameters;
    private string? _bearerToken;
    private TimeSpan _timeout;
    private Version _httpVersion;

    public HttpRequestBuilder()
    {
        _method = HttpMethod.Get;
        _headers = new Dictionary<string, string>();
        _queryParameters = new Dictionary<string, string>();
        _timeout = TimeSpan.FromSeconds(30);
        _httpVersion = new Version(2, 0);
    }

    /// <summary>
    /// Sets the HTTP method for the request.
    /// </summary>
    public HttpRequestBuilder WithMethod(HttpMethod method)
    {
        _method = method ?? throw new ArgumentNullException(nameof(method));
        return this;
    }

    /// <summary>
    /// Sets the URI for the request.
    /// </summary>
    public HttpRequestBuilder WithUri(string uri)
    {
        if (string.IsNullOrWhiteSpace(uri))
        {
            throw new ArgumentException("URI cannot be null or empty", nameof(uri));
        }
        _uri = new Uri(uri);
        return this;
    }

    /// <summary>
    /// Sets the URI for the request.
    /// </summary>
    public HttpRequestBuilder WithUri(Uri uri)
    {
        _uri = uri ?? throw new ArgumentNullException(nameof(uri));
        return this;
    }

    /// <summary>
    /// Adds a header to the request.
    /// </summary>
    public HttpRequestBuilder AddHeader(string name, string value)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Header name cannot be null or empty", nameof(name));
        }
        _headers[name] = value;
        return this;
    }

    /// <summary>
    /// Adds multiple headers to the request.
    /// </summary>
    public HttpRequestBuilder AddHeaders(Dictionary<string, string> headers)
    {
        if (headers == null)
        {
            throw new ArgumentNullException(nameof(headers));
        }

        foreach (KeyValuePair<string, string> header in headers)
        {
            _headers[header.Key] = header.Value;
        }
        return this;
    }

    /// <summary>
    /// Adds a query parameter to the request URI.
    /// </summary>
    public HttpRequestBuilder AddQueryParameter(string name, string value)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Parameter name cannot be null or empty", nameof(name));
        }
        _queryParameters[name] = value;
        return this;
    }

    /// <summary>
    /// Sets Bearer token authentication.
    /// </summary>
    public HttpRequestBuilder WithBearerToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new ArgumentException("Token cannot be null or empty", nameof(token));
        }
        _bearerToken = token;
        return this;
    }

    /// <summary>
    /// Sets Basic authentication.
    /// </summary>
    public HttpRequestBuilder WithBasicAuth(string username, string password)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            throw new ArgumentException("Username cannot be null or empty", nameof(username));
        }

        string credentials = Convert.ToBase64String(
            Encoding.UTF8.GetBytes($"{username}:{password}"));
        _headers["Authorization"] = $"Basic {credentials}";
        return this;
    }

    /// <summary>
    /// Sets JSON content for the request.
    /// </summary>
    public HttpRequestBuilder WithJsonContent<T>(T data)
    {
        if (data == null)
        {
            throw new ArgumentNullException(nameof(data));
        }

        string json = JsonSerializer.Serialize(data);
        _content = new StringContent(json, Encoding.UTF8, "application/json");
        return this;
    }

    /// <summary>
    /// Sets form URL encoded content.
    /// </summary>
    public HttpRequestBuilder WithFormContent(Dictionary<string, string> formData)
    {
        if (formData == null)
        {
            throw new ArgumentNullException(nameof(formData));
        }

        _content = new FormUrlEncodedContent(formData);
        return this;
    }

    /// <summary>
    /// Sets multipart form data content.
    /// </summary>
    public HttpRequestBuilder WithMultipartContent(Action<MultipartFormDataContent> configureContent)
    {
        if (configureContent == null)
        {
            throw new ArgumentNullException(nameof(configureContent));
        }

        MultipartFormDataContent multipartContent = new MultipartFormDataContent();
        configureContent(multipartContent);
        _content = multipartContent;
        return this;
    }

    /// <summary>
    /// Sets string content for the request.
    /// </summary>
    public HttpRequestBuilder WithStringContent(string content, string mediaType = "text/plain")
    {
        if (content == null)
        {
            throw new ArgumentNullException(nameof(content));
        }

        _content = new StringContent(content, Encoding.UTF8, mediaType);
        return this;
    }

    /// <summary>
    /// Sets byte array content for the request.
    /// </summary>
    public HttpRequestBuilder WithByteContent(byte[] content, string mediaType = "application/octet-stream")
    {
        if (content == null)
        {
            throw new ArgumentNullException(nameof(content));
        }

        _content = new ByteArrayContent(content);
        _content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(mediaType);
        return this;
    }

    /// <summary>
    /// Sets the timeout for the request.
    /// </summary>
    public HttpRequestBuilder WithTimeout(TimeSpan timeout)
    {
        if (timeout <= TimeSpan.Zero)
        {
            throw new ArgumentException("Timeout must be greater than zero", nameof(timeout));
        }
        _timeout = timeout;
        return this;
    }

    /// <summary>
    /// Sets the HTTP version.
    /// </summary>
    public HttpRequestBuilder WithHttpVersion(Version version)
    {
        _httpVersion = version ?? throw new ArgumentNullException(nameof(version));
        return this;
    }

    /// <summary>
    /// Sets common headers for JSON API requests.
    /// </summary>
    public HttpRequestBuilder AsJsonApi()
    {
        _headers["Accept"] = "application/json";
        _headers["Content-Type"] = "application/json";
        return this;
    }

    /// <summary>
    /// Builds the final HttpRequestMessage with all configured options.
    /// </summary>
    public HttpRequestMessage Build()
    {
        if (_uri == null)
        {
            throw new InvalidOperationException("URI must be set before building the request");
        }

        // Build URI with query parameters
        Uri finalUri = _uri;
        if (_queryParameters.Count > 0)
        {
            UriBuilder uriBuilder = new UriBuilder(_uri);
            StringBuilder queryString = new StringBuilder(uriBuilder.Query);

            foreach (KeyValuePair<string, string> param in _queryParameters)
            {
                if (queryString.Length > 0)
                {
                    queryString.Append('&');
                }
                queryString.Append(Uri.EscapeDataString(param.Key));
                queryString.Append('=');
                queryString.Append(Uri.EscapeDataString(param.Value));
            }

            uriBuilder.Query = queryString.ToString();
            finalUri = uriBuilder.Uri;
        }

        // Create the request message
        HttpRequestMessage request = new HttpRequestMessage(_method, finalUri)
        {
            Content = _content,
            Version = _httpVersion
        };

        // Add headers
        foreach (KeyValuePair<string, string> header in _headers)
        {
            request.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        // Add bearer token if specified
        if (!string.IsNullOrEmpty(_bearerToken))
        {
            request.Headers.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _bearerToken);
        }

        // Add timeout as a property (client will need to read this)
        request.Options.Set(new HttpRequestOptionsKey<TimeSpan>("Timeout"), _timeout);

        return request;
    }

    /// <summary>
    /// Resets the builder to its initial state.
    /// </summary>
    public void Reset()
    {
        _method = HttpMethod.Get;
        _uri = null;
        _content = null;
        _headers.Clear();
        _queryParameters.Clear();
        _bearerToken = null;
        _timeout = TimeSpan.FromSeconds(30);
        _httpVersion = new Version(2, 0);
    }
}
