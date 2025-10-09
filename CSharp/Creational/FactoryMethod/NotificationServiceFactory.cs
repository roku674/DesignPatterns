namespace FactoryMethod;

/// <summary>
/// Abstract factory for creating notification services.
/// Defines the factory method that subclasses implement to create specific notification services.
/// </summary>
public abstract class NotificationServiceFactory
{
    /// <summary>
    /// Factory method that subclasses override to produce specific notification services.
    /// </summary>
    public abstract INotificationService CreateService();

    /// <summary>
    /// Business logic that uses the factory method to send notifications.
    /// This demonstrates how the factory method is used in the workflow.
    /// </summary>
    public async Task<bool> SendNotificationAsync(string recipient, string subject, string message)
    {
        INotificationService service = CreateService();

        Console.WriteLine($"[Factory] Created notification service: {service.GetServiceType()}");

        if (!service.ValidateRecipient(recipient))
        {
            Console.WriteLine($"[Factory] Invalid recipient for {service.GetServiceType()}: {recipient}");
            return false;
        }

        bool result = await service.SendAsync(recipient, subject, message);

        NotificationStats stats = service.GetStats();
        Console.WriteLine($"[Factory] Stats - Sent: {stats.TotalSent}, Failed: {stats.TotalFailed}");

        return result;
    }

    /// <summary>
    /// Sends a batch of notifications using the service.
    /// </summary>
    public async Task<BatchNotificationResult> SendBatchAsync(List<NotificationRequest> requests)
    {
        INotificationService service = CreateService();
        Console.WriteLine($"[Factory] Processing batch of {requests.Count} notifications using {service.GetServiceType()}");

        BatchNotificationResult result = new BatchNotificationResult
        {
            ServiceType = service.GetServiceType(),
            TotalRequests = requests.Count
        };

        foreach (NotificationRequest request in requests)
        {
            try
            {
                bool success = await service.SendAsync(request.Recipient, request.Subject, request.Message);
                if (success)
                {
                    result.SuccessCount++;
                }
                else
                {
                    result.FailureCount++;
                }
            }
            catch (Exception ex)
            {
                result.FailureCount++;
                result.Errors.Add($"Error for {request.Recipient}: {ex.Message}");
            }
        }

        return result;
    }
}

/// <summary>
/// Concrete factory for creating Email notification services.
/// </summary>
public class EmailNotificationFactory : NotificationServiceFactory
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _senderEmail;
    private readonly string _senderPassword;

    public EmailNotificationFactory(string smtpHost, int smtpPort, string senderEmail, string senderPassword)
    {
        _smtpHost = smtpHost;
        _smtpPort = smtpPort;
        _senderEmail = senderEmail;
        _senderPassword = senderPassword;
    }

    public override INotificationService CreateService()
    {
        return new EmailNotificationService(_smtpHost, _smtpPort, _senderEmail, _senderPassword);
    }
}

/// <summary>
/// Concrete factory for creating SMS notification services.
/// </summary>
public class SmsNotificationFactory : NotificationServiceFactory
{
    private readonly string _accountSid;
    private readonly string _authToken;
    private readonly string _fromNumber;

    public SmsNotificationFactory(string accountSid, string authToken, string fromNumber)
    {
        _accountSid = accountSid;
        _authToken = authToken;
        _fromNumber = fromNumber;
    }

    public override INotificationService CreateService()
    {
        return new SmsNotificationService(_accountSid, _authToken, _fromNumber);
    }
}

/// <summary>
/// Concrete factory for creating Push notification services.
/// </summary>
public class PushNotificationFactory : NotificationServiceFactory
{
    private readonly string _apiKey;
    private readonly string _projectId;

    public PushNotificationFactory(string apiKey, string projectId)
    {
        _apiKey = apiKey;
        _projectId = projectId;
    }

    public override INotificationService CreateService()
    {
        return new PushNotificationService(_apiKey, _projectId);
    }
}

/// <summary>
/// Represents a notification request.
/// </summary>
public class NotificationRequest
{
    public string Recipient { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Result of batch notification processing.
/// </summary>
public class BatchNotificationResult
{
    public string ServiceType { get; set; } = string.Empty;
    public int TotalRequests { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public List<string> Errors { get; set; } = new List<string>();

    public double SuccessRate => TotalRequests > 0 ? (double)SuccessCount / TotalRequests * 100 : 0;
}
