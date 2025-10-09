namespace Builder;

/// <summary>
/// Demonstrates the Builder pattern with real HTTP request construction.
/// Shows both computer building (educational) and HTTP request building (production).
/// </summary>
public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== Builder Pattern Demo ===");
        Console.WriteLine("Production-Ready HTTP Request Builder\n");

        await DemoHttpRequestBuilder();

        Console.WriteLine("\n" + new string('=', 70));
        Console.WriteLine("\n=== Computer Builder Demo (Educational) ===\n");

        DemoComputerBuilder();
    }

    /// <summary>
    /// Demonstrates real HTTP request building with the Builder pattern.
    /// </summary>
    private static async Task DemoHttpRequestBuilder()
    {
        HttpRequestBuilder builder = new HttpRequestBuilder();
        HttpRequestDirector director = new HttpRequestDirector();

        // Example 1: Simple GET request
        Console.WriteLine("--- Example 1: Simple GET Request ---");
        HttpRequestMessage getRequest = builder
            .WithMethod(HttpMethod.Get)
            .WithUri("https://api.example.com/users")
            .AsJsonApi()
            .Build();

        DisplayRequest(getRequest);

        // Example 2: POST request with JSON data
        Console.WriteLine("\n--- Example 2: POST Request with JSON ---");
        object userData = new
        {
            name = "John Doe",
            email = "john@example.com",
            age = 30
        };

        HttpRequestMessage postRequest = builder
            .WithMethod(HttpMethod.Post)
            .WithUri("https://api.example.com/users")
            .WithJsonContent(userData)
            .WithBearerToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            .Build();

        DisplayRequest(postRequest);

        // Example 3: GET request with query parameters
        Console.WriteLine("\n--- Example 3: GET with Query Parameters ---");
        HttpRequestMessage queryRequest = builder
            .WithMethod(HttpMethod.Get)
            .WithUri("https://api.example.com/products")
            .AddQueryParameter("category", "electronics")
            .AddQueryParameter("minPrice", "100")
            .AddQueryParameter("maxPrice", "1000")
            .AsJsonApi()
            .Build();

        DisplayRequest(queryRequest);

        // Example 4: Using Director for common patterns
        Console.WriteLine("\n--- Example 4: Using Director for Paginated Request ---");
        HttpRequestMessage paginatedRequest = director.ConstructPaginatedRequest(
            builder,
            "https://api.example.com/items",
            page: 2,
            pageSize: 50,
            bearerToken: "your-token-here"
        );

        DisplayRequest(paginatedRequest);

        // Example 5: Form submission
        Console.WriteLine("\n--- Example 5: Form Submission ---");
        Dictionary<string, string> formData = new Dictionary<string, string>
        {
            { "username", "johndoe" },
            { "password", "securepassword123" },
            { "remember", "true" }
        };

        HttpRequestMessage formRequest = director.ConstructFormPostRequest(
            builder,
            "https://api.example.com/login",
            formData
        );

        DisplayRequest(formRequest);

        // Example 6: Complex request with multiple headers
        Console.WriteLine("\n--- Example 6: Complex Request with Custom Headers ---");
        HttpRequestMessage complexRequest = builder
            .WithMethod(HttpMethod.Put)
            .WithUri("https://api.example.com/users/123")
            .AddHeader("X-Request-ID", Guid.NewGuid().ToString())
            .AddHeader("X-API-Version", "2.0")
            .AddHeader("X-Client-Type", "Desktop")
            .WithJsonContent(new { status = "active" })
            .WithTimeout(TimeSpan.FromSeconds(60))
            .WithBearerToken("token-12345")
            .Build();

        DisplayRequest(complexRequest);

        // Example 7: Actual HTTP call demonstration
        Console.WriteLine("\n--- Example 7: Real HTTP Call (jsonplaceholder.typicode.com) ---");
        await MakeRealHttpCall(builder);
    }

    /// <summary>
    /// Makes a real HTTP call to demonstrate the builder in action.
    /// </summary>
    private static async Task MakeRealHttpCall(HttpRequestBuilder builder)
    {
        try
        {
            HttpRequestMessage request = builder
                .WithMethod(HttpMethod.Get)
                .WithUri("https://jsonplaceholder.typicode.com/posts/1")
                .AsJsonApi()
                .Build();

            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.SendAsync(request);
                string content = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"Status: {response.StatusCode}");
                Console.WriteLine($"Response Length: {content.Length} bytes");
                Console.WriteLine($"Content Preview: {content.Substring(0, Math.Min(200, content.Length))}...");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error making HTTP call: {ex.Message}");
        }
    }

    /// <summary>
    /// Displays details of an HTTP request.
    /// </summary>
    private static void DisplayRequest(HttpRequestMessage request)
    {
        Console.WriteLine($"Method: {request.Method}");
        Console.WriteLine($"URI: {request.RequestUri}");
        Console.WriteLine($"Version: HTTP/{request.Version}");

        if (request.Headers.Any())
        {
            Console.WriteLine("Headers:");
            foreach (System.Collections.Generic.KeyValuePair<string, IEnumerable<string>> header in request.Headers)
            {
                Console.WriteLine($"  {header.Key}: {string.Join(", ", header.Value)}");
            }
        }

        if (request.Content != null)
        {
            Console.WriteLine("Content:");
            Console.WriteLine($"  Type: {request.Content.GetType().Name}");
            if (request.Content.Headers.ContentType != null)
            {
                Console.WriteLine($"  Content-Type: {request.Content.Headers.ContentType}");
            }
        }
    }

    /// <summary>
    /// Demonstrates the computer builder (educational example).
    /// </summary>
    private static void DemoComputerBuilder()
    {
        ComputerDirector director = new ComputerDirector();

        // Example 1: Build a high-end gaming PC using the director
        Console.WriteLine("--- Building High-End Gaming PC with Director ---");
        IComputerBuilder gamingBuilder = new GamingComputerBuilder();
        Computer gamingPC = director.ConstructHighEndGamingPC(gamingBuilder);
        gamingPC.DisplaySpecs();

        // Example 2: Build an office PC
        Console.WriteLine("--- Building Office PC with Director ---");
        IComputerBuilder officeBuilder = new OfficeComputerBuilder();
        Computer officePC = director.ConstructOfficePC(officeBuilder);
        officePC.DisplaySpecs();

        // Example 3: Build a custom PC without using the director
        Console.WriteLine("--- Building Custom PC without Director ---");
        Computer customPC = new GamingComputerBuilder()
            .SetCPU("AMD Ryzen 9 7950X")
            .SetRAM("32GB DDR5-5600")
            .SetStorage("1TB NVMe SSD")
            .SetGPU("AMD Radeon RX 7900 XTX")
            .SetMotherboard("Gigabyte X670 AORUS Elite")
            .SetPowerSupply("850W 80+ Gold")
            .SetCoolingSystem("AIO Liquid Cooling - 360mm")
            .AddWiFi()
            .AddBluetooth()
            .Build();
        customPC.DisplaySpecs();
    }
}
