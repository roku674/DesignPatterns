using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DesignPatterns.Behavioral.TemplateMethod
{
    // Real Template Method pattern implementation
    // Use case: Data processing pipeline with different data sources and formats

    // Abstract base class defining the template method
    public abstract class DataProcessor
    {
        private readonly List<string> _processingLog;

        protected DataProcessor()
        {
            _processingLog = new List<string>();
        }

        // Template method - defines the algorithm skeleton
        public async Task<ProcessingResult> ProcessDataAsync(string source)
        {
            ProcessingResult result = new ProcessingResult();
            DateTime startTime = DateTime.UtcNow;

            try
            {
                LogStep("Starting data processing");

                // Step 1: Connect to data source
                LogStep("Connecting to data source");
                bool connected = await ConnectAsync(source);
                if (!connected)
                {
                    throw new InvalidOperationException("Failed to connect to data source");
                }

                // Step 2: Extract data
                LogStep("Extracting data");
                List<string> rawData = await ExtractDataAsync(source);
                result.RecordsExtracted = rawData.Count;
                LogStep($"Extracted {rawData.Count} records");

                // Step 3: Validate data (hook method - optional)
                if (ShouldValidate())
                {
                    LogStep("Validating data");
                    List<string> validData = await ValidateDataAsync(rawData);
                    result.RecordsValid = validData.Count;
                    result.RecordsInvalid = rawData.Count - validData.Count;
                    rawData = validData;
                    LogStep($"Validated: {result.RecordsValid} valid, {result.RecordsInvalid} invalid");
                }

                // Step 4: Transform data
                LogStep("Transforming data");
                List<DataRecord> transformedData = await TransformDataAsync(rawData);
                result.RecordsTransformed = transformedData.Count;
                LogStep($"Transformed {transformedData.Count} records");

                // Step 5: Filter data (hook method - optional)
                if (ShouldFilter())
                {
                    LogStep("Filtering data");
                    int beforeFilter = transformedData.Count;
                    transformedData = await FilterDataAsync(transformedData);
                    result.RecordsFiltered = beforeFilter - transformedData.Count;
                    LogStep($"Filtered out {result.RecordsFiltered} records");
                }

                // Step 6: Aggregate data (hook method - optional)
                if (ShouldAggregate())
                {
                    LogStep("Aggregating data");
                    Dictionary<string, object> aggregates = await AggregateDataAsync(transformedData);
                    result.Aggregates = aggregates;
                    LogStep($"Computed {aggregates.Count} aggregates");
                }

                // Step 7: Load data to destination
                LogStep("Loading data to destination");
                bool loaded = await LoadDataAsync(transformedData);
                if (!loaded)
                {
                    throw new InvalidOperationException("Failed to load data to destination");
                }
                result.RecordsLoaded = transformedData.Count;
                LogStep($"Loaded {transformedData.Count} records");

                // Step 8: Cleanup
                LogStep("Cleaning up");
                await CleanupAsync();

                result.Success = true;
                result.ProcessingTimeMs = (DateTime.UtcNow - startTime).TotalMilliseconds;
                LogStep($"Processing completed in {result.ProcessingTimeMs:F2}ms");
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                result.ProcessingTimeMs = (DateTime.UtcNow - startTime).TotalMilliseconds;
                LogStep($"Processing failed: {ex.Message}");
            }

            result.ProcessingLog = new List<string>(_processingLog);
            return result;
        }

        // Abstract methods - must be implemented by subclasses
        protected abstract Task<bool> ConnectAsync(string source);
        protected abstract Task<List<string>> ExtractDataAsync(string source);
        protected abstract Task<List<DataRecord>> TransformDataAsync(List<string> rawData);
        protected abstract Task<bool> LoadDataAsync(List<DataRecord> data);

        // Hook methods - can be overridden by subclasses (optional)
        protected virtual bool ShouldValidate() => true;
        protected virtual bool ShouldFilter() => false;
        protected virtual bool ShouldAggregate() => false;

        protected virtual async Task<List<string>> ValidateDataAsync(List<string> data)
        {
            return await Task.FromResult(data.Where(d => !string.IsNullOrWhiteSpace(d)).ToList());
        }

        protected virtual async Task<List<DataRecord>> FilterDataAsync(List<DataRecord> data)
        {
            return await Task.FromResult(data);
        }

        protected virtual async Task<Dictionary<string, object>> AggregateDataAsync(List<DataRecord> data)
        {
            return await Task.FromResult(new Dictionary<string, object>());
        }

        protected virtual async Task CleanupAsync()
        {
            await Task.CompletedTask;
        }

        protected void LogStep(string message)
        {
            string logEntry = $"[{DateTime.UtcNow:HH:mm:ss.fff}] {message}";
            _processingLog.Add(logEntry);
            Console.WriteLine($"[{GetType().Name}] {logEntry}");
        }
    }

    // Data models
    public class DataRecord
    {
        public string Id { get; set; }
        public Dictionary<string, object> Fields { get; set; }

        public DataRecord()
        {
            Fields = new Dictionary<string, object>();
        }
    }

    public class ProcessingResult
    {
        public bool Success { get; set; }
        public int RecordsExtracted { get; set; }
        public int RecordsValid { get; set; }
        public int RecordsInvalid { get; set; }
        public int RecordsTransformed { get; set; }
        public int RecordsFiltered { get; set; }
        public int RecordsLoaded { get; set; }
        public Dictionary<string, object> Aggregates { get; set; }
        public double ProcessingTimeMs { get; set; }
        public string ErrorMessage { get; set; }
        public List<string> ProcessingLog { get; set; }

        public ProcessingResult()
        {
            Aggregates = new Dictionary<string, object>();
            ProcessingLog = new List<string>();
        }

        public void PrintSummary()
        {
            Console.WriteLine("\n=== Processing Summary ===");
            Console.WriteLine($"Success: {Success}");
            Console.WriteLine($"Records Extracted: {RecordsExtracted}");
            if (RecordsValid > 0 || RecordsInvalid > 0)
            {
                Console.WriteLine($"Records Valid: {RecordsValid}");
                Console.WriteLine($"Records Invalid: {RecordsInvalid}");
            }
            Console.WriteLine($"Records Transformed: {RecordsTransformed}");
            if (RecordsFiltered > 0)
            {
                Console.WriteLine($"Records Filtered: {RecordsFiltered}");
            }
            Console.WriteLine($"Records Loaded: {RecordsLoaded}");
            if (Aggregates.Count > 0)
            {
                Console.WriteLine("Aggregates:");
                foreach (KeyValuePair<string, object> kvp in Aggregates)
                {
                    Console.WriteLine($"  {kvp.Key}: {kvp.Value}");
                }
            }
            Console.WriteLine($"Processing Time: {ProcessingTimeMs:F2}ms");
            if (!Success)
            {
                Console.WriteLine($"Error: {ErrorMessage}");
            }
            Console.WriteLine();
        }
    }

    // Concrete implementation: CSV File Processor
    public class CsvFileProcessor : DataProcessor
    {
        private readonly string _destinationPath;
        private List<string> _tempFiles;

        public CsvFileProcessor(string destinationPath)
        {
            _destinationPath = destinationPath ?? throw new ArgumentNullException(nameof(destinationPath));
            _tempFiles = new List<string>();
        }

        protected override async Task<bool> ConnectAsync(string source)
        {
            return await Task.Run(() =>
            {
                if (!File.Exists(source))
                {
                    throw new FileNotFoundException($"CSV file not found: {source}");
                }
                return true;
            });
        }

        protected override async Task<List<string>> ExtractDataAsync(string source)
        {
            return await Task.Run(() =>
            {
                List<string> lines = File.ReadAllLines(source).ToList();
                if (lines.Count > 0)
                {
                    lines.RemoveAt(0); // Remove header
                }
                return lines;
            });
        }

        protected override async Task<List<DataRecord>> TransformDataAsync(List<string> rawData)
        {
            return await Task.Run(() =>
            {
                List<DataRecord> records = new List<DataRecord>();

                foreach (string line in rawData)
                {
                    string[] parts = line.Split(',');
                    if (parts.Length >= 3)
                    {
                        DataRecord record = new DataRecord
                        {
                            Id = parts[0].Trim()
                        };
                        record.Fields["Name"] = parts[1].Trim();
                        record.Fields["Value"] = decimal.TryParse(parts[2].Trim(), out decimal value) ? value : 0m;

                        records.Add(record);
                    }
                }

                return records;
            });
        }

        protected override bool ShouldFilter() => true;

        protected override async Task<List<DataRecord>> FilterDataAsync(List<DataRecord> data)
        {
            return await Task.Run(() =>
            {
                // Filter out records with value less than 10
                return data.Where(r =>
                {
                    if (r.Fields.ContainsKey("Value") && r.Fields["Value"] is decimal value)
                    {
                        return value >= 10m;
                    }
                    return false;
                }).ToList();
            });
        }

        protected override bool ShouldAggregate() => true;

        protected override async Task<Dictionary<string, object>> AggregateDataAsync(List<DataRecord> data)
        {
            return await Task.Run(() =>
            {
                Dictionary<string, object> aggregates = new Dictionary<string, object>();

                List<decimal> values = data
                    .Where(r => r.Fields.ContainsKey("Value") && r.Fields["Value"] is decimal)
                    .Select(r => (decimal)r.Fields["Value"])
                    .ToList();

                if (values.Count > 0)
                {
                    aggregates["Count"] = values.Count;
                    aggregates["Sum"] = values.Sum();
                    aggregates["Average"] = values.Average();
                    aggregates["Min"] = values.Min();
                    aggregates["Max"] = values.Max();
                }

                return aggregates;
            });
        }

        protected override async Task<bool> LoadDataAsync(List<DataRecord> data)
        {
            return await Task.Run(() =>
            {
                string directory = Path.GetDirectoryName(_destinationPath);
                if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                using (StreamWriter writer = new StreamWriter(_destinationPath))
                {
                    writer.WriteLine("Id,Name,Value");

                    foreach (DataRecord record in data)
                    {
                        string name = record.Fields.ContainsKey("Name") ? record.Fields["Name"].ToString() : "";
                        string value = record.Fields.ContainsKey("Value") ? record.Fields["Value"].ToString() : "";
                        writer.WriteLine($"{record.Id},{name},{value}");
                    }
                }

                _tempFiles.Add(_destinationPath);
                return true;
            });
        }

        protected override async Task CleanupAsync()
        {
            await Task.CompletedTask;
            // Could delete temp files here if needed
        }
    }

    // Concrete implementation: JSON API Processor
    public class JsonApiProcessor : DataProcessor
    {
        private readonly Dictionary<string, List<DataRecord>> _inMemoryStore;
        private bool _isConnected;

        public JsonApiProcessor()
        {
            _inMemoryStore = new Dictionary<string, List<DataRecord>>();
            _isConnected = false;
        }

        protected override async Task<bool> ConnectAsync(string source)
        {
            return await Task.Run(() =>
            {
                // Simulate API connection
                _isConnected = true;
                return true;
            });
        }

        protected override async Task<List<string>> ExtractDataAsync(string source)
        {
            return await Task.Run(() =>
            {
                // Simulate API data extraction
                List<string> mockData = new List<string>
                {
                    "{\"id\":\"1\",\"product\":\"Laptop\",\"price\":999.99}",
                    "{\"id\":\"2\",\"product\":\"Mouse\",\"price\":29.99}",
                    "{\"id\":\"3\",\"product\":\"Keyboard\",\"price\":79.99}",
                    "{\"id\":\"4\",\"product\":\"Monitor\",\"price\":299.99}",
                    "{\"id\":\"5\",\"product\":\"Headset\",\"price\":149.99}"
                };

                return mockData;
            });
        }

        protected override async Task<List<DataRecord>> TransformDataAsync(List<string> rawData)
        {
            return await Task.Run(() =>
            {
                List<DataRecord> records = new List<DataRecord>();

                foreach (string json in rawData)
                {
                    // Simple JSON parsing
                    string cleanJson = json.Trim('{', '}');
                    Dictionary<string, string> fields = new Dictionary<string, string>();

                    foreach (string pair in cleanJson.Split(','))
                    {
                        string[] keyValue = pair.Split(':');
                        if (keyValue.Length == 2)
                        {
                            string key = keyValue[0].Trim('\"').Trim();
                            string value = keyValue[1].Trim('\"').Trim();
                            fields[key] = value;
                        }
                    }

                    if (fields.ContainsKey("id"))
                    {
                        DataRecord record = new DataRecord
                        {
                            Id = fields["id"]
                        };

                        if (fields.ContainsKey("product"))
                        {
                            record.Fields["Product"] = fields["product"];
                        }

                        if (fields.ContainsKey("price") && decimal.TryParse(fields["price"], out decimal price))
                        {
                            record.Fields["Price"] = price;
                        }

                        records.Add(record);
                    }
                }

                return records;
            });
        }

        protected override bool ShouldValidate() => true;

        protected override async Task<List<string>> ValidateDataAsync(List<string> data)
        {
            return await Task.Run(() =>
            {
                // Validate JSON format
                return data.Where(d => d.Contains("{") && d.Contains("}") && d.Contains("\"id\"")).ToList();
            });
        }

        protected override bool ShouldAggregate() => true;

        protected override async Task<Dictionary<string, object>> AggregateDataAsync(List<DataRecord> data)
        {
            return await Task.Run(() =>
            {
                Dictionary<string, object> aggregates = new Dictionary<string, object>();

                List<decimal> prices = data
                    .Where(r => r.Fields.ContainsKey("Price") && r.Fields["Price"] is decimal)
                    .Select(r => (decimal)r.Fields["Price"])
                    .ToList();

                if (prices.Count > 0)
                {
                    aggregates["TotalProducts"] = prices.Count;
                    aggregates["TotalValue"] = prices.Sum();
                    aggregates["AveragePrice"] = prices.Average();
                    aggregates["MostExpensive"] = prices.Max();
                    aggregates["Cheapest"] = prices.Min();
                }

                return aggregates;
            });
        }

        protected override async Task<bool> LoadDataAsync(List<DataRecord> data)
        {
            return await Task.Run(() =>
            {
                _inMemoryStore["products"] = data;
                return true;
            });
        }

        public Dictionary<string, List<DataRecord>> GetStore()
        {
            return new Dictionary<string, List<DataRecord>>(_inMemoryStore);
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Template Method Pattern - Data Processing Pipeline ===\n");

            try
            {
                // Create sample CSV file
                string csvPath = Path.Combine(Path.GetTempPath(), "sample_data.csv");
                string outputPath = Path.Combine(Path.GetTempPath(), "processed_data.csv");

                await CreateSampleCsvAsync(csvPath);
                Console.WriteLine($"Created sample CSV: {csvPath}\n");

                // Process CSV file
                Console.WriteLine("=== Processing CSV File ===\n");
                CsvFileProcessor csvProcessor = new CsvFileProcessor(outputPath);
                ProcessingResult csvResult = await csvProcessor.ProcessDataAsync(csvPath);
                csvResult.PrintSummary();

                // Process JSON API data
                Console.WriteLine("=== Processing JSON API Data ===\n");
                JsonApiProcessor jsonProcessor = new JsonApiProcessor();
                ProcessingResult jsonResult = await jsonProcessor.ProcessDataAsync("api://products");
                jsonResult.PrintSummary();

                // Show loaded data
                Console.WriteLine("=== Loaded JSON Data ===");
                Dictionary<string, List<DataRecord>> store = jsonProcessor.GetStore();
                if (store.ContainsKey("products"))
                {
                    foreach (DataRecord record in store["products"])
                    {
                        Console.WriteLine($"Product {record.Id}: {record.Fields["Product"]} - ${record.Fields["Price"]}");
                    }
                }

                Console.WriteLine("\n=== Pattern Demonstration Complete ===");

                // Cleanup
                if (File.Exists(csvPath))
                {
                    File.Delete(csvPath);
                }
                if (File.Exists(outputPath))
                {
                    File.Delete(outputPath);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }

        private static async Task CreateSampleCsvAsync(string path)
        {
            await Task.Run(() =>
            {
                using (StreamWriter writer = new StreamWriter(path))
                {
                    writer.WriteLine("Id,Name,Value");
                    writer.WriteLine("1,Item A,15.50");
                    writer.WriteLine("2,Item B,8.75");
                    writer.WriteLine("3,Item C,25.00");
                    writer.WriteLine("4,Item D,5.25");
                    writer.WriteLine("5,Item E,42.99");
                    writer.WriteLine("6,Item F,12.00");
                    writer.WriteLine("7,Item G,3.50");
                    writer.WriteLine("8,Item H,67.80");
                }
            });
        }
    }
}
