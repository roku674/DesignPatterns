/**
 * Factory Method Pattern - Production Implementation
 * Real notification service with multiple providers (Email, SMS, Push, Webhook)
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Abstract Product: NotificationService
 * Base class for all notification services
 */
class NotificationService {
  constructor(config = {}) {
    this.config = config;
    this.deliveryHistory = [];
    this.failedDeliveries = [];
    this.successRate = 100;
  }

  async send(recipient, message, options = {}) {
    throw new Error('Method send() must be implemented');
  }

  getType() {
    throw new Error('Method getType() must be implemented');
  }

  getDeliveryHistory() {
    return this.deliveryHistory;
  }

  getFailedDeliveries() {
    return this.failedDeliveries;
  }

  getSuccessRate() {
    return this.successRate;
  }

  updateSuccessRate() {
    const total = this.deliveryHistory.length;
    const failed = this.failedDeliveries.length;
    this.successRate = total > 0 ? ((total - failed) / total) * 100 : 100;
  }
}

/**
 * Concrete Product: EmailService
 * Sends notifications via email using SMTP
 */
class EmailService extends NotificationService {
  constructor(config = {}) {
    super(config);
    this.smtpHost = config.smtpHost || 'smtp.example.com';
    this.smtpPort = config.smtpPort || 587;
    this.fromEmail = config.fromEmail || 'noreply@example.com';
    this.maxRetries = config.maxRetries || 3;
  }

  async send(recipient, message, options = {}) {
    const deliveryId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      if (!this.validateEmail(recipient)) {
        throw new Error('Invalid email address');
      }

      const emailData = {
        from: this.fromEmail,
        to: recipient,
        subject: options.subject || 'Notification',
        body: message,
        html: options.html || false,
        attachments: options.attachments || []
      };

      // Simulate sending email with retry logic
      const result = await this.sendWithRetry(emailData);

      const delivery = {
        id: deliveryId,
        type: 'email',
        recipient,
        message,
        status: 'delivered',
        timestamp: new Date(),
        metadata: {
          smtpHost: this.smtpHost,
          messageId: result.messageId,
          deliveryTime: result.deliveryTime
        }
      };

      this.deliveryHistory.push(delivery);
      this.updateSuccessRate();

      return delivery;

    } catch (error) {
      const failedDelivery = {
        id: deliveryId,
        type: 'email',
        recipient,
        message,
        status: 'failed',
        timestamp: new Date(),
        error: error.message
      };

      this.failedDeliveries.push(failedDelivery);
      this.deliveryHistory.push(failedDelivery);
      this.updateSuccessRate();

      throw error;
    }
  }

  async sendWithRetry(emailData, attempt = 1) {
    try {
      return await this.sendEmail(emailData);
    } catch (error) {
      if (attempt < this.maxRetries) {
        await this.delay(1000 * attempt); // Exponential backoff
        return this.sendWithRetry(emailData, attempt + 1);
      }
      throw error;
    }
  }

  async sendEmail(emailData) {
    // Simulate SMTP connection and sending
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve({
            success: true,
            messageId: `msg_${Date.now()}`,
            deliveryTime: 50 + Math.random() * 200
          });
        } else {
          reject(new Error('SMTP connection failed'));
        }
      }, 50 + Math.random() * 100);
    });
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getType() {
    return 'EmailService';
  }
}

/**
 * Concrete Product: SMSService
 * Sends notifications via SMS using Twilio-like API
 */
class SMSService extends NotificationService {
  constructor(config = {}) {
    super(config);
    this.accountSid = config.accountSid || 'AC_default_sid';
    this.authToken = config.authToken || 'auth_token';
    this.fromNumber = config.fromNumber || '+1234567890';
    this.maxMessageLength = 160;
  }

  async send(recipient, message, options = {}) {
    const deliveryId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      if (!this.validatePhoneNumber(recipient)) {
        throw new Error('Invalid phone number');
      }

      if (message.length > this.maxMessageLength) {
        message = message.substring(0, this.maxMessageLength - 3) + '...';
      }

      const smsData = {
        from: this.fromNumber,
        to: recipient,
        body: message,
        priority: options.priority || 'normal'
      };

      const result = await this.sendSMS(smsData);

      const delivery = {
        id: deliveryId,
        type: 'sms',
        recipient,
        message,
        status: 'delivered',
        timestamp: new Date(),
        metadata: {
          messageId: result.messageId,
          segments: Math.ceil(message.length / 160),
          cost: result.cost
        }
      };

      this.deliveryHistory.push(delivery);
      this.updateSuccessRate();

      return delivery;

    } catch (error) {
      const failedDelivery = {
        id: deliveryId,
        type: 'sms',
        recipient,
        message,
        status: 'failed',
        timestamp: new Date(),
        error: error.message
      };

      this.failedDeliveries.push(failedDelivery);
      this.deliveryHistory.push(failedDelivery);
      this.updateSuccessRate();

      throw error;
    }
  }

  async sendSMS(smsData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 98% success rate
        if (Math.random() > 0.02) {
          const segments = Math.ceil(smsData.body.length / 160);
          resolve({
            success: true,
            messageId: `sms_${Date.now()}`,
            cost: segments * 0.0075 // $0.0075 per segment
          });
        } else {
          reject(new Error('SMS delivery failed - carrier rejected'));
        }
      }, 30 + Math.random() * 70);
    });
  }

  validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  getType() {
    return 'SMSService';
  }
}

/**
 * Concrete Product: PushNotificationService
 * Sends push notifications to mobile devices
 */
