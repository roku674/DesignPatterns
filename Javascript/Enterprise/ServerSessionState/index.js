/**
 * Server Session State Pattern Implementation
 *
 * The Server Session State pattern stores session state on the server side,
 * typically in server memory, Redis, or a dedicated session store. This provides
 * better security and allows for stateful server architecture.
 *
 * Key Components:
 * - SessionManager: Manages session lifecycle
 * - SessionStore: Persists session data
 * - SessionSerializer: Converts session data
 *
 * Use Cases:
 * 1. User authentication and authorization state
 * 2. Shopping cart with sensitive pricing
 * 3. Multi-user collaborative editing
 * 4. Workflow state management
 * 5. Gaming server sessions
 * 6. Video streaming sessions
 * 7. Chat application state
 * 8. Admin dashboards with complex state
 * 9. Financial transaction sessions
 * 10. Healthcare application sessions (HIPAA compliant)
 */

const crypto = require('crypto');
const EventEmitter = require('events');

// ============================================================================
// Core Pattern Implementation
// ============================================================================

/**
 * Server-side session manager
 */
class ServerSessionManager extends EventEmitter {
  constructor(store, options = {}) {
    super();
    this.store = store;
    this.sessionTimeout = options.sessionTimeout || 1800000; // 30 minutes default
    this.cleanupInterval = options.cleanupInterval || 300000; // 5 minutes
    this.sessions = new Map();

    this.startCleanup();
  }

  /**
   * Create new session
   */
  createSession(userId, initialData = {}) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      userId: userId,
      data: initialData,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      expiresAt: Date.now() + this.sessionTimeout
    };

    this.sessions.set(sessionId, session);
    this.store.save(sessionId, session);
    this.emit('sessionCreated', session);

    return sessionId;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = this.store.load(sessionId);
      if (session) {
        this.sessions.set(sessionId, session);
      }
    }

    if (session && this.isSessionValid(session)) {
      this.touchSession(session);
      return session;
    }

    if (session) {
      this.destroySession(sessionId);
    }

    return null;
  }

  /**
   * Update session data
   */
  updateSession(sessionId, data) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.data = { ...session.data, ...data };
    session.lastAccessedAt = Date.now();

    this.store.save(sessionId, session);
    this.emit('sessionUpdated', session);
  }

  /**
   * Destroy session
   */
  destroySession(sessionId) {
    const session = this.sessions.get(sessionId);
    this.sessions.delete(sessionId);
    this.store.delete(sessionId);

    if (session) {
      this.emit('sessionDestroyed', session);
    }
  }

  /**
   * Touch session (update last accessed time)
   */
  touchSession(session) {
    session.lastAccessedAt = Date.now();
    session.expiresAt = Date.now() + this.sessionTimeout;
    this.store.save(session.id, session);
  }

  /**
   * Check if session is valid
   */
  isSessionValid(session) {
    return Date.now() < session.expiresAt;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Start cleanup interval
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.cleanupInterval);
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    const expiredSessions = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach(sessionId => {
      this.destroySession(sessionId);
    });

    this.emit('cleanupCompleted', expiredSessions.length);
  }

  /**
   * Stop cleanup interval
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  /**
   * Get active session count
   */
  getActiveSessionCount() {
    return this.sessions.size;
  }
}

/**
 * In-memory session store
 */
class MemorySessionStore {
  constructor() {
    this.sessions = new Map();
  }

  save(sessionId, session) {
    this.sessions.set(sessionId, JSON.parse(JSON.stringify(session)));
  }

  load(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? JSON.parse(JSON.stringify(session)) : null;
  }

  delete(sessionId) {
    this.sessions.delete(sessionId);
  }

  clear() {
    this.sessions.clear();
  }
}

/**
 * Redis-like session store simulation
 */
class RedisSessionStore {
  constructor() {
    this.data = new Map();
  }

