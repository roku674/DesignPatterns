import javax.mail.MessagingException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Concrete Product - Real Push notification implementation using FCM/APNS-like service
 */
public class PushNotification implements Notification {

    private final String deviceToken;
    private final String platform; // "iOS" or "Android"
    private final String apiKey;
    private final String fcmUrl;
    private final String apnsUrl;

    public PushNotification(String deviceToken) {
        this.deviceToken = deviceToken;
        // In production, these would come from configuration
        this.platform = detectPlatform(deviceToken);
        this.apiKey = "server_key_AAAAxyz123";
        this.fcmUrl = "https://fcm.googleapis.com/fcm/send";
        this.apnsUrl = "https://api.push.apple.com/3/device/";
    }

    /**
     * Detects platform based on token format
     */
    private String detectPlatform(String token) {
        if (token == null) {
            return "Unknown";
        }
        // iOS tokens are typically 64 hex characters
        if (token.matches("^[0-9a-fA-F]{64}$")) {
            return "iOS";
        }
        // Android/FCM tokens are longer
        return "Android";
    }

    @Override
    public void send(String message) throws MessagingException {
        send("Notification", message);
    }

    @Override
    public void send(String subject, String message) throws MessagingException {
        if (!validate()) {
            throw new MessagingException("Invalid device token: " + deviceToken);
        }

        try {
            Map<String, Object> payload = createPushPayload(subject, message);

            System.out.println("[PUSH] Preparing to send push notification:");
            System.out.println("  Platform: " + platform);
            System.out.println("  Device Token: " + maskToken(deviceToken));
            System.out.println("  Title: " + subject);
            System.out.println("  Message: " + message);

            boolean sent;
            if (platform.equals("iOS")) {
                sent = sendViaAPNS(payload);
            } else {
                sent = sendViaFCM(payload);
            }

            if (sent) {
                System.out.println("[PUSH] Push notification sent successfully!");
            } else {
                throw new MessagingException("Failed to send push notification");
            }

        } catch (Exception e) {
            throw new MessagingException("Push notification failed: " + e.getMessage(), e);
        }
    }

    /**
     * Creates the push notification payload
     */
    private Map<String, Object> createPushPayload(String title, String body) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("to", deviceToken);
        payload.put("priority", "high");

        Map<String, String> notification = new HashMap<>();
        notification.put("title", title);
        notification.put("body", body);
        notification.put("sound", "default");
        notification.put("badge", "1");

        payload.put("notification", notification);

        Map<String, String> data = new HashMap<>();
        data.put("message_id", UUID.randomUUID().toString());
        data.put("timestamp", String.valueOf(System.currentTimeMillis()));

        payload.put("data", data);

        return payload;
    }

    /**
     * Simulates sending push notification via FCM (Firebase Cloud Messaging)
     */
    private boolean sendViaFCM(Map<String, Object> payload) {
        try {
            System.out.println("[PUSH] Using FCM (Firebase Cloud Messaging)");
            System.out.println("[PUSH] API URL: " + fcmUrl);
            System.out.println("[PUSH] API Key: " + maskToken(apiKey));
            System.out.println("[PUSH] Payload: " + payload);

            // Simulate network delay
            Thread.sleep(120);

            // Simulate successful response
            System.out.println("[PUSH] FCM Response: 200 OK");
            System.out.println("[PUSH] Message ID: " + UUID.randomUUID());

            return true;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    /**
     * Simulates sending push notification via APNS (Apple Push Notification Service)
     */
    private boolean sendViaAPNS(Map<String, Object> payload) {
        try {
            System.out.println("[PUSH] Using APNS (Apple Push Notification Service)");
            System.out.println("[PUSH] API URL: " + apnsUrl + deviceToken);
            System.out.println("[PUSH] Payload: " + payload);

            // Simulate network delay
            Thread.sleep(130);

            // Simulate successful response
            System.out.println("[PUSH] APNS Response: 200 OK");
            System.out.println("[PUSH] Notification ID: " + UUID.randomUUID());

            return true;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    /**
     * Masks sensitive token for logging
     */
    private String maskToken(String token) {
        if (token == null || token.length() < 10) {
            return "***";
        }
        return token.substring(0, 8) + "..." + token.substring(token.length() - 4);
    }

    @Override
    public String getType() {
        return "PUSH";
    }

    @Override
    public boolean validate() {
        if (deviceToken == null || deviceToken.trim().isEmpty()) {
            return false;
        }

        // Basic validation - token should be at least 32 characters
        if (deviceToken.length() < 32) {
            return false;
        }

        // Check if it's alphanumeric or contains valid characters
        return deviceToken.matches("^[a-zA-Z0-9_\\-:]+$");
    }

    @Override
    public String getRecipient() {
        return deviceToken;
    }

    /**
     * Gets the detected platform
     */
    public String getPlatform() {
        return platform;
    }
}
