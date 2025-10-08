/**
 * Bridge Pattern - Messaging System Example
 *
 * The Bridge pattern separates abstraction from implementation so that
 * the two can vary independently. It uses composition over inheritance.
 */

// ============= Implementation (Platform) =============

/**
 * Implementation Interface: MessageSender
 * Defines the interface for all concrete implementations
 */
class MessageSender {
  sendMessage(recipient, message) {
    throw new Error('Method sendMessage() must be implemented');
  }

  sendBulkMessage(recipients, message) {
    throw new Error('Method sendBulkMessage() must be implemented');
  }
}

/**
 * Concrete Implementation: EmailSender
 */
class EmailSender extends MessageSender {
  sendMessage(recipient, message) {
    console.log(`[EMAIL] Sending to: ${recipient}`);
    console.log(`[EMAIL] Subject: ${message.subject}`);
    console.log(`[EMAIL] Body: ${message.body}`);
    console.log(`[EMAIL] Attachments: ${message.attachments?.length || 0}`);
    return { sent: true, method: 'email' };
  }

  sendBulkMessage(recipients, message) {
    console.log(`[EMAIL] Sending bulk email to ${recipients.length} recipients`);
    recipients.forEach(recipient => {
      console.log(`  - ${recipient}`);
    });
    console.log(`[EMAIL] Subject: ${message.subject}`);
    return { sent: true, method: 'email', count: recipients.length };
  }
}

/**
 * Concrete Implementation: SMSSender
 */
class SMSSender extends MessageSender {
  sendMessage(recipient, message) {
    console.log(`[SMS] Sending to: ${recipient}`);
    console.log(`[SMS] Message: ${message.text}`);
    console.log(`[SMS] Length: ${message.text.length} characters`);
    return { sent: true, method: 'sms' };
  }

  sendBulkMessage(recipients, message) {
    console.log(`[SMS] Sending bulk SMS to ${recipients.length} recipients`);
    console.log(`[SMS] Message: ${message.text}`);
    return { sent: true, method: 'sms', count: recipients.length };
  }
}

/**
 * Concrete Implementation: SlackSender
 */
class SlackSender extends MessageSender {
  sendMessage(recipient, message) {
    console.log(`[SLACK] Posting to channel: ${recipient}`);
    console.log(`[SLACK] Message: ${message.text}`);
    console.log(`[SLACK] Mentions: ${message.mentions?.join(', ') || 'none'}`);
    return { sent: true, method: 'slack' };
  }

  sendBulkMessage(recipients, message) {
    console.log(`[SLACK] Posting to ${recipients.length} channels`);
    recipients.forEach(channel => {
      console.log(`  - #${channel}`);
    });
    console.log(`[SLACK] Message: ${message.text}`);
    return { sent: true, method: 'slack', count: recipients.length };
  }
}

/**
 * Concrete Implementation: PushNotificationSender
 */
class PushNotificationSender extends MessageSender {
  sendMessage(recipient, message) {
    console.log(`[PUSH] Sending to device: ${recipient}`);
    console.log(`[PUSH] Title: ${message.title}`);
    console.log(`[PUSH] Body: ${message.body}`);
    console.log(`[PUSH] Priority: ${message.priority || 'normal'}`);
    return { sent: true, method: 'push' };
  }

  sendBulkMessage(recipients, message) {
    console.log(`[PUSH] Sending to ${recipients.length} devices`);
    console.log(`[PUSH] Title: ${message.title}`);
    console.log(`[PUSH] Body: ${message.body}`);
    return { sent: true, method: 'push', count: recipients.length };
  }
}

// ============= Abstraction =============

/**
 * Abstraction: Message
 * Defines the abstraction's interface and maintains reference to implementor
 */
class Message {
  constructor(sender) {
    this.sender = sender;
  }

  setSender(sender) {
    this.sender = sender;
  }

  send(recipient, content) {
    throw new Error('Method send() must be implemented');
  }
}

// ============= Refined Abstractions =============

/**
 * Refined Abstraction: ShortMessage
 * Extends the abstraction for short-form messages
 */
class ShortMessage extends Message {
  constructor(sender) {
    super(sender);
  }

  send(recipient, content) {
    console.log('\n--- Sending Short Message ---');

    const message = {
      text: content,
      timestamp: new Date().toISOString()
    };

    return this.sender.sendMessage(recipient, message);
  }

  broadcast(recipients, content) {
    console.log('\n--- Broadcasting Short Message ---');

    const message = {
      text: content,
      timestamp: new Date().toISOString()
    };

    return this.sender.sendBulkMessage(recipients, message);
  }
}

/**
 * Refined Abstraction: DetailedMessage
 * Extends the abstraction for detailed messages
 */
class DetailedMessage extends Message {
  constructor(sender) {
    super(sender);
  }

  send(recipient, content) {
    console.log('\n--- Sending Detailed Message ---');

    const message = {
      subject: content.subject,
      body: content.body,
      attachments: content.attachments || [],
      timestamp: new Date().toISOString(),
      priority: content.priority || 'normal'
    };

    return this.sender.sendMessage(recipient, message);
  }

  broadcast(recipients, content) {
    console.log('\n--- Broadcasting Detailed Message ---');

    const message = {
      subject: content.subject,
      body: content.body,
      attachments: content.attachments || [],
      timestamp: new Date().toISOString()
    };

    return this.sender.sendBulkMessage(recipients, message);
  }
}

/**
 * Refined Abstraction: UrgentMessage
 * Extends the abstraction for urgent notifications
 */
class UrgentMessage extends Message {
  constructor(sender) {
    super(sender);
  }

  send(recipient, content) {
    console.log('\n--- Sending URGENT Message ---');

    const message = {
      title: `🚨 URGENT: ${content.title}`,
      body: content.body,
      text: content.text || `${content.title} - ${content.body}`,
      priority: 'high',
      timestamp: new Date().toISOString()
    };

    return this.sender.sendMessage(recipient, message);
  }

  broadcast(recipients, content) {
    console.log('\n--- Broadcasting URGENT Message ---');

    const message = {
      title: `🚨 URGENT: ${content.title}`,
      body: content.body,
      text: content.text || `${content.title} - ${content.body}`,
      priority: 'high',
      timestamp: new Date().toISOString()
    };

    return this.sender.sendBulkMessage(recipients, message);
  }
}

module.exports = {
  // Implementations
  EmailSender,
  SMSSender,
  SlackSender,
  PushNotificationSender,
  // Abstractions
  ShortMessage,
  DetailedMessage,
  UrgentMessage
};
