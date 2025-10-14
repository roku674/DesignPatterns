using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;

namespace DesignPatterns.DotNet.ModernCSharp.AsyncStreams
{
    /// <summary>
    /// Async Streams Pattern - IAsyncEnumerable for async iteration
    ///
    /// This pattern demonstrates how to use IAsyncEnumerable<T> introduced in C# 8.0
    /// for asynchronous iteration over collections, enabling efficient processing
    /// of large data sets with async operations.
    /// </summary>

    // Data models
    public record LogEntry(DateTime Timestamp, string Level, string Message, string Source);

    public record SensorReading(int SensorId, DateTime Timestamp, double Value, string Unit);

    public record StockPrice(string Symbol, DateTime Timestamp, decimal Price, long Volume);

    // Async stream data sources
    public interface IAsyncDataSource<T>
    {
        IAsyncEnumerable<T> GetDataAsync(CancellationToken cancellationToken = default);
    }

    // Log file reader using async streams
    public class AsyncLogReader : IAsyncDataSource<LogEntry>
    {
        private readonly List<LogEntry> _logs;

        public AsyncLogReader()
        {
            _logs = GenerateSampleLogs();
        }

        public async IAsyncEnumerable<LogEntry> GetDataAsync(
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            foreach (LogEntry log in _logs)
            {
                cancellationToken.ThrowIfCancellationRequested();

                // Simulate async I/O operation
                await Task.Delay(10, cancellationToken);

                yield return log;
            }
        }

        public async IAsyncEnumerable<LogEntry> FilterByLevelAsync(
            string level,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            await foreach (LogEntry log in GetDataAsync(cancellationToken))
            {
                if (log.Level.Equals(level, StringComparison.OrdinalIgnoreCase))
                {
                    yield return log;
                }
            }
        }

        public async IAsyncEnumerable<LogEntry> TailAsync(
            int count,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            List<LogEntry> buffer = new List<LogEntry>();

            await foreach (LogEntry log in GetDataAsync(cancellationToken))
            {
                buffer.Add(log);
                if (buffer.Count > count)
                {
                    buffer.RemoveAt(0);
                }
            }

            foreach (LogEntry log in buffer)
            {
                yield return log;
            }
        }

        private List<LogEntry> GenerateSampleLogs()
        {
            DateTime now = DateTime.UtcNow;
            return new List<LogEntry>
            {
                new LogEntry(now.AddMinutes(-10), "INFO", "Application started", "App"),
                new LogEntry(now.AddMinutes(-9), "DEBUG", "Configuration loaded", "Config"),
                new LogEntry(now.AddMinutes(-8), "INFO", "Database connected", "Database"),
                new LogEntry(now.AddMinutes(-7), "WARNING", "Cache miss detected", "Cache"),
                new LogEntry(now.AddMinutes(-6), "ERROR", "Failed to process request", "API"),
                new LogEntry(now.AddMinutes(-5), "INFO", "Request processed successfully", "API"),
                new LogEntry(now.AddMinutes(-4), "DEBUG", "Memory usage: 256MB", "System"),
                new LogEntry(now.AddMinutes(-3), "WARNING", "Slow query detected", "Database"),
                new LogEntry(now.AddMinutes(-2), "INFO", "Backup completed", "Backup"),
                new LogEntry(now.AddMinutes(-1), "ERROR", "Connection timeout", "Network")
            };
        }
    }

    // Sensor data stream
    public class AsyncSensorStream : IAsyncDataSource<SensorReading>
    {
        private readonly Random _random;

        public AsyncSensorStream()
        {
            _random = new Random();
        }

        public async IAsyncEnumerable<SensorReading> GetDataAsync(
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            int readingCount = 20;
            for (int i = 0; i < readingCount; i++)
            {
                cancellationToken.ThrowIfCancellationRequested();

                await Task.Delay(50, cancellationToken);

                yield return new SensorReading(
                    SensorId: _random.Next(1, 6),
                    Timestamp: DateTime.UtcNow,
                    Value: 20 + _random.NextDouble() * 10,
                    Unit: "°C"
                );
            }
        }

        public async IAsyncEnumerable<SensorReading> GetFilteredReadingsAsync(
            int sensorId,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            await foreach (SensorReading reading in GetDataAsync(cancellationToken))
            {
                if (reading.SensorId == sensorId)
                {
                    yield return reading;
                }
            }
        }

        public async IAsyncEnumerable<SensorReading> GetAnomalousReadingsAsync(
            double threshold,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            await foreach (SensorReading reading in GetDataAsync(cancellationToken))
            {
                if (reading.Value > threshold)
                {
                    yield return reading;
                }
            }
        }
    }

    // Stock price stream
    public class AsyncStockPriceStream : IAsyncDataSource<StockPrice>
    {
        private readonly Random _random;
        private readonly string[] _symbols = { "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA" };

