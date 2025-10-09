using System.Net;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace FactoryMethod;

/// <summary>
/// Production-ready Email notification service using SMTP.
/// Implements real email sending functionality with proper error handling.
/// </summary>
public class EmailNotificationService : INotificationService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _senderEmail;
    private readonly string _senderPassword;
    private readonly bool _enableSsl;
    private int _totalSent;
    private int _totalFailed;
    private DateTime _lastSentTime;
    private readonly object _statsLock = new object();

    public EmailNotificationService(string smtpHost, int smtpPort, string senderEmail, string senderPassword, bool enableSsl = true)
    {
        _smtpHost = smtpHost ?? throw new ArgumentNullException(nameof(smtpHost));
        _smtpPort = smtpPort;
        _senderEmail = senderEmail ?? throw new ArgumentNullException(nameof(senderEmail));
        _senderPassword = senderPassword ?? throw new ArgumentNullException(nameof(senderPassword));
        _enableSsl = enableSsl;
        _totalSent = 0;
        _totalFailed = 0;
        _lastSentTime = DateTime.MinValue;
    }

    public async Task<bool> SendAsync(string recipient, string subject, string message)
    {
        if (!ValidateRecipient(recipient))
        {
            throw new ArgumentException("Invalid email address", nameof(recipient));
        }

        try
        {
            using (SmtpClient smtpClient = new SmtpClient(_smtpHost, _smtpPort))
            {
                smtpClient.EnableSsl = _enableSsl;
                smtpClient.Credentials = new NetworkCredential(_senderEmail, _senderPassword);
                smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
                smtpClient.Timeout = 30000; // 30 seconds

                using (MailMessage mailMessage = new MailMessage())
                {
                    mailMessage.From = new MailAddress(_senderEmail);
                    mailMessage.To.Add(recipient);
                    mailMessage.Subject = subject;
                    mailMessage.Body = message;
                    mailMessage.IsBodyHtml = false;

                    await smtpClient.SendMailAsync(mailMessage);
                }
            }

            lock (_statsLock)
            {
                _totalSent++;
                _lastSentTime = DateTime.Now;
            }

            Console.WriteLine($"[EmailService] Successfully sent email to {recipient}");
            return true;
        }
        catch (SmtpException ex)
        {
            lock (_statsLock)
            {
                _totalFailed++;
            }
            Console.WriteLine($"[EmailService] SMTP error: {ex.Message}");
            return false;
        }
        catch (Exception ex)
        {
            lock (_statsLock)
            {
                _totalFailed++;
            }
            Console.WriteLine($"[EmailService] Error sending email: {ex.Message}");
            return false;
        }
    }

    public string GetServiceType()
    {
        return "Email (SMTP)";
    }

    public bool ValidateRecipient(string recipient)
    {
        if (string.IsNullOrWhiteSpace(recipient))
        {
            return false;
        }

        string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        return Regex.IsMatch(recipient, emailPattern);
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
