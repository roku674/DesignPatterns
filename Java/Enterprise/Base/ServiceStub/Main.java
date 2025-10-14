package Enterprise.Base.ServiceStub;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service Stub Pattern Demonstration
 *
 * Intent: Remove dependence on problematic services during testing
 *
 * Use When:
 * - Real service is unavailable during testing
 * - Service has unpredictable behavior
 * - Service is slow or expensive to call
 * - You need deterministic test results
 * - Testing edge cases is difficult with real service
 *
 * Enterprise Context:
 * Service stubs are essential for testing enterprise applications that depend
 * on external services like payment gateways, email servers, SMS providers,
 * and third-party APIs. Stubs provide predictable, fast responses.
 */
public class Main {

    // ==================== SERVICE INTERFACES ====================

    /**
     * Payment Gateway Service Interface
     */
    interface PaymentGatewayService {
        PaymentResponse charge(PaymentRequest request);
        RefundResponse refund(String transactionId, double amount);
        PaymentStatus getStatus(String transactionId);
        List<Transaction> getTransactionHistory(String accountId);
    }

    /**
     * Email Service Interface
     */
    interface EmailService {
        EmailResponse sendEmail(EmailRequest request);
        boolean verifyEmail(String email);
        EmailStatus getEmailStatus(String messageId);
        int getQuotaRemaining();
    }

    /**
     * SMS Service Interface
     */
    interface SmsService {
        SmsResponse sendSms(String phoneNumber, String message);
        DeliveryStatus checkDelivery(String messageId);
        double getAccountBalance();
    }

    /**
     * Geocoding Service Interface
     */
    interface GeocodingService {
        GeoLocation geocode(String address);
        String reverseGeocode(double latitude, double longitude);
        double calculateDistance(GeoLocation from, GeoLocation to);
    }

    /**
     * Weather Service Interface
     */
    interface WeatherService {
        WeatherData getCurrentWeather(String city);
        List<WeatherForecast> getForecast(String city, int days);
        List<WeatherAlert> getAlerts(String region);
    }

    /**
     * Currency Exchange Service Interface
     */
    interface CurrencyExchangeService {
        ExchangeRate getRate(String fromCurrency, String toCurrency);
        double convert(double amount, String fromCurrency, String toCurrency);
        Map<String, Double> getAllRates(String baseCurrency);
    }

    // ==================== DATA TRANSFER OBJECTS ====================

    static class PaymentRequest {
        private final String accountId;
        private final double amount;
        private final String currency;
        private final String description;

        public PaymentRequest(String accountId, double amount, String currency, String description) {
            this.accountId = accountId;
            this.amount = amount;
            this.currency = currency;
            this.description = description;
        }

        public String getAccountId() { return accountId; }
        public double getAmount() { return amount; }
        public String getCurrency() { return currency; }
        public String getDescription() { return description; }
    }

    static class PaymentResponse {
        private final boolean success;
        private final String transactionId;
        private final String message;
        private final LocalDateTime timestamp;

        public PaymentResponse(boolean success, String transactionId, String message) {
            this.success = success;
            this.transactionId = transactionId;
            this.message = message;
            this.timestamp = LocalDateTime.now();
        }

        public boolean isSuccess() { return success; }
        public String getTransactionId() { return transactionId; }
        public String getMessage() { return message; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }

    static class RefundResponse {
        private final boolean success;
        private final String refundId;
        private final double amount;

        public RefundResponse(boolean success, String refundId, double amount) {
            this.success = success;
            this.refundId = refundId;
            this.amount = amount;
        }

        public boolean isSuccess() { return success; }
        public String getRefundId() { return refundId; }
        public double getAmount() { return amount; }
    }

    enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED, DISPUTED
    }

    static class Transaction {
        private final String id;
        private final double amount;
        private final String type;
        private final LocalDateTime timestamp;

        public Transaction(String id, double amount, String type) {
            this.id = id;
            this.amount = amount;
            this.type = type;
            this.timestamp = LocalDateTime.now();
        }

        public String getId() { return id; }
        public double getAmount() { return amount; }
        public String getType() { return type; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }

    static class EmailRequest {
        private final String to;
        private final String subject;
        private final String body;
        private final List<String> attachments;

        public EmailRequest(String to, String subject, String body) {
            this.to = to;
            this.subject = subject;
            this.body = body;
            this.attachments = new ArrayList<>();
        }

        public String getTo() { return to; }
        public String getSubject() { return subject; }
        public String getBody() { return body; }
        public List<String> getAttachments() { return attachments; }
    }

