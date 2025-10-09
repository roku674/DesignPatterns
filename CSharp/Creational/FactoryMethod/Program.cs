namespace FactoryMethod;

/// <summary>
/// Demonstrates the Factory Method pattern with real notification service implementations.
/// Shows both educational logistics example and production-ready notification services.
/// </summary>
public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== Factory Method Pattern Demo ===");
        Console.WriteLine("Production-Ready Notification Service Factory\n");

        await DemoNotificationServices();

        Console.WriteLine("\n" + new string('=', 70));
        Console.WriteLine("\n=== Logistics Demo (Educational) ===\n");

        DemoLogistics();
    }

    /// <summary>
    /// Demonstrates real notification service factories.
    /// </summary>
    private static async Task DemoNotificationServices()
    {
        // Example 1: Email Notification Factory
        Console.WriteLine("--- Example 1: Email Notification Service ---");
        NotificationServiceFactory emailFactory = new EmailNotificationFactory(
            smtpHost: "smtp.gmail.com",
            smtpPort: 587,
            senderEmail: "notifications@example.com",
            senderPassword: "app-specific-password"
        );

        bool emailResult = await emailFactory.SendNotificationAsync(
            recipient: "user@example.com",
            subject: "Welcome to Our Service",
            message: "Thank you for signing up! We're excited to have you on board."
        );

        Console.WriteLine($"Email sent: {emailResult}\n");

        // Example 2: SMS Notification Factory
        Console.WriteLine("--- Example 2: SMS Notification Service ---");
        NotificationServiceFactory smsFactory = new SmsNotificationFactory(
            accountSid: "AC1234567890abcdef",
            authToken: "your_auth_token",
            fromNumber: "+11234567890"
        );

        bool smsResult = await smsFactory.SendNotificationAsync(
            recipient: "+19876543210",
            subject: "Verification Code",
            message: "Your verification code is: 123456"
        );

        Console.WriteLine($"SMS sent: {smsResult}\n");

        // Example 3: Push Notification Factory
        Console.WriteLine("--- Example 3: Push Notification Service ---");
        NotificationServiceFactory pushFactory = new PushNotificationFactory(
            apiKey: "AIzaSyB1234567890abcdefghijklmnopqrstuvw",
            projectId: "my-app-project"
        );

        bool pushResult = await pushFactory.SendNotificationAsync(
            recipient: "device_token_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
            subject: "New Message",
            message: "You have a new message from Alex"
        );

        Console.WriteLine($"Push notification sent: {pushResult}\n");

        // Example 4: Batch Notifications
        Console.WriteLine("--- Example 4: Batch Email Notifications ---");
        List<NotificationRequest> batchRequests = new List<NotificationRequest>
        {
            new NotificationRequest
            {
                Recipient = "alice@example.com",
                Subject = "Monthly Newsletter",
                Message = "Check out our latest updates..."
            },
            new NotificationRequest
            {
                Recipient = "bob@example.com",
                Subject = "Monthly Newsletter",
                Message = "Check out our latest updates..."
            },
            new NotificationRequest
            {
                Recipient = "charlie@example.com",
                Subject = "Monthly Newsletter",
                Message = "Check out our latest updates..."
            }
        };

        BatchNotificationResult batchResult = await emailFactory.SendBatchAsync(batchRequests);
        Console.WriteLine($"Batch Results: {batchResult.SuccessCount}/{batchResult.TotalRequests} sent successfully");
        Console.WriteLine($"Success Rate: {batchResult.SuccessRate:F2}%");

        if (batchResult.Errors.Any())
        {
            Console.WriteLine("Errors:");
            foreach (string error in batchResult.Errors)
            {
                Console.WriteLine($"  - {error}");
            }
        }

        // Example 5: Polymorphic usage - choosing factory at runtime
        Console.WriteLine("\n--- Example 5: Runtime Factory Selection ---");
        string notificationType = "sms"; // Could come from config or user preference
        NotificationServiceFactory factory = CreateNotificationFactory(notificationType);

        if (factory != null)
        {
            await factory.SendNotificationAsync(
                recipient: notificationType == "email" ? "runtime@example.com" : "+15551234567",
                subject: "Runtime Selection Test",
                message: "This notification type was selected at runtime!"
            );
        }

        // Example 6: Direct service usage (without factory abstraction)
        Console.WriteLine("\n--- Example 6: Direct Service Instantiation ---");
        INotificationService directService = new SmsNotificationService(
            accountSid: "AC1234567890",
            authToken: "token",
            fromNumber: "+11234567890"
        );

        Console.WriteLine($"Service Type: {directService.GetServiceType()}");
        bool isValidPhone = directService.ValidateRecipient("+15551234567");
        Console.WriteLine($"Valid phone number: {isValidPhone}");

        await directService.SendAsync("+15551234567", "Direct Call", "Testing direct service usage");
        NotificationStats stats = directService.GetStats();
        Console.WriteLine($"Stats - Sent: {stats.TotalSent}, Failed: {stats.TotalFailed}");
    }

    /// <summary>
    /// Creates a notification factory based on type string.
    /// Demonstrates runtime factory selection.
    /// </summary>
    private static NotificationServiceFactory? CreateNotificationFactory(string type)
    {
        return type.ToLower() switch
        {
            "email" => new EmailNotificationFactory("smtp.gmail.com", 587, "sender@example.com", "password"),
            "sms" => new SmsNotificationFactory("AC123", "token", "+11234567890"),
            "push" => new PushNotificationFactory("apikey", "projectid"),
            _ => null
        };
    }

    /// <summary>
    /// Demonstrates the logistics example (educational).
    /// </summary>
    private static void DemoLogistics()
    {
        Console.WriteLine("Client: Using Road Logistics");
        ClientCode(new RoadLogistics());
        Console.WriteLine();

        Console.WriteLine("Client: Using Sea Logistics");
        ClientCode(new SeaLogistics());
        Console.WriteLine();

        Console.WriteLine("Client: Using Air Logistics");
        ClientCode(new AirLogistics());
    }

    /// <summary>
    /// The client code works with an instance of a concrete creator through its base interface.
    /// </summary>
    private static void ClientCode(LogisticsCreator creator)
    {
        Console.WriteLine($"Client: I'm not aware of the creator's class, but it still works.\n{creator.PlanDelivery()}");
    }
}
