/**
 * Factory Method Pattern - Production Demo
 * Demonstrates real notification services with Email, SMS, Push, and Webhook
 */

const {
  EmailNotificationFactory,
  SMSNotificationFactory,
  PushNotificationFactory,
  WebhookNotificationFactory,
  NotificationRouter
} = require('./logistics');

async function main() {
  console.log('=== Factory Method Pattern - Production Implementation ===\n');

  // Example 1: Email Notification Service
  console.log('--- Example 1: Email Notification Service ---\n');

  const emailFactory = new EmailNotificationFactory({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    fromEmail: 'notifications@myapp.com',
    maxRetries: 3
  });

  try {
    const result = await emailFactory.notify(
      'user@example.com',
      'Your account has been created successfully. Welcome to our platform!',
      {
        subject: 'Welcome to MyApp',
        html: true
      }
    );

    console.log('Email sent successfully:');
    console.log(`  Delivery ID: ${result.id}`);
    console.log(`  Recipient: ${result.recipient}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Message ID: ${result.metadata.messageId}`);
    console.log(`  Delivery Time: ${result.metadata.deliveryTime.toFixed(2)}ms`);

  } catch (error) {
    console.error('Email failed:', error.message);
  }

  // Example 2: SMS Notification Service
  console.log('\n\n--- Example 2: SMS Notification Service ---\n');

  const smsFactory = new SMSNotificationFactory({
    accountSid: 'AC1234567890abcdef',
    authToken: 'your_auth_token',
    fromNumber: '+15555551234'
  });

  try {
    const result = await smsFactory.notify(
      '+15555555678',
      'Your verification code is: 123456. It expires in 5 minutes.',
      {
        priority: 'high'
      }
    );

    console.log('SMS sent successfully:');
    console.log(`  Delivery ID: ${result.id}`);
    console.log(`  Recipient: ${result.recipient}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Message Segments: ${result.metadata.segments}`);
    console.log(`  Cost: $${result.metadata.cost.toFixed(4)}`);

  } catch (error) {
    console.error('SMS failed:', error.message);
  }

  // Example 3: Push Notification Service
  console.log('\n\n--- Example 3: Push Notification Service ---\n');

  const pushFactory = new PushNotificationFactory({
    apiKey: 'your_fcm_api_key',
    appId: 'com.myapp.mobile',
    platform: 'fcm'
  });

  try {
    const result = await pushFactory.notify(
      'device_token_1234567890abcdef1234567890abcdef',
      'You have a new message from John Doe',
      {
        title: 'New Message',
        badge: 1,
        sound: 'notification.wav',
        data: {
          messageId: '12345',
          senderId: 'user_67890'
        }
      }
    );

    console.log('Push notification sent successfully:');
    console.log(`  Delivery ID: ${result.id}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Platform: ${result.metadata.platform}`);
    console.log(`  Delivery Time: ${result.metadata.deliveryTime.toFixed(2)}ms`);

  } catch (error) {
    console.error('Push notification failed:', error.message);
  }

  // Example 4: Webhook Notification Service
  console.log('\n\n--- Example 4: Webhook Notification Service ---\n');

  const webhookFactory = new WebhookNotificationFactory({
    timeout: 5000,
    retryAttempts: 2,
    headers: {
      'X-API-Key': 'your_api_key',
      'X-App-ID': 'myapp'
    }
  });

  // Note: This will fail because the URL is not real
  console.log('Attempting webhook notification (will demonstrate error handling)...');
  try {
    const result = await webhookFactory.notify(
      'https://api.example.com/webhooks/notifications',
      'Order #12345 has been shipped',
      {
        metadata: {
          orderId: '12345',
          trackingNumber: 'TRK987654321',
          carrier: 'UPS'
        }
      }
    );

    console.log('Webhook sent successfully:');
    console.log(`  Delivery ID: ${result.id}`);
    console.log(`  Status Code: ${result.metadata.statusCode}`);
    console.log(`  Response Time: ${result.metadata.responseTime}ms`);

  } catch (error) {
    console.error('Webhook failed (expected):', error.message);
  }

  // Example 5: Notification Router
  console.log('\n\n--- Example 5: Notification Router (Dynamic Selection) ---\n');

  const router = new NotificationRouter();

  // Register all notification factories
  router.registerFactory('email', emailFactory);
  router.registerFactory('sms', smsFactory);
  router.registerFactory('push', pushFactory);
  router.registerFactory('webhook', webhookFactory);

  console.log('Available notification types:', router.getAvailableTypes());
  console.log();

  // Route notifications dynamically based on user preferences
  const notifications = [
    {
      type: 'email',
      recipient: 'admin@example.com',
      message: 'System alert: High CPU usage detected',
      options: { subject: 'System Alert' }
    },
    {
      type: 'sms',
      recipient: '+15555557890',
      message: 'Your order has been confirmed. Order ID: 67890',
      options: { priority: 'normal' }
    },
    {
      type: 'push',
      recipient: 'device_token_abcdef1234567890abcdef1234567890',
      message: 'Your friend liked your post',
      options: { title: 'New Notification', badge: 3 }
    }
  ];

  console.log('Sending notifications through router...\n');

  for (const notification of notifications) {
    try {
      const result = await router.route(
        notification.type,
        notification.recipient,
        notification.message,
        notification.options
      );

      console.log(`[${notification.type.toUpperCase()}] Delivered to ${notification.recipient.substring(0, 20)}...`);
      console.log(`  Delivery ID: ${result.id}`);
      console.log(`  Status: ${result.status}\n`);

    } catch (error) {
      console.error(`[${notification.type.toUpperCase()}] Failed:`, error.message, '\n');
    }
  }

  // Example 6: Batch Notification with Statistics
  console.log('\n--- Example 6: Batch Notifications & Statistics ---\n');

  const emailService = emailFactory.createService();

  console.log('Sending batch of emails...');

  const recipients = [
    'user1@example.com',
    'user2@example.com',
    'user3@example.com',
    'user4@example.com',
    'user5@example.com',
    'invalid-email', // This will fail
    'user6@example.com',
    'user7@example.com'
  ];

  for (const recipient of recipients) {
    try {
      await emailService.send(
        recipient,
        'This is a test notification from our system',
        { subject: 'Test Notification' }
      );
    } catch (error) {
      // Continue even if one fails
    }
  }

  console.log('\nBatch complete. Statistics:');
  console.log(`  Total attempts: ${emailService.getDeliveryHistory().length}`);
  console.log(`  Successful: ${emailService.getDeliveryHistory().length - emailService.getFailedDeliveries().length}`);
  console.log(`  Failed: ${emailService.getFailedDeliveries().length}`);
  console.log(`  Success rate: ${emailService.getSuccessRate().toFixed(2)}%`);

  if (emailService.getFailedDeliveries().length > 0) {
    console.log('\nFailed deliveries:');
    emailService.getFailedDeliveries().forEach(delivery => {
      console.log(`  - ${delivery.recipient}: ${delivery.error}`);
    });
  }

  // Example 7: Multi-Channel Notification
  console.log('\n\n--- Example 7: Multi-Channel Notification Strategy ---\n');

  async function sendMultiChannelNotification(userId, message, channels = ['email', 'sms', 'push']) {
    console.log(`Sending notification to user ${userId} via ${channels.join(', ')}...`);

    const results = {
      successful: [],
      failed: []
    };

    // User's contact information (in real app, fetch from database)
    const userContacts = {
      email: 'user@example.com',
      sms: '+15555559999',
      push: 'device_token_user_12345678901234567890123456789012'
    };

    for (const channel of channels) {
      try {
        const result = await router.route(
          channel,
          userContacts[channel],
          message,
          { subject: 'Important Notification', title: 'Alert' }
        );

        results.successful.push({
          channel,
          deliveryId: result.id
        });

        console.log(`  [${channel.toUpperCase()}] Success - ${result.id}`);

      } catch (error) {
        results.failed.push({
          channel,
          error: error.message
        });

        console.log(`  [${channel.toUpperCase()}] Failed - ${error.message}`);
      }
    }

    console.log(`\nSummary: ${results.successful.length} successful, ${results.failed.length} failed`);

    return results;
  }

  await sendMultiChannelNotification(
    'user_12345',
    'Your account password was changed. If this was not you, please contact support immediately.',
    ['email', 'sms', 'push']
  );

  // Example 8: Factory Method Pattern Benefits
  console.log('\n\n--- Example 8: Pattern Benefits ---\n');

  console.log('Benefits of Factory Method Pattern:');
  console.log('  1. Loose Coupling: Client code doesn\'t depend on concrete notification classes');
  console.log('  2. Single Responsibility: Each factory creates one type of notification service');
  console.log('  3. Open/Closed: Easy to add new notification types without modifying existing code');
  console.log('  4. Runtime Selection: Can choose notification type based on conditions');
  console.log('  5. Dependency Injection: Factories can be injected for better testing');

  console.log('\n=== Demo Complete ===');
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
