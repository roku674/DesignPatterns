/**
 * Bridge Pattern - Demo
 * Demonstrates separating abstraction from implementation
 */

const {
  EmailSender,
  SMSSender,
  SlackSender,
  PushNotificationSender,
  ShortMessage,
  DetailedMessage,
  UrgentMessage
} = require('./messaging-bridge');

console.log('=== Bridge Pattern Demo ===\n');

// Example 1: Short message via different channels
console.log('=== Example 1: Short Messages via Different Channels ===');

const smsShortMessage = new ShortMessage(new SMSSender());
smsShortMessage.send('+1-555-0123', 'Meeting starts in 15 minutes!');

const slackShortMessage = new ShortMessage(new SlackSender());
slackShortMessage.send('general', 'Deployment completed successfully');

// Example 2: Detailed message via different channels
console.log('\n=== Example 2: Detailed Messages via Different Channels ===');

const emailDetailed = new DetailedMessage(new EmailSender());
emailDetailed.send('john.doe@example.com', {
  subject: 'Monthly Report',
  body: 'Please find attached the monthly performance report.',
  attachments: ['report.pdf', 'charts.xlsx']
});

const pushDetailed = new DetailedMessage(new PushNotificationSender());
pushDetailed.send('device-token-12345', {
  subject: 'New Message',
  body: 'You have received a new message from Sarah',
  priority: 'normal'
});

// Example 3: Urgent messages via different channels
console.log('\n=== Example 3: Urgent Messages via Different Channels ===');

const smsUrgent = new UrgentMessage(new SMSSender());
smsUrgent.send('+1-555-0456', {
  title: 'Server Down',
  body: 'Production server is not responding. Immediate action required!'
});

const emailUrgent = new UrgentMessage(new EmailSender());
emailUrgent.send('ops-team@example.com', {
  title: 'Security Alert',
  body: 'Suspicious login attempts detected from unknown location.'
});

const pushUrgent = new UrgentMessage(new PushNotificationSender());
pushUrgent.send('admin-device-789', {
  title: 'Payment Failed',
  body: 'Critical payment processing error. Check logs immediately.'
});

// Example 4: Broadcasting messages
console.log('\n=== Example 4: Broadcasting Messages ===');

const slackBroadcast = new ShortMessage(new SlackSender());
slackBroadcast.broadcast(
  ['general', 'engineering', 'devops'],
  'System maintenance scheduled for tonight at 11 PM'
);

const emailBroadcast = new DetailedMessage(new EmailSender());
emailBroadcast.broadcast(
  ['team@example.com', 'managers@example.com', 'stakeholders@example.com'],
  {
    subject: 'Q4 Results Announcement',
    body: 'We are pleased to announce record-breaking Q4 results...',
    attachments: ['q4-report.pdf']
  }
);

// Example 5: Switching implementations at runtime
console.log('\n=== Example 5: Switching Implementations at Runtime ===');

const message = new ShortMessage(new SMSSender());
message.send('+1-555-0789', 'Testing SMS sender');

console.log('\n--- Switching to Slack ---');
message.setSender(new SlackSender());
message.send('testing', 'Testing Slack sender');

console.log('\n--- Switching to Push Notification ---');
message.setSender(new PushNotificationSender());
message.send('test-device', {
  title: 'Test',
  body: 'Testing push notification sender'
});

// Example 6: Demonstrating independence of abstraction and implementation
console.log('\n=== Example 6: Independence of Dimensions ===\n');

console.log('Abstraction Dimension (Message Types):');
console.log('  - ShortMessage');
console.log('  - DetailedMessage');
console.log('  - UrgentMessage');
console.log('  + Easy to add: ScheduledMessage, EncryptedMessage, etc.\n');

console.log('Implementation Dimension (Channels):');
console.log('  - EmailSender');
console.log('  - SMSSender');
console.log('  - SlackSender');
console.log('  - PushNotificationSender');
console.log('  + Easy to add: TwitterSender, WhatsAppSender, etc.\n');

console.log('Total Combinations: 3 abstractions × 4 implementations = 12 combinations');
console.log('Without Bridge: Would need 12 separate classes!');
console.log('With Bridge: Only need 3 + 4 = 7 classes!\n');

// Example 7: Practical notification system
console.log('=== Example 7: Practical Notification System ===');

class NotificationService {
  constructor() {
    this.channelPreferences = new Map();
  }

  setUserPreference(userId, messageType, channel) {
    if (!this.channelPreferences.has(userId)) {
      this.channelPreferences.set(userId, new Map());
    }
    this.channelPreferences.get(userId).set(messageType, channel);
  }

  notify(userId, messageType, content) {
    const userPrefs = this.channelPreferences.get(userId);
    const channel = userPrefs?.get(messageType) || 'email';

    const sender = this.getSender(channel);
    const message = this.getMessage(messageType, sender);

    return message.send(userId, content);
  }

  getSender(channel) {
    switch (channel) {
      case 'email': return new EmailSender();
      case 'sms': return new SMSSender();
      case 'slack': return new SlackSender();
      case 'push': return new PushNotificationSender();
      default: return new EmailSender();
    }
  }

  getMessage(type, sender) {
    switch (type) {
      case 'short': return new ShortMessage(sender);
      case 'detailed': return new DetailedMessage(sender);
      case 'urgent': return new UrgentMessage(sender);
      default: return new ShortMessage(sender);
    }
  }
}

const notificationService = new NotificationService();

// Set user preferences
notificationService.setUserPreference('user1', 'urgent', 'sms');
notificationService.setUserPreference('user1', 'detailed', 'email');
notificationService.setUserPreference('user2', 'urgent', 'push');

// Send notifications based on preferences
console.log('\n--- User 1 receives urgent message via SMS (preference) ---');
notificationService.notify('user1', 'urgent', {
  title: 'Order Shipped',
  body: 'Your order has been shipped and will arrive tomorrow'
});

console.log('\n--- User 2 receives urgent message via Push (preference) ---');
notificationService.notify('user2', 'urgent', {
  title: 'Order Shipped',
  body: 'Your order has been shipped and will arrive tomorrow'
});

console.log('\n=== Demo Complete ===');