    static class EmailResponse {
        private final boolean sent;
        private final String messageId;
        private final String status;

        public EmailResponse(boolean sent, String messageId, String status) {
            this.sent = sent;
            this.messageId = messageId;
            this.status = status;
        }

        public boolean isSent() { return sent; }
        public String getMessageId() { return messageId; }
        public String getStatus() { return status; }
    }

    enum EmailStatus {
        QUEUED, SENT, DELIVERED, BOUNCED, FAILED
    }

    static class SmsResponse {
        private final boolean sent;
        private final String messageId;
        private final double cost;

        public SmsResponse(boolean sent, String messageId, double cost) {
            this.sent = sent;
            this.messageId = messageId;
            this.cost = cost;
        }

        public boolean isSent() { return sent; }
        public String getMessageId() { return messageId; }
        public double getCost() { return cost; }
    }

    enum DeliveryStatus {
        PENDING, DELIVERED, FAILED, EXPIRED
    }

    static class GeoLocation {
        private final double latitude;
        private final double longitude;
        private final String formattedAddress;

        public GeoLocation(double latitude, double longitude, String formattedAddress) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.formattedAddress = formattedAddress;
        }

        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
        public String getFormattedAddress() { return formattedAddress; }
    }

    static class WeatherData {
        private final double temperature;
        private final int humidity;
        private final String condition;
        private final double windSpeed;

        public WeatherData(double temperature, int humidity, String condition, double windSpeed) {
            this.temperature = temperature;
            this.humidity = humidity;
            this.condition = condition;
            this.windSpeed = windSpeed;
        }

        public double getTemperature() { return temperature; }
        public int getHumidity() { return humidity; }
        public String getCondition() { return condition; }
        public double getWindSpeed() { return windSpeed; }
    }

    static class WeatherForecast {
        private final LocalDateTime date;
        private final double highTemp;
        private final double lowTemp;
        private final String condition;

        public WeatherForecast(LocalDateTime date, double highTemp, double lowTemp, String condition) {
            this.date = date;
            this.highTemp = highTemp;
            this.lowTemp = lowTemp;
            this.condition = condition;
        }

        public LocalDateTime getDate() { return date; }
        public double getHighTemp() { return highTemp; }
        public double getLowTemp() { return lowTemp; }
        public String getCondition() { return condition; }
    }

    static class WeatherAlert {
        private final String type;
        private final String severity;
        private final String description;

        public WeatherAlert(String type, String severity, String description) {
            this.type = type;
            this.severity = severity;
            this.description = description;
        }

        public String getType() { return type; }
        public String getSeverity() { return severity; }
        public String getDescription() { return description; }
    }

    static class ExchangeRate {
        private final String fromCurrency;
        private final String toCurrency;
        private final double rate;
        private final LocalDateTime timestamp;

        public ExchangeRate(String fromCurrency, String toCurrency, double rate) {
            this.fromCurrency = fromCurrency;
            this.toCurrency = toCurrency;
            this.rate = rate;
            this.timestamp = LocalDateTime.now();
        }

        public String getFromCurrency() { return fromCurrency; }
        public String getToCurrency() { return toCurrency; }
        public double getRate() { return rate; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }

    // ==================== SERVICE STUBS ====================

    /**
     * Payment Gateway Stub - for testing without real payment processing
     */
    static class PaymentGatewayStub implements PaymentGatewayService {
        private final Map<String, Transaction> transactions = new HashMap<>();
        private final AtomicInteger idGenerator = new AtomicInteger(1000);
        private boolean shouldSucceed = true;
        private String failureMessage = "Payment declined";

        public void setShouldSucceed(boolean shouldSucceed) {
            this.shouldSucceed = shouldSucceed;
        }

        public void setFailureMessage(String message) {
            this.failureMessage = message;
        }

        @Override
        public PaymentResponse charge(PaymentRequest request) {
            System.out.println("[STUB] Processing payment for " + request.getAccountId());

            if (!shouldSucceed) {
                return new PaymentResponse(false, null, failureMessage);
            }

            String txnId = "TXN-" + idGenerator.getAndIncrement();
            Transaction transaction = new Transaction(txnId, request.getAmount(), "CHARGE");
            transactions.put(txnId, transaction);

            return new PaymentResponse(true, txnId, "Payment successful");
        }

        @Override
        public RefundResponse refund(String transactionId, double amount) {
            System.out.println("[STUB] Processing refund for " + transactionId);
            String refundId = "REF-" + idGenerator.getAndIncrement();
            return new RefundResponse(shouldSucceed, refundId, amount);
        }