        public AsyncStockPriceStream()
        {
            _random = new Random();
        }

        public async IAsyncEnumerable<StockPrice> GetDataAsync(
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            int tickCount = 25;
            for (int i = 0; i < tickCount; i++)
            {
                cancellationToken.ThrowIfCancellationRequested();

                await Task.Delay(40, cancellationToken);

                yield return new StockPrice(
                    Symbol: _symbols[_random.Next(_symbols.Length)],
                    Timestamp: DateTime.UtcNow,
                    Price: 100m + (decimal)(_random.NextDouble() * 50),
                    Volume: _random.Next(1000, 10000)
                );
            }
        }

        public async IAsyncEnumerable<StockPrice> GetPricesBySymbolAsync(
            string symbol,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            await foreach (StockPrice price in GetDataAsync(cancellationToken))
            {
                if (price.Symbol == symbol)
                {
                    yield return price;
                }
            }
        }

        public async IAsyncEnumerable<StockPrice> GetHighVolumeTradesAsync(
            long volumeThreshold,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            await foreach (StockPrice price in GetDataAsync(cancellationToken))
            {
                if (price.Volume > volumeThreshold)
                {
                    yield return price;
                }
            }
        }
    }

    // Async stream operators (LINQ-style)
    public static class AsyncStreamExtensions
    {
        public static async IAsyncEnumerable<T> WhereAsync<T>(
            this IAsyncEnumerable<T> source,
            Func<T, bool> predicate,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            if (predicate == null) throw new ArgumentNullException(nameof(predicate));

            await foreach (T item in source.WithCancellation(cancellationToken))
            {
                if (predicate(item))
                {
                    yield return item;
                }
            }
        }

        public static async IAsyncEnumerable<TResult> SelectAsync<T, TResult>(
            this IAsyncEnumerable<T> source,
            Func<T, TResult> selector,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            if (selector == null) throw new ArgumentNullException(nameof(selector));

            await foreach (T item in source.WithCancellation(cancellationToken))
            {
                yield return selector(item);
            }
        }

        public static async IAsyncEnumerable<T> TakeAsync<T>(
            this IAsyncEnumerable<T> source,
            int count,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            if (count <= 0) yield break;

            int taken = 0;
            await foreach (T item in source.WithCancellation(cancellationToken))
            {
                yield return item;
                taken++;
                if (taken >= count) break;
            }
        }

        public static async IAsyncEnumerable<T> SkipAsync<T>(
            this IAsyncEnumerable<T> source,
            int count,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));