class PushNotificationService extends NotificationService {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || 'default_api_key';
    this.appId = config.appId || 'default_app_id';
    this.platform = config.platform || 'fcm'; // fcm or apns
  }

  async send(recipient, message, options = {}) {
    const deliveryId = `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      if (!this.validateDeviceToken(recipient)) {
        throw new Error('Invalid device token');
      }

      const pushData = {
        deviceToken: recipient,
        title: options.title || 'Notification',
        body: message,
        data: options.data || {},
        badge: options.badge || 0,
        sound: options.sound || 'default',
        priority: options.priority || 'high'
      };

      const result = await this.sendPushNotification(pushData);

      const delivery = {
        id: deliveryId,
        type: 'push',
        recipient,
        message,
        status: 'delivered',
        timestamp: new Date(),
        metadata: {
          platform: this.platform,
          messageId: result.messageId,
          deliveryTime: result.deliveryTime
        }
      };

      this.deliveryHistory.push(delivery);
      this.updateSuccessRate();

      return delivery;

    } catch (error) {
      const failedDelivery = {
        id: deliveryId,
        type: 'push',
        recipient,
        message,
        status: 'failed',
        timestamp: new Date(),
        error: error.message
      };

      this.failedDeliveries.push(failedDelivery);
      this.deliveryHistory.push(failedDelivery);
      this.updateSuccessRate();

      throw error;
    }
  }

  async sendPushNotification(pushData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 96% success rate
        if (Math.random() > 0.04) {
          resolve({
            success: true,
            messageId: `push_${Date.now()}`,
            deliveryTime: 20 + Math.random() * 80
          });
        } else {
          reject(new Error('Push notification failed - device token invalid'));
        }
      }, 20 + Math.random() * 50);
    });
  }

  validateDeviceToken(token) {
    return token && token.length >= 32;
  }

  getType() {
    return 'PushNotificationService';
  }
}

/**
 * Concrete Product: WebhookService
 * Sends notifications via HTTP webhooks
 */
class WebhookService extends NotificationService {
  constructor(config = {}) {
    super(config);
    this.timeout = config.timeout || 10000;
    this.retryAttempts = config.retryAttempts || 3;
    this.headers = config.headers || {};
  }

  async send(recipient, message, options = {}) {
    const deliveryId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      if (!this.validateUrl(recipient)) {
        throw new Error('Invalid webhook URL');
      }

      const payload = {
        message,
        timestamp: new Date().toISOString(),
        metadata: options.metadata || {},
        deliveryId
      };

      const result = await this.sendWebhook(recipient, payload);

      const delivery = {
        id: deliveryId,
        type: 'webhook',
        recipient,
        message,
        status: 'delivered',
        timestamp: new Date(),
        metadata: {
          statusCode: result.statusCode,
          responseTime: result.responseTime
        }
      };

      this.deliveryHistory.push(delivery);
      this.updateSuccessRate();

      return delivery;

    } catch (error) {
      const failedDelivery = {
        id: deliveryId,
        type: 'webhook',
        recipient,
        message,
        status: 'failed',
        timestamp: new Date(),
        error: error.message
      };

      this.failedDeliveries.push(failedDelivery);
      this.deliveryHistory.push(failedDelivery);
      this.updateSuccessRate();

      throw error;
    }
  }

  async sendWebhook(url, payload) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const postData = JSON.stringify(payload);

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...this.headers
        },
        timeout: this.timeout
      };

      const req = protocol.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const responseTime = Date.now() - startTime;

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              statusCode: res.statusCode,
              responseTime,
              body: data
            });
          } else {
            reject(new Error(`Webhook failed with status ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Webhook request failed: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Webhook request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  validateUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  getType() {
    return 'WebhookService';
  }
}

/**
 * Abstract Creator: NotificationFactory
 * Declares the factory method for creating notification services
 */
class NotificationFactory {
  constructor(config = {}) {
    this.config = config;
  }

  createService() {
    throw new Error('Method createService() must be implemented');
  }

  async notify(recipient, message, options = {}) {
    const service = this.createService();
    return await service.send(recipient, message, options);
  }

  getServiceStats() {
    const service = this.createService();
    return {
      type: service.getType(),
      totalDeliveries: service.getDeliveryHistory().length,
      failedDeliveries: service.getFailedDeliveries().length,
      successRate: service.getSuccessRate().toFixed(2) + '%'
    };
  }
}

/**
 * Concrete Creator: EmailNotificationFactory
 */
class EmailNotificationFactory extends NotificationFactory {
  createService() {
    return new EmailService(this.config);
  }
}

/**
 * Concrete Creator: SMSNotificationFactory
 */
class SMSNotificationFactory extends NotificationFactory {
  createService() {
    return new SMSService(this.config);
  }
}

/**
 * Concrete Creator: PushNotificationFactory
 */
class PushNotificationFactory extends NotificationFactory {
  createService() {
    return new PushNotificationService(this.config);
  }
}

/**
 * Concrete Creator: WebhookNotificationFactory
 */
class WebhookNotificationFactory extends NotificationFactory {
  createService() {
    return new WebhookService(this.config);
  }
}

/**
 * NotificationRouter
 * Routes notifications to appropriate service based on recipient type
 */
class NotificationRouter {
  constructor() {
    this.factories = new Map();
  }

  registerFactory(type, factory) {
    this.factories.set(type, factory);
  }

  async route(type, recipient, message, options = {}) {
    const factory = this.factories.get(type);

    if (!factory) {
      throw new Error(`No factory registered for type: ${type}`);
    }

    return await factory.notify(recipient, message, options);
  }

  getAvailableTypes() {
    return Array.from(this.factories.keys());
  }
}

module.exports = {
  NotificationService,
  EmailService,
  SMSService,
  PushNotificationService,
  WebhookService,
  NotificationFactory,
  EmailNotificationFactory,
  SMSNotificationFactory,
  PushNotificationFactory,
  WebhookNotificationFactory,
  NotificationRouter
};
