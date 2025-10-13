using System;
using System.Collections.Concurrent;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Concurrency.HalfSyncHalfAsync;

/// <summary>
/// Represents a network request message
/// </summary>
public class NetworkRequest
{
    public int Id { get; set; }
    public string Url { get; set; }
    public DateTime ReceivedAt { get; set; }

    public NetworkRequest(int id, string url)
    {
        Id = id;
        Url = url;
        ReceivedAt = DateTime.Now;
    }
}

/// <summary>
/// Represents the result of processing a network request
/// </summary>
public class ProcessedRequest
{
    public int Id { get; set; }
    public string Url { get; set; }
    public int ContentLength { get; set; }
    public TimeSpan ProcessingTime { get; set; }
    public bool Success { get; set; }
    public string ErrorMessage { get; set; }
}

/// <summary>
/// Async Layer - Handles asynchronous I/O operations (network requests)
/// </summary>
public class AsyncLayer
{
    private readonly BlockingCollection<NetworkRequest> _queue;
    private readonly HttpClient _httpClient;
    private CancellationTokenSource _cancellationTokenSource;

    public AsyncLayer(BlockingCollection<NetworkRequest> queue)
    {
        _queue = queue;
        _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(5) };
        _cancellationTokenSource = new CancellationTokenSource();
    }

    /// <summary>
    /// Simulates receiving async network requests and adding them to the queue
    /// </summary>
    public async Task ReceiveRequestsAsync(string[] urls)
    {
        Console.WriteLine("[Async Layer] Starting to receive network requests...\n");

        Task[] tasks = new Task[urls.Length];
        for (int i = 0; i < urls.Length; i++)
        {
            int requestId = i + 1;
            string url = urls[i];

            tasks[i] = Task.Run(async () =>
            {
                try
                {
                    // Simulate async network I/O operation
                    await Task.Delay(100); // Simulate network latency

                    NetworkRequest request = new NetworkRequest(requestId, url);
                    _queue.Add(request);

                    Console.WriteLine($"[Async Layer] Request {requestId} received: {url}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Async Layer] Error receiving request {requestId}: {ex.Message}");
                }
            }, _cancellationTokenSource.Token);
        }

        await Task.WhenAll(tasks);
        Console.WriteLine($"\n[Async Layer] All {urls.Length} requests received and queued.\n");
    }

    public void Stop()
    {
        _cancellationTokenSource.Cancel();
        _httpClient.Dispose();
    }
}

/// <summary>
/// Sync Layer - Processes requests synchronously
/// </summary>
public class SyncLayer
{
    private readonly BlockingCollection<NetworkRequest> _queue;
    private Thread _workerThread;
    private volatile bool _running;

    public SyncLayer(BlockingCollection<NetworkRequest> queue)
    {
        _queue = queue;
        _running = false;
    }

    /// <summary>
    /// Starts the synchronous processing thread
    /// </summary>
    public void Start()
    {
        _running = true;
        _workerThread = new Thread(ProcessRequests)
        {
            Name = "SyncProcessorThread",
            IsBackground = true
        };
        _workerThread.Start();
        Console.WriteLine("[Sync Layer] Processing thread started.\n");
    }