            int skipped = 0;
            await foreach (T item in source.WithCancellation(cancellationToken))
            {
                if (skipped < count)
                {
                    skipped++;
                    continue;
                }
                yield return item;
            }
        }

        public static async Task<List<T>> ToListAsync<T>(
            this IAsyncEnumerable<T> source,
            CancellationToken cancellationToken = default)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));

            List<T> list = new List<T>();
            await foreach (T item in source.WithCancellation(cancellationToken))
            {
                list.Add(item);
            }
            return list;
        }

        public static async Task<int> CountAsync<T>(
            this IAsyncEnumerable<T> source,
            CancellationToken cancellationToken = default)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));

            int count = 0;
            await foreach (T _ in source.WithCancellation(cancellationToken))
            {
                count++;
            }
            return count;
        }

        public static async IAsyncEnumerable<T> DistinctAsync<T>(
            this IAsyncEnumerable<T> source,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));

            HashSet<T> seen = new HashSet<T>();
            await foreach (T item in source.WithCancellation(cancellationToken))
            {
                if (seen.Add(item))
                {
                    yield return item;
                }
            }
        }

        public static async IAsyncEnumerable<IGrouping<TKey, T>> GroupByAsync<T, TKey>(
            this IAsyncEnumerable<T> source,
            Func<T, TKey> keySelector,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            if (keySelector == null) throw new ArgumentNullException(nameof(keySelector));

            Dictionary<TKey, List<T>> groups = new Dictionary<TKey, List<T>>();

            await foreach (T item in source.WithCancellation(cancellationToken))
            {
                TKey key = keySelector(item);
                if (!groups.ContainsKey(key))
                {
                    groups[key] = new List<T>();
                }
                groups[key].Add(item);
            }

            foreach (KeyValuePair<TKey, List<T>> group in groups)
            {
                yield return new Grouping<TKey, T>(group.Key, group.Value);
            }
        }
    }

    // Helper class for grouping
    public class Grouping<TKey, T> : IGrouping<TKey, T>
    {
        private readonly List<T> _items;

        public Grouping(TKey key, List<T> items)
        {
            Key = key;
            _items = items;
        }

        public TKey Key { get; }

        public IEnumerator<T> GetEnumerator() => _items.GetEnumerator();

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();
    }

    // Async stream processor
    public class AsyncStreamProcessor
    {
        public async Task<Dictionary<string, int>> CountByGroupAsync<T, TKey>(
            IAsyncEnumerable<T> source,
            Func<T, TKey> keySelector,
            CancellationToken cancellationToken = default)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            if (keySelector == null) throw new ArgumentNullException(nameof(keySelector));

            Dictionary<string, int> counts = new Dictionary<string, int>();

            await foreach (T item in source.WithCancellation(cancellationToken))
            {
                string key = keySelector(item)?.ToString() ?? "null";
                counts[key] = counts.GetValueOrDefault(key) + 1;
            }

            return counts;
        }

        public async Task<double> AverageAsync<T>(
            IAsyncEnumerable<T> source,
            Func<T, double> selector,
            CancellationToken cancellationToken = default)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            if (selector == null) throw new ArgumentNullException(nameof(selector));

            double sum = 0;
            int count = 0;

            await foreach (T item in source.WithCancellation(cancellationToken))
            {
                sum += selector(item);
                count++;
            }

            return count > 0 ? sum / count : 0;
        }
    }

    // Demonstration
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Async Streams Pattern Demo ===\n");

            // Demo 1: Basic async stream iteration
            Console.WriteLine("Demo 1: Basic Async Stream Iteration");
            await DemoBasicAsyncStream();

            // Demo 2: Filtering async streams
            Console.WriteLine("\nDemo 2: Filtering Async Streams");
            await DemoFilteringStreams();

            // Demo 3: Async LINQ operators
            Console.WriteLine("\nDemo 3: Async LINQ Operators");
            await DemoAsyncLinqOperators();

            // Demo 4: Grouping and aggregation
            Console.WriteLine("\nDemo 4: Grouping and Aggregation");
            await DemoGroupingAndAggregation();

            // Demo 5: Cancellation
            Console.WriteLine("\nDemo 5: Cancellation Support");
            await DemoCancellation();

            Console.WriteLine("\n=== Async Streams Benefits ===");
            Console.WriteLine("- Memory efficient for large datasets");
            Console.WriteLine("- Built-in cancellation support");
            Console.WriteLine("- Composable with LINQ-style operators");
            Console.WriteLine("- Lazy evaluation");
            Console.WriteLine("- Async/await friendly");
            Console.WriteLine("- Reduces memory pressure");
        }

        private static async Task DemoBasicAsyncStream()
        {
            AsyncLogReader logReader = new AsyncLogReader();

            int count = 0;
            await foreach (LogEntry log in logReader.GetDataAsync())
            {
                count++;
            }

            Console.WriteLine($"  Processed {count} log entries asynchronously");
        }

        private static async Task DemoFilteringStreams()
        {
            AsyncLogReader logReader = new AsyncLogReader();

            Console.WriteLine("  Error logs:");
            await foreach (LogEntry log in logReader.FilterByLevelAsync("ERROR"))
            {
                Console.WriteLine($"    [{log.Timestamp:HH:mm:ss}] {log.Message}");
            }
        }

        private static async Task DemoAsyncLinqOperators()
        {
            AsyncSensorStream sensorStream = new AsyncSensorStream();

            IAsyncEnumerable<SensorReading> filteredReadings = sensorStream
                .GetDataAsync()
                .WhereAsync(r => r.Value > 25)
                .TakeAsync(5);

            Console.WriteLine("  High temperature readings (>25°C):");
            await foreach (SensorReading reading in filteredReadings)
            {
                Console.WriteLine($"    Sensor {reading.SensorId}: {reading.Value:F2}{reading.Unit}");
            }
        }

        private static async Task DemoGroupingAndAggregation()
        {
            AsyncStockPriceStream stockStream = new AsyncStockPriceStream();
            AsyncStreamProcessor processor = new AsyncStreamProcessor();

            Dictionary<string, int> tradesBySymbol = await processor.CountByGroupAsync(
                stockStream.GetDataAsync(),
                price => price.Symbol
            );

            Console.WriteLine("  Trades by symbol:");
            foreach (KeyValuePair<string, int> kvp in tradesBySymbol)
            {
                Console.WriteLine($"    {kvp.Key}: {kvp.Value} trades");
            }
        }

        private static async Task DemoCancellation()
        {
            using (CancellationTokenSource cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(200)))
            {
                AsyncSensorStream sensorStream = new AsyncSensorStream();

                try
                {
                    int count = 0;
                    await foreach (SensorReading reading in sensorStream.GetDataAsync(cts.Token))
                    {
                        count++;
                    }
                    Console.WriteLine($"  Processed {count} readings");
                }
                catch (OperationCanceledException)
                {
                    Console.WriteLine("  Stream cancelled after timeout");
                }
            }
        }
    }
}
