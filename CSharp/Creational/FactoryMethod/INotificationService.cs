namespace FactoryMethod;

/// <summary>
/// Interface for notification services.
/// Defines contract for sending notifications through various channels.
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Sends a notification message asynchronously.
    /// </summary>
    Task<bool> SendAsync(string recipient, string subject, string message);

    /// <summary>
    /// Gets the service name/type.
    /// </summary>
    string GetServiceType();

    /// <summary>
    /// Validates if the recipient address is valid for this service.
    /// </summary>
    bool ValidateRecipient(string recipient);

    /// <summary>
    /// Gets service statistics.
    /// </summary>
    NotificationStats GetStats();
}

/// <summary>
/// Statistics for notification service.
/// </summary>
public class NotificationStats
{
    public int TotalSent { get; set; }
    public int TotalFailed { get; set; }
    public DateTime LastSentTime { get; set; }
    public string ServiceType { get; set; } = string.Empty;
}