  save(sessionId, session) {
    const serialized = JSON.stringify(session);
    this.data.set(sessionId, serialized);
  }

  load(sessionId) {
    const serialized = this.data.get(sessionId);
    return serialized ? JSON.parse(serialized) : null;
  }

  delete(sessionId) {
    this.data.delete(sessionId);
  }

  exists(sessionId) {
    return this.data.has(sessionId);
  }

  getAllKeys() {
    return Array.from(this.data.keys());
  }
}

// ============================================================================
// Scenario 1: E-Commerce Session with Pricing
// ============================================================================

class ECommerceSessionManager extends ServerSessionManager {
  addToCart(sessionId, product, quantity = 1) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.data.cart) {
      session.data.cart = { items: [] };
    }

    const existingItem = session.data.cart.items.find(item => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      session.data.cart.items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        addedAt: Date.now()
      });
    }

    this.updateSession(sessionId, session.data);
  }

  getCart(sessionId) {
    const session = this.getSession(sessionId);
    return session?.data?.cart || { items: [] };
  }

  calculateTotal(sessionId) {
    const cart = this.getCart(sessionId);
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  applyDiscount(sessionId, discountCode, discountAmount) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.data.discount = {
      code: discountCode,
      amount: discountAmount,
      appliedAt: Date.now()
    };

    this.updateSession(sessionId, session.data);
  }

  checkout(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const cart = this.getCart(sessionId);
    const total = this.calculateTotal(sessionId);
    const discount = session.data.discount?.amount || 0;

    const order = {
      orderId: crypto.randomBytes(16).toString('hex'),
      userId: session.userId,
      items: cart.items,
      subtotal: total,
      discount: discount,
      total: total - discount,
      createdAt: Date.now()
    };

    // Clear cart
    session.data.cart = { items: [] };
    session.data.lastOrder = order;
    this.updateSession(sessionId, session.data);

    return order;
  }
}

// ============================================================================
// Scenario 2: Gaming Server Session
// ============================================================================

class GameSessionManager extends ServerSessionManager {
  createGameSession(userId, gameType) {
    const sessionId = this.createSession(userId, {
      gameType: gameType,
      gameState: {
        level: 1,
        score: 0,
        lives: 3,
        inventory: [],
        position: { x: 0, y: 0 }
      },
      startedAt: Date.now()
    });

    return sessionId;
  }

  updateGameState(sessionId, updates) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.data.gameState = { ...session.data.gameState, ...updates };
    this.updateSession(sessionId, session.data);
  }

  getGameState(sessionId) {
    const session = this.getSession(sessionId);
    return session?.data?.gameState || null;
  }

  saveCheckpoint(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.data.checkpoint = {
      gameState: { ...session.data.gameState },
      savedAt: Date.now()
    };

    this.updateSession(sessionId, session.data);
  }

  loadCheckpoint(sessionId) {
    const session = this.getSession(sessionId);
    if (!session || !session.data.checkpoint) {
      throw new Error('No checkpoint found');
    }

    session.data.gameState = { ...session.data.checkpoint.gameState };
    this.updateSession(sessionId, session.data);
  }

  endGame(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const duration = Date.now() - session.data.startedAt;
    const finalScore = session.data.gameState.score;

    const gameResult = {
      userId: session.userId,
      gameType: session.data.gameType,
      score: finalScore,
      duration: duration,
      completedAt: Date.now()
    };

    this.destroySession(sessionId);
    return gameResult;
  }
}

// ============================================================================
// Scenario 3: Collaborative Editing Session
// ============================================================================

class CollaborativeSessionManager extends ServerSessionManager {
  createDocumentSession(userId, documentId) {
    const sessionId = this.createSession(userId, {
      documentId: documentId,
      content: '',
      cursors: new Map(),
      operations: [],
      version: 0
    });

    return sessionId;
  }

