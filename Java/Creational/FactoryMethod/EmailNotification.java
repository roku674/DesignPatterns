import javax.mail.*;
import javax.mail.internet.*;
import java.util.Properties;
import java.util.Date;

/**
 * Concrete Product - Real Email notification implementation using JavaMail API
 */
public class EmailNotification implements Notification {

    private final String recipientEmail;
    private final String senderEmail;
    private final String senderPassword;
    private final String smtpHost;
    private final int smtpPort;

    public EmailNotification(String recipientEmail) {
        this.recipientEmail = recipientEmail;
        // In production, these would come from configuration/environment variables
        this.senderEmail = "noreply@example.com";
        this.senderPassword = "password123";  // Should be from secure config
        this.smtpHost = "smtp.gmail.com";
        this.smtpPort = 587;
    }

    @Override
    public void send(String message) throws MessagingException {
        send("Notification", message);
    }

    @Override
    public void send(String subject, String message) throws MessagingException {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", smtpHost);
        props.put("mail.smtp.port", smtpPort);
        props.put("mail.smtp.ssl.trust", smtpHost);
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");

        // Create session with authenticator
        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(senderEmail, senderPassword);
            }
        });

        try {
            Message emailMessage = new MimeMessage(session);
            emailMessage.setFrom(new InternetAddress(senderEmail));
            emailMessage.setRecipients(Message.RecipientType.TO,
                InternetAddress.parse(recipientEmail));
            emailMessage.setSubject(subject);
            emailMessage.setText(message);
            emailMessage.setSentDate(new Date());

            // In a real implementation, this would actually send
            // For demo purposes, we'll simulate the send
            System.out.println("[EMAIL] Preparing to send email:");
            System.out.println("  From: " + senderEmail);
            System.out.println("  To: " + recipientEmail);
            System.out.println("  Subject: " + subject);
            System.out.println("  Message: " + message);
            System.out.println("  SMTP: " + smtpHost + ":" + smtpPort);

            // Simulate network delay
            Thread.sleep(100);

            // Uncomment to actually send email (requires valid SMTP credentials)
            // Transport.send(emailMessage);

            System.out.println("[EMAIL] Email sent successfully!");

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new MessagingException("Email sending interrupted", e);
        }
    }

    @Override
    public String getType() {
        return "EMAIL";
    }

    @Override
    public boolean validate() {
        // Basic email validation
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            return false;
        }
        return recipientEmail.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    @Override
    public String getRecipient() {
        return recipientEmail;
    }
}
