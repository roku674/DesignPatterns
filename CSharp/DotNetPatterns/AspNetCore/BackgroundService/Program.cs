using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DesignPatterns.DotNet.AspNetCore.BackgroundService
{
    /// <summary>
    /// Background Service Pattern - IHostedService for background tasks
    ///
    /// This pattern demonstrates how to implement long-running background tasks
    /// in ASP.NET Core using IHostedService and BackgroundService base class.
    /// </summary>

    // Base background service using BackgroundService
    public class TimedBackgroundService : Microsoft.Extensions.Hosting.BackgroundService
    {
        private readonly ILogger<TimedBackgroundService> _logger;
        private readonly TimeSpan _interval;
        private int _executionCount = 0;

        public TimedBackgroundService(
            ILogger<TimedBackgroundService> logger,
            TimeSpan interval)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _interval = interval;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Timed Background Service is starting");

            while (!stoppingToken.IsCancellationRequested)
            {
                _executionCount++;
                _logger.LogInformation(
                    "Timed Background Service is executing (count: {Count})",
                    _executionCount
                );

                await DoWorkAsync(stoppingToken);

                try
                {
                    await Task.Delay(_interval, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Timed Background Service is stopping");
                    break;
                }
            }
        }

        private async Task DoWorkAsync(CancellationToken cancellationToken)
        {
            // Simulate work
            await Task.Delay(100, cancellationToken);
            _logger.LogDebug("Work completed at {Time}", DateTime.UtcNow);
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation(
                "Timed Background Service is stopping after {Count} executions",
                _executionCount
            );
            return base.StopAsync(cancellationToken);
        }
    }

    // Queue processing background service
    public interface IBackgroundTaskQueue
    {
        void QueueBackgroundWorkItem(Func<CancellationToken, Task> workItem);
        Task<Func<CancellationToken, Task>> DequeueAsync(CancellationToken cancellationToken);
    }

    public class BackgroundTaskQueue : IBackgroundTaskQueue
    {
        private readonly System.Collections.Concurrent.ConcurrentQueue<Func<CancellationToken, Task>> _workItems;
        private readonly SemaphoreSlim _signal;

        public BackgroundTaskQueue()
        {
            _workItems = new System.Collections.Concurrent.ConcurrentQueue<Func<CancellationToken, Task>>();
            _signal = new SemaphoreSlim(0);
        }

        public void QueueBackgroundWorkItem(Func<CancellationToken, Task> workItem)
        {
            if (workItem == null) throw new ArgumentNullException(nameof(workItem));

            _workItems.Enqueue(workItem);
            _signal.Release();
        }

        public async Task<Func<CancellationToken, Task>> DequeueAsync(
            CancellationToken cancellationToken)
        {
            await _signal.WaitAsync(cancellationToken);
            _workItems.TryDequeue(out Func<CancellationToken, Task> workItem);

            return workItem;
        }
    }

    public class QueuedHostedService : Microsoft.Extensions.Hosting.BackgroundService
    {
        private readonly ILogger<QueuedHostedService> _logger;
        private readonly IBackgroundTaskQueue _taskQueue;

        public QueuedHostedService(
            IBackgroundTaskQueue taskQueue,
            ILogger<QueuedHostedService> logger)
        {
            _taskQueue = taskQueue ?? throw new ArgumentNullException(nameof(taskQueue));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Queued Hosted Service is running");

            while (!stoppingToken.IsCancellationRequested)
            {
                Func<CancellationToken, Task> workItem = await _taskQueue.DequeueAsync(stoppingToken);

                try
                {
                    await workItem(stoppingToken);
                    _logger.LogInformation("Work item completed successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing work item");
                }
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Queued Hosted Service is stopping");
            await base.StopAsync(cancellationToken);
        }
    }

    // Data synchronization background service
    public class DataSyncService : Microsoft.Extensions.Hosting.BackgroundService
    {
        private readonly ILogger<DataSyncService> _logger;
        private readonly TimeSpan _syncInterval;

        public DataSyncService(
            ILogger<DataSyncService> logger,
            TimeSpan syncInterval)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _syncInterval = syncInterval;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Data Sync Service starting");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SyncDataAsync(stoppingToken);
                    _logger.LogInformation("Data synchronization completed");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during data synchronization");
                }

                await Task.Delay(_syncInterval, stoppingToken);
            }
        }

        private async Task SyncDataAsync(CancellationToken cancellationToken)
        {
            _logger.LogDebug("Starting data sync at {Time}", DateTime.UtcNow);

            // Simulate sync operations
            await Task.Delay(200, cancellationToken);

            _logger.LogDebug("Completed data sync at {Time}", DateTime.UtcNow);
        }
    }

    // Cache cleanup background service
    public class CacheCleanupService : Microsoft.Extensions.Hosting.BackgroundService
    {
        private readonly ILogger<CacheCleanupService> _logger;
        private readonly TimeSpan _cleanupInterval;
        private readonly Dictionary<string, CacheEntry> _cache;

        public CacheCleanupService(
            ILogger<CacheCleanupService> logger,
            TimeSpan cleanupInterval)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cleanupInterval = cleanupInterval;
            _cache = new Dictionary<string, CacheEntry>();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Cache Cleanup Service starting");

            // Add some test cache entries
            _cache["key1"] = new CacheEntry { ExpirationTime = DateTime.UtcNow.AddSeconds(5) };
            _cache["key2"] = new CacheEntry { ExpirationTime = DateTime.UtcNow.AddSeconds(10) };
            _cache["key3"] = new CacheEntry { ExpirationTime = DateTime.UtcNow.AddMinutes(1) };

            while (!stoppingToken.IsCancellationRequested)
            {
                int removed = CleanupExpiredEntries();
                if (removed > 0)
                {
                    _logger.LogInformation("Removed {Count} expired cache entries", removed);
                }

                await Task.Delay(_cleanupInterval, stoppingToken);
            }
        }

        private int CleanupExpiredEntries()
        {
            DateTime now = DateTime.UtcNow;
            List<string> expiredKeys = new List<string>();

            foreach (KeyValuePair<string, CacheEntry> entry in _cache)
            {
                if (entry.Value.ExpirationTime < now)
                {
                    expiredKeys.Add(entry.Key);
                }
            }

            foreach (string key in expiredKeys)
            {
                _cache.Remove(key);
            }

            return expiredKeys.Count;
        }

        private class CacheEntry
        {
            public DateTime ExpirationTime { get; set; }
        }
    }

    // Health check background service
    public class HealthCheckService : Microsoft.Extensions.Hosting.BackgroundService
    {
        private readonly ILogger<HealthCheckService> _logger;
        private readonly TimeSpan _checkInterval;

        public HealthCheckService(
            ILogger<HealthCheckService> logger,
            TimeSpan checkInterval)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _checkInterval = checkInterval;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Health Check Service starting");

            while (!stoppingToken.IsCancellationRequested)
            {
                HealthStatus status = await CheckHealthAsync(stoppingToken);

                if (status == HealthStatus.Unhealthy)
                {
                    _logger.LogWarning("System health check failed");
                }
                else
                {
                    _logger.LogDebug("System health check passed");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task<HealthStatus> CheckHealthAsync(CancellationToken cancellationToken)
        {
            // Simulate health checks
            await Task.Delay(50, cancellationToken);

            // Check various components
            bool databaseHealthy = await CheckDatabaseAsync(cancellationToken);
            bool cacheHealthy = await CheckCacheAsync(cancellationToken);
            bool apiHealthy = await CheckExternalApiAsync(cancellationToken);

            if (!databaseHealthy || !cacheHealthy || !apiHealthy)
            {
                return HealthStatus.Unhealthy;
            }

            return HealthStatus.Healthy;
        }

        private async Task<bool> CheckDatabaseAsync(CancellationToken cancellationToken)
        {
            await Task.Delay(10, cancellationToken);
            return true;
        }

        private async Task<bool> CheckCacheAsync(CancellationToken cancellationToken)
        {
            await Task.Delay(10, cancellationToken);
            return true;
        }

        private async Task<bool> CheckExternalApiAsync(CancellationToken cancellationToken)
        {
            await Task.Delay(10, cancellationToken);
            return true;
        }

        private enum HealthStatus
        {
            Healthy,
            Unhealthy
        }
    }

    // Scoped service processor
    public interface IScopedProcessingService
    {
        Task DoWorkAsync(CancellationToken cancellationToken);
    }

    public class ScopedProcessingService : IScopedProcessingService
    {
        private readonly ILogger<ScopedProcessingService> _logger;

        public ScopedProcessingService(ILogger<ScopedProcessingService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task DoWorkAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Scoped processing service is working");
            await Task.Delay(100, cancellationToken);
        }
    }

    public class ConsumeScopedServiceHostedService : Microsoft.Extensions.Hosting.BackgroundService
    {
        private readonly ILogger<ConsumeScopedServiceHostedService> _logger;
        private readonly IServiceProvider _services;

        public ConsumeScopedServiceHostedService(
            IServiceProvider services,
            ILogger<ConsumeScopedServiceHostedService> logger)
        {
            _services = services ?? throw new ArgumentNullException(nameof(services));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Consume Scoped Service Hosted Service running");

            while (!stoppingToken.IsCancellationRequested)
            {
                using (IServiceScope scope = _services.CreateScope())
                {
                    IScopedProcessingService scopedService =
                        scope.ServiceProvider.GetRequiredService<IScopedProcessingService>();

                    await scopedService.DoWorkAsync(stoppingToken);
                }

                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }

    // Demonstration
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Background Service Pattern Demo ===\n");

            // Demo 1: Timed background service
            Console.WriteLine("Demo 1: Timed Background Service");
            await DemoTimedService();

            // Demo 2: Queue processing service
            Console.WriteLine("\nDemo 2: Queue Processing Service");
            await DemoQueuedService();

            // Demo 3: Data sync service
            Console.WriteLine("\nDemo 3: Data Synchronization Service");
            await DemoDataSyncService();

            // Demo 4: Cache cleanup service
            Console.WriteLine("\nDemo 4: Cache Cleanup Service");
            await DemoCacheCleanupService();

            // Demo 5: Scoped service consumer
            Console.WriteLine("\nDemo 5: Scoped Service Consumer");
            await DemoScopedServiceConsumer();

            Console.WriteLine("\n=== Background Service Benefits ===");
            Console.WriteLine("- Long-running background tasks");
            Console.WriteLine("- Graceful shutdown support");
            Console.WriteLine("- Integrated with ASP.NET Core hosting");
            Console.WriteLine("- Dependency injection support");
            Console.WriteLine("- Cancellation token support");
            Console.WriteLine("- Logging integration");
        }

        private static async Task DemoTimedService()
        {
            IHost host = Host.CreateDefaultBuilder()
                .ConfigureServices((context, services) =>
                {
                    services.AddHostedService(provider =>
                        new TimedBackgroundService(
                            provider.GetRequiredService<ILogger<TimedBackgroundService>>(),
                            TimeSpan.FromSeconds(1)
                        ));
                })
                .Build();

            using (CancellationTokenSource cts = new CancellationTokenSource(TimeSpan.FromSeconds(3)))
            {
                await host.RunAsync(cts.Token);
            }

            Console.WriteLine("  Timed service completed");
        }

        private static async Task DemoQueuedService()
        {
            IHost host = Host.CreateDefaultBuilder()
                .ConfigureServices((context, services) =>
                {
                    services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
                    services.AddHostedService<QueuedHostedService>();
                })
                .Build();

            IBackgroundTaskQueue queue = host.Services.GetRequiredService<IBackgroundTaskQueue>();

            // Queue some work items
            for (int i = 0; i < 3; i++)
            {
                int workItemNumber = i;
                queue.QueueBackgroundWorkItem(async token =>
                {
                    Console.WriteLine($"  Processing work item {workItemNumber}");
                    await Task.Delay(100, token);
                });
            }

            using (CancellationTokenSource cts = new CancellationTokenSource(TimeSpan.FromSeconds(2)))
            {
                await host.RunAsync(cts.Token);
            }

            Console.WriteLine("  Queued service completed");
        }

        private static async Task DemoDataSyncService()
        {
            IHost host = Host.CreateDefaultBuilder()
                .ConfigureServices((context, services) =>
                {
                    services.AddHostedService(provider =>
                        new DataSyncService(
                            provider.GetRequiredService<ILogger<DataSyncService>>(),
                            TimeSpan.FromSeconds(1)
                        ));
                })
                .Build();

            using (CancellationTokenSource cts = new CancellationTokenSource(TimeSpan.FromSeconds(2)))
            {
                await host.RunAsync(cts.Token);
            }

            Console.WriteLine("  Data sync service completed");
        }

        private static async Task DemoCacheCleanupService()
        {
            IHost host = Host.CreateDefaultBuilder()
                .ConfigureServices((context, services) =>
                {
                    services.AddHostedService(provider =>
                        new CacheCleanupService(
                            provider.GetRequiredService<ILogger<CacheCleanupService>>(),
                            TimeSpan.FromSeconds(1)
                        ));
                })
                .Build();

            using (CancellationTokenSource cts = new CancellationTokenSource(TimeSpan.FromSeconds(3)))
            {
                await host.RunAsync(cts.Token);
            }

            Console.WriteLine("  Cache cleanup service completed");
        }

        private static async Task DemoScopedServiceConsumer()
        {
            IHost host = Host.CreateDefaultBuilder()
                .ConfigureServices((context, services) =>
                {
                    services.AddScoped<IScopedProcessingService, ScopedProcessingService>();
                    services.AddHostedService<ConsumeScopedServiceHostedService>();
                })
                .Build();

            using (CancellationTokenSource cts = new CancellationTokenSource(TimeSpan.FromSeconds(2)))
            {
                await host.RunAsync(cts.Token);
            }

            Console.WriteLine("  Scoped service consumer completed");
        }
    }
}