  joinDocument(sessionId, userId, userName) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.data.participants) {
      session.data.participants = new Map();
    }

    session.data.participants.set(userId, {
      userId: userId,
      userName: userName,
      joinedAt: Date.now(),
      cursor: { line: 0, column: 0 }
    });

    this.updateSession(sessionId, session.data);
    this.emit('userJoined', { sessionId, userId, userName });
  }

  updateCursor(sessionId, userId, cursor) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const participant = session.data.participants?.get(userId);
    if (participant) {
      participant.cursor = cursor;
      this.updateSession(sessionId, session.data);
      this.emit('cursorMoved', { sessionId, userId, cursor });
    }
  }

  applyOperation(sessionId, userId, operation) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const op = {
      userId: userId,
      operation: operation,
      version: session.data.version,
      timestamp: Date.now()
    };

    session.data.operations.push(op);
    session.data.version++;

    // Apply operation to content
    session.data.content = this.applyOperationToContent(
      session.data.content,
      operation
    );

    this.updateSession(sessionId, session.data);
    this.emit('operationApplied', { sessionId, operation: op });

    return session.data.version;
  }

  applyOperationToContent(content, operation) {
    // Simplified operation application
    switch (operation.type) {
      case 'insert':
        return content.slice(0, operation.position) +
               operation.text +
               content.slice(operation.position);
      case 'delete':
        return content.slice(0, operation.position) +
               content.slice(operation.position + operation.length);
      default:
        return content;
    }
  }

  getDocument(sessionId) {
    const session = this.getSession(sessionId);
    return {
      content: session?.data?.content || '',
      version: session?.data?.version || 0,
      participants: Array.from(session?.data?.participants?.values() || [])
    };
  }
}

// ============================================================================
// Scenario 4: Workflow Session Manager
// ============================================================================

class WorkflowSessionManager extends ServerSessionManager {
  startWorkflow(userId, workflowType) {
    const sessionId = this.createSession(userId, {
      workflowType: workflowType,
      currentStep: 1,
      steps: [],
      formData: {},
      history: []
    });

    return sessionId;
  }

  completeStep(sessionId, stepNumber, stepData) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const step = {
      stepNumber: stepNumber,
      data: stepData,
      completedAt: Date.now()
    };

    session.data.steps.push(step);
    session.data.formData = { ...session.data.formData, ...stepData };
    session.data.history.push({
      action: 'stepCompleted',
      stepNumber: stepNumber,
      timestamp: Date.now()
    });

    this.updateSession(sessionId, session.data);
  }

  goToStep(sessionId, stepNumber) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.data.currentStep = stepNumber;
    session.data.history.push({
      action: 'navigatedToStep',
      stepNumber: stepNumber,
      timestamp: Date.now()
    });

    this.updateSession(sessionId, session.data);
  }

  getWorkflowState(sessionId) {
    const session = this.getSession(sessionId);
    return {
      workflowType: session?.data?.workflowType,
      currentStep: session?.data?.currentStep,
      completedSteps: session?.data?.steps?.length || 0,
      formData: session?.data?.formData || {}
    };
  }

  submitWorkflow(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const submission = {
      submissionId: crypto.randomBytes(16).toString('hex'),
      userId: session.userId,
      workflowType: session.data.workflowType,
      formData: session.data.formData,
      submittedAt: Date.now()
    };

    this.destroySession(sessionId);
    return submission;
  }
}

// ============================================================================
// Demo Usage
// ============================================================================