        @Override
        public PaymentStatus getStatus(String transactionId) {
            return transactions.containsKey(transactionId) ?
                PaymentStatus.COMPLETED : PaymentStatus.FAILED;
        }

        @Override
        public List<Transaction> getTransactionHistory(String accountId) {
            return new ArrayList<>(transactions.values());
        }
    }

    /**
     * Email Service Stub - for testing without sending real emails
     */
    static class EmailServiceStub implements EmailService {
        private final List<EmailRequest> sentEmails = new ArrayList<>();
        private final AtomicInteger idGenerator = new AtomicInteger(5000);
        private int quotaRemaining = 1000;
        private boolean shouldSucceed = true;

        public void setShouldSucceed(boolean shouldSucceed) {
            this.shouldSucceed = shouldSucceed;
        }

        public List<EmailRequest> getSentEmails() {
            return new ArrayList<>(sentEmails);
        }

        @Override
        public EmailResponse sendEmail(EmailRequest request) {
            System.out.println("[STUB] Sending email to " + request.getTo() + ": " + request.getSubject());

            if (!shouldSucceed) {
                return new EmailResponse(false, null, "Failed to send");
            }

            sentEmails.add(request);
            quotaRemaining--;
            String messageId = "MSG-" + idGenerator.getAndIncrement();
            return new EmailResponse(true, messageId, "Sent");
        }

        @Override
        public boolean verifyEmail(String email) {
            System.out.println("[STUB] Verifying email: " + email);
            return email.contains("@") && email.contains(".");
        }

        @Override
        public EmailStatus getEmailStatus(String messageId) {
            return EmailStatus.DELIVERED;
        }

        @Override
        public int getQuotaRemaining() {
            return quotaRemaining;
        }
    }

    /**
     * SMS Service Stub - for testing without sending real SMS
     */
    static class SmsServiceStub implements SmsService {
        private final Map<String, DeliveryStatus> messages = new HashMap<>();
        private final AtomicInteger idGenerator = new AtomicInteger(7000);
        private double accountBalance = 100.0;

        @Override
        public SmsResponse sendSms(String phoneNumber, String message) {
            System.out.println("[STUB] Sending SMS to " + phoneNumber);
            String messageId = "SMS-" + idGenerator.getAndIncrement();
            messages.put(messageId, DeliveryStatus.DELIVERED);
            accountBalance -= 0.05; // Simulated cost
            return new SmsResponse(true, messageId, 0.05);
        }

        @Override
        public DeliveryStatus checkDelivery(String messageId) {
            return messages.getOrDefault(messageId, DeliveryStatus.FAILED);
        }

        @Override
        public double getAccountBalance() {
            return accountBalance;
        }
    }

    /**
     * Geocoding Service Stub - for testing without real API calls
     */
    static class GeocodingServiceStub implements GeocodingService {
        private final Map<String, GeoLocation> knownLocations = new HashMap<>();

        public GeocodingServiceStub() {
            // Pre-populate with test data
            knownLocations.put("New York", new GeoLocation(40.7128, -74.0060, "New York, NY, USA"));
            knownLocations.put("London", new GeoLocation(51.5074, -0.1278, "London, UK"));
            knownLocations.put("Tokyo", new GeoLocation(35.6762, 139.6503, "Tokyo, Japan"));
        }

        @Override
        public GeoLocation geocode(String address) {
            System.out.println("[STUB] Geocoding address: " + address);
            return knownLocations.getOrDefault(address,
                new GeoLocation(0.0, 0.0, "Unknown location"));
        }

        @Override
        public String reverseGeocode(double latitude, double longitude) {
            System.out.println("[STUB] Reverse geocoding: " + latitude + ", " + longitude);
            return "Approximate address for coordinates";
        }

        @Override
        public double calculateDistance(GeoLocation from, GeoLocation to) {
            System.out.println("[STUB] Calculating distance");
            // Simplified calculation
            double latDiff = Math.abs(from.getLatitude() - to.getLatitude());
            double lonDiff = Math.abs(from.getLongitude() - to.getLongitude());
            return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; // Rough km conversion
        }
    }

    /**
     * Weather Service Stub - for testing without real weather API
     */
    static class WeatherServiceStub implements WeatherService {
        @Override
        public WeatherData getCurrentWeather(String city) {
            System.out.println("[STUB] Getting weather for " + city);
            return new WeatherData(22.5, 65, "Partly Cloudy", 15.5);
        }

