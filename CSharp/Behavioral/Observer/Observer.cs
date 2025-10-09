using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DesignPatterns.Behavioral.Observer
{
    // Real Observer pattern implementation with INotifyPropertyChanged
    // Use case: Stock price monitoring system with real-time updates

    public interface IStockObserver
    {
        void Update(string stockSymbol, decimal price, DateTime timestamp);
    }

    public class Stock : INotifyPropertyChanged
    {
        private string _symbol;
        private decimal _price;
        private decimal _previousPrice;
        private DateTime _lastUpdate;

        public event PropertyChangedEventHandler PropertyChanged;

        public Stock(string symbol, decimal initialPrice)
        {
            _symbol = symbol ?? throw new ArgumentNullException(nameof(symbol));
            _price = initialPrice;
            _previousPrice = initialPrice;
            _lastUpdate = DateTime.UtcNow;
        }

        public string Symbol
        {
            get => _symbol;
            set
            {
                if (_symbol != value)
                {
                    _symbol = value;
                    OnPropertyChanged(nameof(Symbol));
                }
            }
        }

        public decimal Price
        {
            get => _price;
            set
            {
                if (_price != value)
                {
                    _previousPrice = _price;
                    _price = value;
                    _lastUpdate = DateTime.UtcNow;
                    OnPropertyChanged(nameof(Price));
                    OnPropertyChanged(nameof(PercentageChange));
                }
            }
        }

        public decimal PercentageChange
        {
            get
            {
                if (_previousPrice == 0) return 0;
                return ((_price - _previousPrice) / _previousPrice) * 100;
            }
        }

        public DateTime LastUpdate => _lastUpdate;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    // Email alert observer
    public class EmailAlertObserver : IStockObserver
    {
        private readonly string _email;
        private readonly decimal _threshold;
        private readonly List<string> _sentAlerts;

        public EmailAlertObserver(string email, decimal priceThreshold)
        {
            _email = email ?? throw new ArgumentNullException(nameof(email));
            _threshold = priceThreshold;
            _sentAlerts = new List<string>();
        }

        public void Update(string stockSymbol, decimal price, DateTime timestamp)
        {
            if (price >= _threshold)
            {
                string alertMessage = $"[EMAIL ALERT to {_email}] Stock {stockSymbol} reached ${price:F2} at {timestamp:yyyy-MM-dd HH:mm:ss} (Threshold: ${_threshold:F2})";
                _sentAlerts.Add(alertMessage);
                Console.WriteLine(alertMessage);
            }
        }

        public IReadOnlyList<string> GetSentAlerts() => _sentAlerts.AsReadOnly();
    }

    // Trading bot observer
    public class TradingBotObserver : IStockObserver
    {
        private readonly decimal _buyThreshold;
        private readonly decimal _sellThreshold;
        private readonly List<string> _tradeHistory;
        private decimal _holdings;

        public TradingBotObserver(decimal buyThreshold, decimal sellThreshold)
        {
            _buyThreshold = buyThreshold;
            _sellThreshold = sellThreshold;
            _tradeHistory = new List<string>();
            _holdings = 0;
        }

        public void Update(string stockSymbol, decimal price, DateTime timestamp)
        {
            if (price <= _buyThreshold && _holdings == 0)
            {
                _holdings = 100; // Buy 100 shares
                string trade = $"[TRADING BOT] BUY 100 shares of {stockSymbol} at ${price:F2} on {timestamp:yyyy-MM-dd HH:mm:ss}";
                _tradeHistory.Add(trade);
                Console.WriteLine(trade);
            }
            else if (price >= _sellThreshold && _holdings > 0)
            {
                decimal profit = (_sellThreshold - _buyThreshold) * _holdings;
                string trade = $"[TRADING BOT] SELL {_holdings} shares of {stockSymbol} at ${price:F2} on {timestamp:yyyy-MM-dd HH:mm:ss} (Profit: ${profit:F2})";
                _tradeHistory.Add(trade);
                Console.WriteLine(trade);
                _holdings = 0;
            }
        }

        public IReadOnlyList<string> GetTradeHistory() => _tradeHistory.AsReadOnly();
        public decimal Holdings => _holdings;
    }

    // File logger observer
    public class FileLoggerObserver : IStockObserver
    {
        private readonly string _logFilePath;
        private readonly object _lockObject = new object();

        public FileLoggerObserver(string logFilePath)
        {
            _logFilePath = logFilePath ?? throw new ArgumentNullException(nameof(logFilePath));

            // Ensure directory exists
            string directory = Path.GetDirectoryName(_logFilePath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            // Initialize log file with header
            if (!File.Exists(_logFilePath))
            {
                File.WriteAllText(_logFilePath, "Stock Price Log\n" + new string('-', 80) + "\n");
            }
        }

        public void Update(string stockSymbol, decimal price, DateTime timestamp)
        {
            string logEntry = $"{timestamp:yyyy-MM-dd HH:mm:ss.fff} | {stockSymbol} | ${price:F2}\n";

            lock (_lockObject)
            {
                try
                {
                    File.AppendAllText(_logFilePath, logEntry);
                }
                catch (IOException ex)
                {
                    Console.WriteLine($"[FILE LOGGER ERROR] Failed to write to log: {ex.Message}");
                }
            }
        }

        public async Task<List<string>> ReadLogEntriesAsync()
        {
            try
            {
                string[] lines = await File.ReadAllLinesAsync(_logFilePath);
                return lines.Skip(2).ToList(); // Skip header lines
            }
            catch (IOException ex)
            {
                Console.WriteLine($"[FILE LOGGER ERROR] Failed to read log: {ex.Message}");
                return new List<string>();
            }
        }
    }

    // Stock market with observer management
    public class StockMarket
    {
        private readonly Dictionary<string, Stock> _stocks;
        private readonly Dictionary<string, List<IStockObserver>> _observers;
        private readonly object _lockObject = new object();

        public StockMarket()
        {
            _stocks = new Dictionary<string, Stock>();
            _observers = new Dictionary<string, List<IStockObserver>>();
        }

        public void RegisterStock(string symbol, decimal initialPrice)
        {
            lock (_lockObject)
            {
                if (_stocks.ContainsKey(symbol))
                {
                    throw new InvalidOperationException($"Stock {symbol} is already registered");
                }

                Stock stock = new Stock(symbol, initialPrice);
                _stocks[symbol] = stock;
                _observers[symbol] = new List<IStockObserver>();

                // Subscribe to property changed events
                stock.PropertyChanged += (sender, e) =>
                {
                    if (e.PropertyName == nameof(Stock.Price))
                    {
                        Stock s = sender as Stock;
                        if (s != null)
                        {
                            NotifyObservers(s.Symbol, s.Price, s.LastUpdate);
                        }
                    }
                };

                Console.WriteLine($"[STOCK MARKET] Registered stock {symbol} at ${initialPrice:F2}");
            }
        }

        public void Subscribe(string symbol, IStockObserver observer)
        {
            lock (_lockObject)
            {
                if (!_observers.ContainsKey(symbol))
                {
                    throw new InvalidOperationException($"Stock {symbol} is not registered");
                }

                if (observer == null)
                {
                    throw new ArgumentNullException(nameof(observer));
                }

                _observers[symbol].Add(observer);
            }
        }

        public void Unsubscribe(string symbol, IStockObserver observer)
        {
            lock (_lockObject)
            {
                if (_observers.ContainsKey(symbol))
                {
                    _observers[symbol].Remove(observer);
                }
            }
        }

        public void UpdateStockPrice(string symbol, decimal newPrice)
        {
            lock (_lockObject)
            {
                if (!_stocks.ContainsKey(symbol))
                {
                    throw new InvalidOperationException($"Stock {symbol} is not registered");
                }

                Stock stock = _stocks[symbol];
                decimal oldPrice = stock.Price;
                stock.Price = newPrice;

                Console.WriteLine($"[STOCK MARKET] {symbol}: ${oldPrice:F2} → ${newPrice:F2} ({(newPrice > oldPrice ? "+" : "")}{stock.PercentageChange:F2}%)");
            }
        }

        private void NotifyObservers(string symbol, decimal price, DateTime timestamp)
        {
            if (_observers.ContainsKey(symbol))
            {
                List<IStockObserver> observers = _observers[symbol].ToList();
                foreach (IStockObserver observer in observers)
                {
                    try
                    {
                        observer.Update(symbol, price, timestamp);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[STOCK MARKET ERROR] Observer notification failed: {ex.Message}");
                    }
                }
            }
        }

        public Stock GetStock(string symbol)
        {
            lock (_lockObject)
            {
                if (_stocks.TryGetValue(symbol, out Stock stock))
                {
                    return stock;
                }
                throw new InvalidOperationException($"Stock {symbol} is not registered");
            }
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Observer Pattern - Stock Market Monitoring System ===\n");

            try
            {
                StockMarket market = new StockMarket();

                // Register stocks
                market.RegisterStock("AAPL", 150.00m);
                market.RegisterStock("GOOGL", 2800.00m);
                market.RegisterStock("TSLA", 700.00m);

                Console.WriteLine();

                // Create observers
                EmailAlertObserver emailAlert = new EmailAlertObserver("investor@example.com", 160.00m);
                TradingBotObserver tradingBot = new TradingBotObserver(145.00m, 165.00m);
                string logPath = Path.Combine(Path.GetTempPath(), "stock_prices.log");
                FileLoggerObserver fileLogger = new FileLoggerObserver(logPath);

                // Subscribe observers to AAPL
                market.Subscribe("AAPL", emailAlert);
                market.Subscribe("AAPL", tradingBot);
                market.Subscribe("AAPL", fileLogger);

                Console.WriteLine("[STOCK MARKET] Observers subscribed to AAPL\n");

                // Simulate price updates
                market.UpdateStockPrice("AAPL", 148.00m); // Should trigger buy
                await Task.Delay(100);

                market.UpdateStockPrice("AAPL", 155.00m);
                await Task.Delay(100);

                market.UpdateStockPrice("AAPL", 162.00m); // Should trigger email alert
                await Task.Delay(100);

                market.UpdateStockPrice("AAPL", 168.00m); // Should trigger sell
                await Task.Delay(100);

                market.UpdateStockPrice("GOOGL", 2850.00m);
                await Task.Delay(100);

                Console.WriteLine("\n=== Observer Results ===");
                Console.WriteLine($"\nEmail Alerts Sent: {emailAlert.GetSentAlerts().Count}");
                Console.WriteLine($"Trading Bot Trades: {tradingBot.GetTradeHistory().Count}");
                Console.WriteLine($"Trading Bot Holdings: {tradingBot.Holdings} shares");

                List<string> logEntries = await fileLogger.ReadLogEntriesAsync();
                Console.WriteLine($"Log Entries: {logEntries.Count}");
                Console.WriteLine($"Log File: {logPath}");

                Console.WriteLine("\n=== Pattern Demonstration Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }
    }
}
