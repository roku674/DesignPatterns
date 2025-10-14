package Enterprise.Base;

/**
 * Gateway Pattern - Implementation
 * SMTP implementation of email gateway
 */
public class SmtpEmailGateway implements EmailGateway {
    private final String smtpHost;
    private final int smtpPort;

    public SmtpEmailGateway(String smtpHost, int smtpPort) {
        this.smtpHost = smtpHost;
        this.smtpPort = smtpPort;
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        // In real implementation, would connect to SMTP server
        System.out.println("  Sending via " + smtpHost + ":" + smtpPort);
        System.out.println("  To: " + to);
        System.out.println("  Subject: " + subject);
        System.out.println("  Body: " + body);
        System.out.println("  Email sent successfully");
    }
}