    /// <summary>
    /// Synchronously processes requests from the queue
    /// </summary>
    private void ProcessRequests()
    {
        while (_running)
        {
            try
            {
                // Block until a request is available (with timeout)
                if (_queue.TryTake(out NetworkRequest request, TimeSpan.FromMilliseconds(500)))
                {
                    ProcessedRequest result = ProcessRequest(request);
                    DisplayResult(result);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Sync Layer] Error processing request: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Synchronously processes a single request
    /// </summary>
    private ProcessedRequest ProcessRequest(NetworkRequest request)
    {
        DateTime startTime = DateTime.Now;
        ProcessedRequest result = new ProcessedRequest
        {
            Id = request.Id,
            Url = request.Url
        };

        try
        {
            // Simulate synchronous processing work (validation, transformation, business logic)
            Thread.Sleep(200); // Simulate CPU-bound processing

            // Simulate computing content length based on URL
            int contentLength = request.Url.Length * 100 + new Random().Next(100, 1000);

            result.ContentLength = contentLength;
            result.Success = true;
            result.ProcessingTime = DateTime.Now - startTime;
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.ErrorMessage = ex.Message;
            result.ProcessingTime = DateTime.Now - startTime;
        }

        return result;
    }

    private void DisplayResult(ProcessedRequest result)
    {
        if (result.Success)
        {
            Console.WriteLine($"[Sync Layer] Request {result.Id} processed successfully");
            Console.WriteLine($"             URL: {result.Url}");
            Console.WriteLine($"             Content Length: {result.ContentLength} bytes");
            Console.WriteLine($"             Processing Time: {result.ProcessingTime.TotalMilliseconds:F2}ms\n");
        }
        else
        {
            Console.WriteLine($"[Sync Layer] Request {result.Id} failed: {result.ErrorMessage}\n");
        }
    }

    public void Stop()
    {
        _running = false;
        _workerThread?.Join(TimeSpan.FromSeconds(2));
    }
}

/// <summary>
/// Queuing Layer - Mediates between async and sync layers
/// </summary>
public class QueuingLayer
{
    private readonly BlockingCollection<NetworkRequest> _queue;

    public QueuingLayer(int capacity)
    {
        _queue = new BlockingCollection<NetworkRequest>(new ConcurrentQueue<NetworkRequest>(), capacity);
        Console.WriteLine($"[Queuing Layer] Initialized with capacity: {capacity}\n");
    }

    public BlockingCollection<NetworkRequest> GetQueue()
    {
        return _queue;
    }

    public int GetQueueSize()
    {
        return _queue.Count;
    }

    public void Complete()
    {
        _queue.CompleteAdding();
    }
}

/// <summary>
/// Concrete implementation of HalfSyncHalfAsync pattern.
/// Decouples async and sync service processing
/// </summary>
public class HalfSyncHalfAsyncImplementation : IHalfSyncHalfAsync
{
    public void Execute()
    {
        Console.WriteLine("=== Half-Sync/Half-Async Pattern ===\n");
        Console.WriteLine("This pattern decouples asynchronous and synchronous processing:");
        Console.WriteLine("1. Async Layer: Handles I/O operations (network requests) asynchronously");
        Console.WriteLine("2. Queuing Layer: Thread-safe queue mediates between layers");
        Console.WriteLine("3. Sync Layer: Processes requests synchronously in dedicated thread\n");
        Console.WriteLine("========================================\n");

        // Initialize the three layers
        QueuingLayer queuingLayer = new QueuingLayer(capacity: 10);
        BlockingCollection<NetworkRequest> queue = queuingLayer.GetQueue();

        AsyncLayer asyncLayer = new AsyncLayer(queue);
        SyncLayer syncLayer = new SyncLayer(queue);

        // Start the synchronous processing layer
        syncLayer.Start();

        // Simulate async network requests
        string[] urls = new string[]
        {
            "https://api.example.com/users",
            "https://api.example.com/products",
            "https://api.example.com/orders",
            "https://api.example.com/customers",
            "https://api.example.com/inventory"
        };

        // Async layer receives requests asynchronously
        Task receiveTask = asyncLayer.ReceiveRequestsAsync(urls);
        receiveTask.Wait();

        // Allow time for sync layer to process all requests
        Console.WriteLine("[Main] Waiting for all requests to be processed...\n");
        while (queuingLayer.GetQueueSize() > 0)
        {
            Thread.Sleep(100);
        }
        Thread.Sleep(500); // Extra time to ensure last item is fully processed

        // Cleanup
        Console.WriteLine("\n[Main] Shutting down layers...\n");
        asyncLayer.Stop();
        syncLayer.Stop();
        queuingLayer.Complete();

        Console.WriteLine("========================================");
        Console.WriteLine("Pattern Benefits:");
        Console.WriteLine("- Async operations don't block sync processing");
        Console.WriteLine("- Sync code avoids callback complexity");
        Console.WriteLine("- Queue provides buffering and flow control");
        Console.WriteLine("- Clear separation of concerns");
        Console.WriteLine("========================================");
    }
}
