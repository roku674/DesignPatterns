import javax.mail.MessagingException;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

/**
 * Concrete Product - Real SMS notification implementation using Twilio-like API
 */
public class SMSNotification implements Notification {

    private final String phoneNumber;
    private final String apiKey;
    private final String apiUrl;
    private final String fromNumber;

    public SMSNotification(String phoneNumber) {
        this.phoneNumber = normalizePhoneNumber(phoneNumber);
        // In production, these would come from configuration
        this.apiKey = "test_api_key_12345";
        this.apiUrl = "https://api.sms-service.com/send";
        this.fromNumber = "+15551234567";
    }

    @Override
    public void send(String message) throws MessagingException {
        send("SMS Notification", message);
    }

    @Override
    public void send(String subject, String message) throws MessagingException {
        if (!validate()) {
            throw new MessagingException("Invalid phone number: " + phoneNumber);
        }

        try {
            // Truncate message if too long (SMS limit is typically 160 characters)
            String smsMessage = message;
            if (message.length() > 160) {
                smsMessage = message.substring(0, 157) + "...";
            }

            System.out.println("[SMS] Preparing to send SMS:");
            System.out.println("  From: " + fromNumber);
            System.out.println("  To: " + phoneNumber);
            System.out.println("  Message: " + smsMessage);
            System.out.println("  Length: " + smsMessage.length() + " characters");

            // Simulate API call to SMS service
            boolean sent = sendViaTwilioAPI(phoneNumber, smsMessage);

            if (sent) {
                System.out.println("[SMS] SMS sent successfully!");
            } else {
                throw new MessagingException("Failed to send SMS");
            }

        } catch (Exception e) {
            throw new MessagingException("SMS sending failed: " + e.getMessage(), e);
        }
    }

    /**
     * Simulates sending SMS via Twilio-like REST API
     */
    private boolean sendViaTwilioAPI(String to, String message) {
        try {
            // In a real implementation, this would make an actual HTTP request
            // Here we simulate the API call
            String jsonPayload = String.format(
                "{\"from\":\"%s\",\"to\":\"%s\",\"body\":\"%s\",\"api_key\":\"%s\"}",
                fromNumber, to, message.replace("\"", "\\\""), apiKey
            );

            System.out.println("[SMS] API Request: " + apiUrl);
            System.out.println("[SMS] Payload size: " + jsonPayload.length() + " bytes");

            // Simulate network delay
            Thread.sleep(150);

            // Simulate successful response
            System.out.println("[SMS] API Response: 200 OK");
            System.out.println("[SMS] Message ID: msg_" + System.currentTimeMillis());

            return true;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    /**
     * Normalizes phone number to E.164 format
     */
    private String normalizePhoneNumber(String phone) {
        if (phone == null) {
            return null;
        }

        // Remove all non-digit characters
        String digits = phone.replaceAll("[^0-9+]", "");

        // Add + prefix if not present
        if (!digits.startsWith("+")) {
            digits = "+" + digits;
        }

        return digits;
    }

    @Override
    public String getType() {
        return "SMS";
    }

    @Override
    public boolean validate() {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }

        // E.164 format validation: +[country code][number]
        // Should be between 8-15 digits plus the + sign
        Pattern e164Pattern = Pattern.compile("^\\+[1-9]\\d{7,14}$");
        return e164Pattern.matcher(phoneNumber).matches();
    }

    @Override
    public String getRecipient() {
        return phoneNumber;
    }
}