        @Override
        public List<WeatherForecast> getForecast(String city, int days) {
            System.out.println("[STUB] Getting " + days + " day forecast for " + city);
            List<WeatherForecast> forecast = new ArrayList<>();
            for (int i = 1; i <= days; i++) {
                forecast.add(new WeatherForecast(
                    LocalDateTime.now().plusDays(i),
                    25.0 + i,
                    15.0 + i,
                    "Sunny"
                ));
            }
            return forecast;
        }

        @Override
        public List<WeatherAlert> getAlerts(String region) {
            System.out.println("[STUB] Getting alerts for " + region);
            return new ArrayList<>(); // No alerts in stub
        }
    }

    /**
     * Currency Exchange Service Stub - for testing without real exchange rates
     */
    static class CurrencyExchangeServiceStub implements CurrencyExchangeService {
        private final Map<String, Double> rates = new HashMap<>();

        public CurrencyExchangeServiceStub() {
            // Pre-populate with fixed rates for testing
            rates.put("USD-EUR", 0.85);
            rates.put("USD-GBP", 0.73);
            rates.put("USD-JPY", 110.0);
            rates.put("EUR-USD", 1.18);
            rates.put("GBP-USD", 1.37);
        }

        @Override
        public ExchangeRate getRate(String fromCurrency, String toCurrency) {
            System.out.println("[STUB] Getting rate: " + fromCurrency + " to " + toCurrency);
            String key = fromCurrency + "-" + toCurrency;
            double rate = rates.getOrDefault(key, 1.0);
            return new ExchangeRate(fromCurrency, toCurrency, rate);
        }

        @Override
        public double convert(double amount, String fromCurrency, String toCurrency) {
            System.out.println("[STUB] Converting " + amount + " " + fromCurrency + " to " + toCurrency);
            ExchangeRate rate = getRate(fromCurrency, toCurrency);
            return amount * rate.getRate();
        }

        @Override
        public Map<String, Double> getAllRates(String baseCurrency) {
            System.out.println("[STUB] Getting all rates for " + baseCurrency);
            Map<String, Double> result = new HashMap<>();
            for (Map.Entry<String, Double> entry : rates.entrySet()) {
                if (entry.getKey().startsWith(baseCurrency + "-")) {
                    String targetCurrency = entry.getKey().split("-")[1];
                    result.put(targetCurrency, entry.getValue());
                }
            }
            return result;
        }
    }

    // ==================== MAIN DEMONSTRATION ====================

