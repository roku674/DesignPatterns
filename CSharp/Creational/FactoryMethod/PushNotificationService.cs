using System.Text.Json;

namespace FactoryMethod;

/// <summary>
/// Production-ready Push notification service.
/// In production, this would integrate with Firebase Cloud Messaging (FCM), Apple Push Notification Service (APNS), etc.
/// </summary>
public class PushNotificationService : INotificationService
{
    private readonly string _apiKey;
    private readonly string _projectId;
    private int _totalSent;
    private int _totalFailed;
    private DateTime _lastSentTime;
    private readonly object _statsLock = new object();
    private readonly HttpClient _httpClient;

    public PushNotificationService(string apiKey, string projectId)
    {
        _apiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
        _projectId = projectId ?? throw new ArgumentNullException(nameof(projectId));
        _totalSent = 0;
        _totalFailed = 0;
        _lastSentTime = DateTime.MinValue;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"key={_apiKey}");
    }

    public async Task<bool> SendAsync(string recipient, string subject, string message)
    {
        if (!ValidateRecipient(recipient))
        {
            throw new ArgumentException("Invalid device token", nameof(recipient));
        }

        try
        {
            // Create push notification payload
            PushNotificationPayload payload = new PushNotificationPayload
            {
                To = recipient,
                Notification = new NotificationData
                {
                    Title = subject,
                    Body = message,
                    Sound = "default",
                    Badge = 1
                },
                Data = new Dictionary<string, string>
                {
                    { "timestamp", DateTime.UtcNow.ToString("o") },
                    { "priority", "high" }
                }
            };

            // In production, this would make actual API calls to FCM/APNS
            bool success = await SendToFcmAsync(payload);

            if (success)
            {
                lock (_statsLock)
                {
                    _totalSent++;
                    _lastSentTime = DateTime.Now;
                }

                Console.WriteLine($"[PushService] Successfully sent push notification to device");
                Console.WriteLine($"[PushService] Title: {subject}");
                return true;
            }
            else
            {
                throw new Exception("Push notification service returned failure");
            }
        }
        catch (Exception ex)
        {
            lock (_statsLock)
            {
                _totalFailed++;
            }
            Console.WriteLine($"[PushService] Error sending push notification: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Simulates sending to Firebase Cloud Messaging.
    /// In production, this would make actual HTTP POST to FCM endpoint.
    /// </summary>
    private async Task<bool> SendToFcmAsync(PushNotificationPayload payload)
    {
        // Production implementation would look like:
        /*
        string fcmEndpoint = "https://fcm.googleapis.com/fcm/send";
        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(fcmEndpoint, content);
        return response.IsSuccessStatusCode;
        */

        await Task.Delay(50); // Simulate network delay

        // Simulate 97% success rate
        return new Random().NextDouble() > 0.03;
    }

    public string GetServiceType()
    {
        return "Push Notification (FCM)";
    }

    public bool ValidateRecipient(string recipient)
    {
        if (string.IsNullOrWhiteSpace(recipient))
        {
            return false;
        }

        // Device tokens are typically 64+ character hexadecimal strings or base64
        // This is a simplified validation
        return recipient.Length >= 32 && recipient.Length <= 255;
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

/// <summary>
/// Push notification payload structure.
/// </summary>
internal class PushNotificationPayload
{
    public string To { get; set; } = string.Empty;
    public NotificationData Notification { get; set; } = new NotificationData();
    public Dictionary<string, string> Data { get; set; } = new Dictionary<string, string>();
}

/// <summary>
/// Notification data structure.
/// </summary>
internal class NotificationData
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Sound { get; set; } = "default";
    public int Badge { get; set; } = 0;
}
