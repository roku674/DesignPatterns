/**
 * Chain of Responsibility Pattern - Customer Support System
 *
 * The Chain of Responsibility pattern lets you pass requests along a chain
 * of handlers. Each handler decides either to process the request or to pass
 * it to the next handler in the chain.
 */

/**
 * Handler: Support Handler
 * Abstract base class for all support handlers
 */
class SupportHandler {
  constructor() {
    this.nextHandler = null;
  }

  setNext(handler) {
    this.nextHandler = handler;
    return handler; // Return handler for chaining
  }

  handle(request) {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }

    return `No handler found for ${request.type} with priority ${request.priority}`;
  }
}

/**
 * Concrete Handler: Level 1 Support (Basic Issues)
 */
class Level1Support extends SupportHandler {
  handle(request) {
    if (request.priority === 'low' && request.type === 'technical') {
      return `[Level 1 Support] Handling ${request.type} issue: "${request.description}"`;
    }

    console.log(`[Level 1 Support] Cannot handle - escalating...`);
    return super.handle(request);
  }
}

/**
 * Concrete Handler: Level 2 Support (Technical Issues)
 */
class Level2Support extends SupportHandler {
  handle(request) {
    if (request.priority === 'medium' && request.type === 'technical') {
      return `[Level 2 Support] Handling ${request.type} issue: "${request.description}"`;
    }

    console.log(`[Level 2 Support] Cannot handle - escalating...`);
    return super.handle(request);
  }
}

/**
 * Concrete Handler: Level 3 Support (Complex Technical)
 */
class Level3Support extends SupportHandler {
  handle(request) {
    if (request.priority === 'high' && request.type === 'technical') {
      return `[Level 3 Support] Handling critical ${request.type} issue: "${request.description}"`;
    }

    console.log(`[Level 3 Support] Cannot handle - escalating...`);
    return super.handle(request);
  }
}

/**
 * Concrete Handler: Billing Department
 */
class BillingSupport extends SupportHandler {
  handle(request) {
    if (request.type === 'billing') {
      return `[Billing Support] Handling billing issue: "${request.description}"`;
    }

    console.log(`[Billing Support] Cannot handle - escalating...`);
    return super.handle(request);
  }
}

/**
 * Concrete Handler: Management (Last Resort)
 */
class ManagementSupport extends SupportHandler {
  handle(request) {
    return `[Management] Handling escalated ${request.priority} priority ${request.type} issue: "${request.description}"`;
  }
}

module.exports = {
  SupportHandler,
  Level1Support,
  Level2Support,
  Level3Support,
  BillingSupport,
  ManagementSupport
};