function demonstratePatterns() {
  console.log('SERVER SESSION STATE PATTERN DEMONSTRATIONS\n');
  console.log('='.repeat(80));

  // Scenario 1: E-Commerce Session
  console.log('\nSCENARIO 1: E-Commerce Session\n');
  const ecomStore = new MemorySessionStore();
  const ecomManager = new ECommerceSessionManager(ecomStore);

  const sessionId = ecomManager.createSession('user123', { name: 'John Doe' });
  console.log('Session created:', sessionId.substring(0, 16) + '...');

  const products = [
    { id: 1, name: 'Laptop', price: 999.99 },
    { id: 2, name: 'Mouse', price: 29.99 }
  ];

  ecomManager.addToCart(sessionId, products[0], 1);
  ecomManager.addToCart(sessionId, products[1], 2);

  const cart = ecomManager.getCart(sessionId);
  console.log('Cart items:', cart.items.length);
  console.log('Cart total: $' + ecomManager.calculateTotal(sessionId).toFixed(2));

  ecomManager.applyDiscount(sessionId, 'SAVE10', 100);
  const order = ecomManager.checkout(sessionId);
  console.log('Order created:', order.orderId);
  console.log('Order total: $' + order.total.toFixed(2));

  console.log('='.repeat(80));

  // Scenario 2: Gaming Session
  console.log('\nSCENARIO 2: Gaming Session\n');
  const gameStore = new MemorySessionStore();
  const gameManager = new GameSessionManager(gameStore);

  const gameSessionId = gameManager.createGameSession('player456', 'RPG');
  console.log('Game session created:', gameSessionId.substring(0, 16) + '...');

  let gameState = gameManager.getGameState(gameSessionId);
  console.log('Initial game state:', gameState);

  gameManager.updateGameState(gameSessionId, { score: 1000, level: 2 });
  gameManager.saveCheckpoint(gameSessionId);
  console.log('Checkpoint saved');

  gameManager.updateGameState(gameSessionId, { score: 500, lives: 1 });
  gameManager.loadCheckpoint(gameSessionId);

  gameState = gameManager.getGameState(gameSessionId);
  console.log('After loading checkpoint:', gameState);

  console.log('='.repeat(80));

  // Scenario 3: Collaborative Editing
  console.log('\nSCENARIO 3: Collaborative Editing Session\n');
  const collabStore = new MemorySessionStore();
  const collabManager = new CollaborativeSessionManager(collabStore);

  const docSessionId = collabManager.createDocumentSession('user789', 'doc-123');
  console.log('Document session created:', docSessionId.substring(0, 16) + '...');

  collabManager.joinDocument(docSessionId, 'user789', 'Alice');
  collabManager.joinDocument(docSessionId, 'user012', 'Bob');

  const version = collabManager.applyOperation(docSessionId, 'user789', {
    type: 'insert',
    position: 0,
    text: 'Hello World'
  });

  const document = collabManager.getDocument(docSessionId);
  console.log('Document content:', document.content);
  console.log('Document version:', document.version);
  console.log('Participants:', document.participants.length);

  console.log('='.repeat(80));

  // Scenario 4: Workflow Session
  console.log('\nSCENARIO 4: Workflow Session\n');
  const workflowStore = new MemorySessionStore();
  const workflowManager = new WorkflowSessionManager(workflowStore);

  const workflowSessionId = workflowManager.startWorkflow('user345', 'loan-application');
  console.log('Workflow started:', workflowSessionId.substring(0, 16) + '...');

  workflowManager.completeStep(workflowSessionId, 1, {
    firstName: 'Jane',
    lastName: 'Smith'
  });

  workflowManager.completeStep(workflowSessionId, 2, {
    income: 75000,
    employment: 'Full-time'
  });

  const workflowState = workflowManager.getWorkflowState(workflowSessionId);
  console.log('Workflow state:', workflowState);

  const submission = workflowManager.submitWorkflow(workflowSessionId);
  console.log('Workflow submitted:', submission.submissionId);

  // Cleanup
  ecomManager.stopCleanup();
  gameManager.stopCleanup();
  collabManager.stopCleanup();
  workflowManager.stopCleanup();
}

// Export for use in other modules
module.exports = {
  ServerSessionManager,
  MemorySessionStore,
  RedisSessionStore,
  ECommerceSessionManager,
  GameSessionManager,
  CollaborativeSessionManager,
  WorkflowSessionManager,
  demonstratePatterns
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstratePatterns();
}
