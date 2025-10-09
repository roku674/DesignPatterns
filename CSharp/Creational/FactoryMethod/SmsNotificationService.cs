using System.Text.RegularExpressions;

namespace FactoryMethod;

/// <summary>
/// Production-ready SMS notification service.
/// In production, this would integrate with Twilio, AWS SNS, or similar services.
/// </summary>
public class SmsNotificationService : INotificationService
{
    private readonly string _accountSid;
    private readonly string _authToken;
    private readonly string _fromNumber;
    private int _totalSent;
    private int _totalFailed;
    private DateTime _lastSentTime;
    private readonly object _statsLock = new object();
    private readonly HttpClient _httpClient;

    public SmsNotificationService(string accountSid, string authToken, string fromNumber)
    {
        _accountSid = accountSid ?? throw new ArgumentNullException(nameof(accountSid));
        _authToken = authToken ?? throw new ArgumentNullException(nameof(authToken));
        _fromNumber = fromNumber ?? throw new ArgumentNullException(nameof(fromNumber));
        _totalSent = 0;
        _totalFailed = 0;
        _lastSentTime = DateTime.MinValue;
        _httpClient = new HttpClient();
    }

    public async Task<bool> SendAsync(string recipient, string subject, string message)
    {
        if (!ValidateRecipient(recipient))
        {
            throw new ArgumentException("Invalid phone number", nameof(recipient));
        }

        try
        {
            // In production, this would make actual API calls to SMS service
            // For demonstration, we simulate the operation
            string fullMessage = string.IsNullOrEmpty(subject) ? message : $"{subject}: {message}";

            // Simulate API call delay
            await Task.Delay(100);

            // Simulate SMS sending logic
            bool simulatedSuccess = await SimulateSmsApiCall(recipient, fullMessage);

            if (simulatedSuccess)
            {
                lock (_statsLock)
                {
                    _totalSent++;
                    _lastSentTime = DateTime.Now;
                }

                Console.WriteLine($"[SmsService] Successfully sent SMS to {recipient}");
                Console.WriteLine($"[SmsService] Message length: {fullMessage.Length} characters");
                return true;
            }
            else
            {
                throw new Exception("SMS API returned failure");
            }
        }
        catch (Exception ex)
        {
            lock (_statsLock)
            {
                _totalFailed++;
            }
            Console.WriteLine($"[SmsService] Error sending SMS: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Simulates API call to SMS provider.
    /// In production, this would be replaced with actual Twilio/AWS SNS calls.
    /// </summary>
    private async Task<bool> SimulateSmsApiCall(string phoneNumber, string message)
    {
        // Production implementation would look like:
        /*
        var values = new Dictionary<string, string>
        {
            { "To", phoneNumber },
            { "From", _fromNumber },
            { "Body", message }
        };

        var content = new FormUrlEncodedContent(values);
        var response = await _httpClient.PostAsync(
            $"https://api.twilio.com/2010-04-01/Accounts/{_accountSid}/Messages.json",
            content
        );

        return response.IsSuccessStatusCode;
        */

        await Task.CompletedTask;
        // Simulate 95% success rate
        return new Random().NextDouble() > 0.05;
    }

    public string GetServiceType()
    {
        return "SMS";
    }

    public bool ValidateRecipient(string recipient)
    {
        if (string.IsNullOrWhiteSpace(recipient))
        {
            return false;
        }

        // Validates phone numbers in formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
        string phonePattern = @"^\+?[1-9]\d{1,14}$|^\(\d{3}\)\s?\d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$";
        string normalized = Regex.Replace(recipient, @"[\s\-\(\)]", "");
        return Regex.IsMatch(normalized, @"^\+?[1-9]\d{9,14}$");
    }

    public NotificationStats GetStats()
    {
        lock (_statsLock)
        {
            return new NotificationStats
            {
                TotalSent = _totalSent,
                TotalFailed = _totalFailed,
                LastSentTime = _lastSentTime,
                ServiceType = GetServiceType()
            };
        }
    }
}
