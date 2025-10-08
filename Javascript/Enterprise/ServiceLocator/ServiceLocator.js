/**
 * Service Locator Pattern
 */

class ServiceLocator {
  constructor() {
    this.services = new Map();
  }

  static getInstance() {
    if (!ServiceLocator.instance) {
      ServiceLocator.instance = new ServiceLocator();
    }
    return ServiceLocator.instance;
  }

  registerService(name, service) {
    this.services.set(name, service);
  }

  getService(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }
}

class EmailService {
  send(to, message) {
    console.log(`   Sending email to ${to}: ${message}`);
  }
}

class DatabaseService {
  query(sql) {
    console.log(`   Executing query: ${sql}`);
    return [];
  }
}

module.exports = {
  ServiceLocator,
  EmailService,
  DatabaseService
};
