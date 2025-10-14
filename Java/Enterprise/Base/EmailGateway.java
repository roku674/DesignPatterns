package Enterprise.Base;

/**
 * Gateway Pattern - Interface
 * Encapsulates access to email service
 */
public interface EmailGateway {
    void sendEmail(String to, String subject, String body);
}