    public static void main(String[] args) {
        System.out.println("=== Service Stub Pattern Demo ===\n");

        // Scenario 1: Payment Processing - Success
        System.out.println("--- Scenario 1: Successful Payment ---");
        PaymentGatewayStub paymentStub = new PaymentGatewayStub();
        PaymentRequest payment1 = new PaymentRequest("ACC-001", 99.99, "USD", "Product purchase");
        PaymentResponse response1 = paymentStub.charge(payment1);
        System.out.println("Success: " + response1.isSuccess());
        System.out.println("Transaction: " + response1.getTransactionId());
        System.out.println("Message: " + response1.getMessage());

        // Scenario 2: Payment Processing - Failure
        System.out.println("\n--- Scenario 2: Failed Payment ---");
        paymentStub.setShouldSucceed(false);
        paymentStub.setFailureMessage("Insufficient funds");
        PaymentRequest payment2 = new PaymentRequest("ACC-002", 299.99, "USD", "Order #12345");
        PaymentResponse response2 = paymentStub.charge(payment2);
        System.out.println("Success: " + response2.isSuccess());
        System.out.println("Message: " + response2.getMessage());

        // Scenario 3: Payment Refund
        System.out.println("\n--- Scenario 3: Payment Refund ---");
        paymentStub.setShouldSucceed(true);
        RefundResponse refund = paymentStub.refund(response1.getTransactionId(), 50.00);
        System.out.println("Refund success: " + refund.isSuccess());
        System.out.println("Refund ID: " + refund.getRefundId());
        System.out.println("Refund amount: $" + refund.getAmount());

        // Scenario 4: Transaction History
        System.out.println("\n--- Scenario 4: Transaction History ---");
        List<Transaction> history = paymentStub.getTransactionHistory("ACC-001");
        System.out.println("Total transactions: " + history.size());
        for (Transaction txn : history) {
            System.out.println("  " + txn.getId() + ": $" + txn.getAmount() + " - " + txn.getType());
        }

        // Scenario 5: Email Service
        System.out.println("\n--- Scenario 5: Email Service ---");
        EmailServiceStub emailStub = new EmailServiceStub();
        EmailRequest email1 = new EmailRequest("user@example.com", "Welcome", "Welcome to our service!");
        EmailResponse emailResponse = emailStub.sendEmail(email1);
        System.out.println("Email sent: " + emailResponse.isSent());
        System.out.println("Message ID: " + emailResponse.getMessageId());
        System.out.println("Quota remaining: " + emailStub.getQuotaRemaining());

        // Scenario 6: Email Verification
        System.out.println("\n--- Scenario 6: Email Verification ---");
        boolean valid1 = emailStub.verifyEmail("test@example.com");
        boolean valid2 = emailStub.verifyEmail("invalid-email");
        System.out.println("test@example.com valid: " + valid1);
        System.out.println("invalid-email valid: " + valid2);

        // Scenario 7: SMS Service
        System.out.println("\n--- Scenario 7: SMS Service ---");
        SmsServiceStub smsStub = new SmsServiceStub();
        System.out.println("Initial balance: $" + smsStub.getAccountBalance());

        SmsResponse sms1 = smsStub.sendSms("+1234567890", "Your verification code is 123456");
        System.out.println("SMS sent: " + sms1.isSent());
        System.out.println("Cost: $" + sms1.getCost());
        System.out.println("Remaining balance: $" + smsStub.getAccountBalance());

        DeliveryStatus smsStatus = smsStub.checkDelivery(sms1.getMessageId());
        System.out.println("Delivery status: " + smsStatus);

        // Scenario 8: Geocoding Service
        System.out.println("\n--- Scenario 8: Geocoding ---");
        GeocodingServiceStub geoStub = new GeocodingServiceStub();
        GeoLocation nyLocation = geoStub.geocode("New York");
        System.out.println("New York coordinates: " + nyLocation.getLatitude() + ", " + nyLocation.getLongitude());
        System.out.println("Formatted: " + nyLocation.getFormattedAddress());

        GeoLocation londonLocation = geoStub.geocode("London");
        double distance = geoStub.calculateDistance(nyLocation, londonLocation);
        System.out.println("Distance NY to London: " + String.format("%.2f", distance) + " km");

        // Scenario 9: Reverse Geocoding
        System.out.println("\n--- Scenario 9: Reverse Geocoding ---");
        String address = geoStub.reverseGeocode(40.7128, -74.0060);
        System.out.println("Address at coordinates: " + address);

        // Scenario 10: Weather Service
        System.out.println("\n--- Scenario 10: Weather Service ---");
        WeatherServiceStub weatherStub = new WeatherServiceStub();
        WeatherData weather = weatherStub.getCurrentWeather("New York");
        System.out.println("Temperature: " + weather.getTemperature() + "°C");
        System.out.println("Humidity: " + weather.getHumidity() + "%");
        System.out.println("Condition: " + weather.getCondition());
        System.out.println("Wind speed: " + weather.getWindSpeed() + " km/h");

        // Scenario 11: Weather Forecast
        System.out.println("\n--- Scenario 11: Weather Forecast ---");
        List<WeatherForecast> forecast = weatherStub.getForecast("London", 5);
        System.out.println("5-day forecast:");
        for (WeatherForecast day : forecast) {
            System.out.println("  " + day.getDate().toLocalDate() +
                             ": " + day.getLowTemp() + "-" + day.getHighTemp() +
                             "°C, " + day.getCondition());
        }

        // Scenario 12: Currency Exchange
        System.out.println("\n--- Scenario 12: Currency Exchange ---");
        CurrencyExchangeServiceStub currencyStub = new CurrencyExchangeServiceStub();
        ExchangeRate usdToEur = currencyStub.getRate("USD", "EUR");
        System.out.println("USD to EUR rate: " + usdToEur.getRate());

        double converted = currencyStub.convert(100.0, "USD", "EUR");
        System.out.println("100 USD = " + converted + " EUR");

        Map<String, Double> allRates = currencyStub.getAllRates("USD");
        System.out.println("All USD rates: " + allRates);

        // Summary
        System.out.println("\n--- Summary ---");
        System.out.println("Emails sent: " + emailStub.getSentEmails().size());
        System.out.println("Payments processed: " + paymentStub.getTransactionHistory("").size());
        System.out.println("SMS balance: $" + smsStub.getAccountBalance());

        System.out.println("\n=== Benefits of Service Stub ===");
        System.out.println("1. Fast, predictable testing without external dependencies");
        System.out.println("2. No costs for third-party API calls during testing");
        System.out.println("3. Easy to simulate edge cases and failures");
        System.out.println("4. Enables offline development");
        System.out.println("5. Consistent test results regardless of external service state");

        System.out.println("\nPattern demonstration complete.");
    }
}
