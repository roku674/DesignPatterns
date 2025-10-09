namespace Builder;

/// <summary>
/// Director class that constructs common types of HTTP requests using the builder.
/// Encapsulates knowledge of how to build specific request configurations.
/// </summary>
public class HttpRequestDirector
{
    /// <summary>
    /// Constructs a standard GET request with JSON acceptance.
    /// </summary>
    public HttpRequestMessage ConstructJsonGetRequest(HttpRequestBuilder builder, string uri, string? bearerToken = null)
    {
        builder.Reset();
        builder.WithMethod(HttpMethod.Get)
               .WithUri(uri)
               .AsJsonApi();

        if (!string.IsNullOrEmpty(bearerToken))
        {
            builder.WithBearerToken(bearerToken);
        }

        return builder.Build();
    }

    /// <summary>
    /// Constructs a POST request with JSON payload.
    /// </summary>
    public HttpRequestMessage ConstructJsonPostRequest<T>(HttpRequestBuilder builder, string uri, T data, string? bearerToken = null)
    {
        builder.Reset();
        builder.WithMethod(HttpMethod.Post)
               .WithUri(uri)
               .WithJsonContent(data)
               .AsJsonApi();

        if (!string.IsNullOrEmpty(bearerToken))
        {
            builder.WithBearerToken(bearerToken);
        }

        return builder.Build();
    }

    /// <summary>
    /// Constructs a PUT request with JSON payload.
    /// </summary>
    public HttpRequestMessage ConstructJsonPutRequest<T>(HttpRequestBuilder builder, string uri, T data, string? bearerToken = null)
    {
        builder.Reset();
        builder.WithMethod(HttpMethod.Put)
               .WithUri(uri)
               .WithJsonContent(data)
               .AsJsonApi();

        if (!string.IsNullOrEmpty(bearerToken))
        {
            builder.WithBearerToken(bearerToken);
        }

        return builder.Build();
    }

    /// <summary>
    /// Constructs a DELETE request.
    /// </summary>
    public HttpRequestMessage ConstructDeleteRequest(HttpRequestBuilder builder, string uri, string? bearerToken = null)
    {
        builder.Reset();
        builder.WithMethod(HttpMethod.Delete)
               .WithUri(uri)
               .AsJsonApi();

        if (!string.IsNullOrEmpty(bearerToken))
        {
            builder.WithBearerToken(bearerToken);
        }

        return builder.Build();
    }

    /// <summary>
    /// Constructs a form submission request.
    /// </summary>
    public HttpRequestMessage ConstructFormPostRequest(HttpRequestBuilder builder, string uri, Dictionary<string, string> formData)
    {
        builder.Reset();
        builder.WithMethod(HttpMethod.Post)
               .WithUri(uri)
               .WithFormContent(formData);

        return builder.Build();
    }

    /// <summary>
    /// Constructs a file upload request with multipart form data.
    /// </summary>
    public HttpRequestMessage ConstructFileUploadRequest(HttpRequestBuilder builder, string uri, string filePath, string? bearerToken = null)
    {
        builder.Reset();
        builder.WithMethod(HttpMethod.Post)
               .WithUri(uri)
               .WithMultipartContent(content =>
               {
                   byte[] fileBytes = File.ReadAllBytes(filePath);
                   string fileName = Path.GetFileName(filePath);
                   ByteArrayContent fileContent = new ByteArrayContent(fileBytes);
                   content.Add(fileContent, "file", fileName);
               });

        if (!string.IsNullOrEmpty(bearerToken))
        {
            builder.WithBearerToken(bearerToken);
        }

        return builder.Build();
    }

    /// <summary>
    /// Constructs a paginated API request with query parameters.
    /// </summary>
    public HttpRequestMessage ConstructPaginatedRequest(HttpRequestBuilder builder, string baseUri, int page, int pageSize, string? bearerToken = null)
    {
        builder.Reset();
        builder.WithMethod(HttpMethod.Get)
               .WithUri(baseUri)
               .AddQueryParameter("page", page.ToString())
               .AddQueryParameter("pageSize", pageSize.ToString())
               .AsJsonApi();

        if (!string.IsNullOrEmpty(bearerToken))
        {
            builder.WithBearerToken(bearerToken);
        }

        return builder.Build();
    }

    /// <summary>
    /// Constructs a search request with multiple filters.
    /// </summary>
    public HttpRequestMessage ConstructSearchRequest(HttpRequestBuilder builder, string baseUri, Dictionary<string, string> filters, string? bearerToken = null)
    {
        builder.Reset();
        builder.WithMethod(HttpMethod.Get)
               .WithUri(baseUri)
               .AsJsonApi();

        foreach (KeyValuePair<string, string> filter in filters)
        {
            builder.AddQueryParameter(filter.Key, filter.Value);
        }

        if (!string.IsNullOrEmpty(bearerToken))
        {
            builder.WithBearerToken(bearerToken);
        }

        return builder.Build();
    }
}
