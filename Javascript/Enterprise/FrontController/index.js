/**
 * Front Controller Pattern Demonstration
 *
 * The Front Controller pattern provides a centralized entry point for handling
 * all requests in a web application. It processes common logic before delegating
 * to specific handlers.
 *
 * Real-world scenarios demonstrated:
 * 1. Basic web application routing
 * 2. RESTful API with authentication
 * 3. Request filtering and preprocessing
 * 4. Error handling and logging
 * 5. Parameterized routes with dynamic segments
 * 6. CORS and security headers
 * 7. Session management
 * 8. Content negotiation
 * 9. Rate limiting
 * 10. Multi-format response handling
 */

const {
  FrontController,
  RESTFrontController,
  Request,
  Response,
  Command
} = require('./FrontController');

// Helper to display responses
function displayResponse(response, title) {
  console.log(`\n${title}`);
  console.log('Status:', response.status);
  console.log('Headers:', response.headers);
  console.log('Body:', response.body);
}

// =============================================================================
// Scenario 1: Basic Web Application Routing
// =============================================================================
console.log('=== Scenario 1: Basic Web Application Routing ===');

const basicController = new FrontController();

// Define commands for different pages
class HomeCommand extends Command {
  async execute(request, response) {
    response.html('<h1>Welcome to Home Page</h1>');
  }
}

class AboutCommand extends Command {
  async execute(request, response) {
    response.html('<h1>About Us</h1><p>We are a great company!</p>');
  }
}

class ContactCommand extends Command {
  async execute(request, response) {
    response.json({ page: 'contact', email: 'contact@example.com' });
  }
}

// Register routes
basicController.registerRoute('GET', '/', new HomeCommand());
basicController.registerRoute('GET', '/about', new AboutCommand());
basicController.registerRoute('GET', '/contact', new ContactCommand());

// Handle requests
(async () => {
  const homeRequest = new Request('GET', '/');
  const homeResponse = await basicController.handleRequest(homeRequest);
  displayResponse(homeResponse, 'Home Page Response:');

  const aboutRequest = new Request('GET', '/about');
  const aboutResponse = await basicController.handleRequest(aboutRequest);
  displayResponse(aboutResponse, 'About Page Response:');

  const contactRequest = new Request('GET', '/contact');
  const contactResponse = await basicController.handleRequest(contactRequest);
  displayResponse(contactResponse, 'Contact Page Response:');
})();

// =============================================================================
// Scenario 2: RESTful API with Authentication
// =============================================================================
console.log('\n\n=== Scenario 2: RESTful API with Authentication ===');

const apiController = new FrontController();

// Mock user database
const users = new Map([
  ['token123', { id: 1, name: 'John Doe', email: 'john@example.com' }],
  ['token456', { id: 2, name: 'Jane Smith', email: 'jane@example.com' }]
]);

// Authentication filter
apiController.addFilter(async (request, response) => {
  const authHeader = request.getHeader('authorization');

  if (request.path.startsWith('/api/protected')) {
    if (!authHeader) {
      response.setStatus(401).json({ error: 'Unauthorized' });
      return false;
    }

    const token = authHeader.replace('Bearer ', '');
    const user = users.get(token);

    if (!user) {
      response.setStatus(403).json({ error: 'Invalid token' });
      return false;
    }

    request.user = user;
  }

  return true;
});

// Logging filter
apiController.addFilter(async (request, response) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.path}`);
  return true;
});

// Define API commands
class GetUserCommand extends Command {
  async execute(request, response) {
    response.json({ user: request.user, authenticated: true });
  }
}

class LoginCommand extends Command {
  async execute(request, response) {
    const { username, password } = request.body || {};

    if (username === 'admin' && password === 'password') {
      response.json({ token: 'token123', message: 'Login successful' });
    } else {
      response.setStatus(401).json({ error: 'Invalid credentials' });
    }
  }
}

// Register API routes
apiController.registerRoute('GET', '/api/protected/user', new GetUserCommand());
apiController.registerRoute('POST', '/api/login', new LoginCommand());

// Test authentication
(async () => {
  // Unauthenticated request
  const unauthedRequest = new Request('GET', '/api/protected/user');
  const unauthedResponse = await apiController.handleRequest(unauthedRequest);
  displayResponse(unauthedResponse, 'Unauthenticated Request:');

  // Authenticated request
  const authedRequest = new Request('GET', '/api/protected/user', {
    'authorization': 'Bearer token123'
  });
  const authedResponse = await apiController.handleRequest(authedRequest);
  displayResponse(authedResponse, 'Authenticated Request:');

  // Login request
  const loginRequest = new Request('POST', '/api/login', {}, { username: 'admin', password: 'password' });
  const loginResponse = await apiController.handleRequest(loginRequest);
  displayResponse(loginResponse, 'Login Request:');
})();

// =============================================================================
// Scenario 3: Parameterized Routes
// =============================================================================
console.log('\n\n=== Scenario 3: Parameterized Routes ===');

const paramController = new FrontController();

// Mock product database
const products = new Map([
  ['1', { id: 1, name: 'Laptop', price: 999.99 }],
  ['2', { id: 2, name: 'Phone', price: 599.99 }],
  ['3', { id: 3, name: 'Tablet', price: 399.99 }]
]);

class GetProductCommand extends Command {
  async execute(request, response) {
    const productId = request.params.id;
    const product = products.get(productId);

    if (product) {
      response.json(product);
    } else {
      response.setStatus(404).json({ error: 'Product not found' });
    }
  }
}

class GetUserByIdCommand extends Command {
  async execute(request, response) {
    const userId = request.params.userId;
    const user = { id: userId, name: `User ${userId}`, role: 'customer' };
    response.json(user);
  }
}

// Register parameterized routes
paramController.registerPattern('GET', '/products/:id', new GetProductCommand());
paramController.registerPattern('GET', '/users/:userId', new GetUserByIdCommand());

(async () => {
  const product1Request = new Request('GET', '/products/1');
  const product1Response = await paramController.handleRequest(product1Request);
  displayResponse(product1Response, 'Product ID 1:');

  const product999Request = new Request('GET', '/products/999');
  const product999Response = await paramController.handleRequest(product999Request);
  displayResponse(product999Response, 'Non-existent Product:');

  const userRequest = new Request('GET', '/users/42');
  const userResponse = await paramController.handleRequest(userRequest);
  displayResponse(userResponse, 'User ID 42:');
})();

// =============================================================================
// Scenario 4: RESTful Resource Handler
// =============================================================================
console.log('\n\n=== Scenario 4: RESTful Resource Handler ===');

const restController = new RESTFrontController();

// Mock article database
const articles = new Map([
  ['1', { id: 1, title: 'First Article', content: 'This is the first article' }],
  ['2', { id: 2, title: 'Second Article', content: 'This is the second article' }]
]);

let articleIdCounter = 3;

// Article resource handler
const articleHandler = {
  async list(request, response) {
    const allArticles = Array.from(articles.values());
    response.json({ articles: allArticles, count: allArticles.length });
  },

  async show(request, response) {
    const article = articles.get(request.params.id);
    if (article) {
      response.json(article);
    } else {
      response.setStatus(404).json({ error: 'Article not found' });
    }
  },

  async create(request, response) {
    const { title, content } = request.body;
    const newArticle = {
      id: articleIdCounter++,
      title,
      content,
      createdAt: new Date().toISOString()
    };
    articles.set(String(newArticle.id), newArticle);
    response.setStatus(201).json(newArticle);
  },

  async update(request, response) {
    const article = articles.get(request.params.id);
    if (!article) {
      response.setStatus(404).json({ error: 'Article not found' });
      return;
    }

    const { title, content } = request.body;
    article.title = title || article.title;
    article.content = content || article.content;
    article.updatedAt = new Date().toISOString();

    response.json(article);
  },

  async delete(request, response) {
    const deleted = articles.delete(request.params.id);
    if (deleted) {
      response.setStatus(204).send('');
    } else {
      response.setStatus(404).json({ error: 'Article not found' });
    }
  }
};

// Register the resource
restController.registerResource('articles', articleHandler);

(async () => {
  // List all articles
  const listRequest = new Request('GET', '/articles');
  const listResponse = await restController.handleRequest(listRequest);
  displayResponse(listResponse, 'List Articles:');

  // Get single article
  const getRequest = new Request('GET', '/articles/1');
  const getResponse = await restController.handleRequest(getRequest);
  displayResponse(getResponse, 'Get Article ID 1:');

  // Create new article
  const createRequest = new Request('POST', '/articles',
    { 'content-type': 'application/json' },
    { title: 'New Article', content: 'This is a new article' }
  );
  const createResponse = await restController.handleRequest(createRequest);
  displayResponse(createResponse, 'Create Article:');

  // Update article
  const updateRequest = new Request('PUT', '/articles/1',
    { 'content-type': 'application/json' },
    { title: 'Updated Title' }
  );
  const updateResponse = await restController.handleRequest(updateRequest);
  displayResponse(updateResponse, 'Update Article:');
})();

// =============================================================================
// Scenario 5: Error Handling
// =============================================================================
console.log('\n\n=== Scenario 5: Error Handling ===');

const errorController = new FrontController();

class ThrowErrorCommand extends Command {
  async execute(request, response) {
    throw new Error('Something went wrong in the command!');
  }
}

// Add error handler
errorController.addErrorHandler(async (error, request, response) => {
  console.error('Error caught:', error.message);
  response.setStatus(500).json({
    error: 'Internal Server Error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
  return true;
});

errorController.registerRoute('GET', '/error', new ThrowErrorCommand());

(async () => {
  const errorRequest = new Request('GET', '/error');
  const errorResponse = await errorController.handleRequest(errorRequest);
  displayResponse(errorResponse, 'Error Handling:');
})();

// =============================================================================
// Scenario 6: Rate Limiting
// =============================================================================
console.log('\n\n=== Scenario 6: Rate Limiting ===');

const rateLimitController = new FrontController();

const requestCounts = new Map();
const RATE_LIMIT = 3;
const WINDOW_MS = 60000; // 1 minute

// Rate limiting filter
rateLimitController.addFilter(async (request, response) => {
  const clientId = request.getHeader('x-client-id') || 'anonymous';
  const now = Date.now();

  if (!requestCounts.has(clientId)) {
    requestCounts.set(clientId, []);
  }

  const requests = requestCounts.get(clientId);
  const recentRequests = requests.filter(time => now - time < WINDOW_MS);

  if (recentRequests.length >= RATE_LIMIT) {
    response.setStatus(429).json({
      error: 'Too Many Requests',
      message: `Rate limit of ${RATE_LIMIT} requests per minute exceeded`
    });
    return false;
  }

  recentRequests.push(now);
  requestCounts.set(clientId, recentRequests);

  response.setHeader('X-RateLimit-Limit', RATE_LIMIT);
  response.setHeader('X-RateLimit-Remaining', RATE_LIMIT - recentRequests.length);

  return true;
});

class ApiEndpointCommand extends Command {
  async execute(request, response) {
    response.json({ message: 'API request successful', timestamp: new Date() });
  }
}

rateLimitController.registerRoute('GET', '/api/endpoint', new ApiEndpointCommand());

(async () => {
  for (let i = 1; i <= 4; i++) {
    const request = new Request('GET', '/api/endpoint', { 'x-client-id': 'client-1' });
    const response = await rateLimitController.handleRequest(request);
    displayResponse(response, `Request ${i}:`);
  }
})();

// =============================================================================
// Scenario 7: Custom 404 Handler
// =============================================================================
console.log('\n\n=== Scenario 7: Custom 404 Handler ===');

const notFoundController = new FrontController();

notFoundController.registerRoute('GET', '/exists', {
  async execute(request, response) {
    response.json({ message: 'This route exists!' });
  }
});

notFoundController.onNotFound(async (request, response) => {
  response.setStatus(404).html(`
    <h1>404 - Page Not Found</h1>
    <p>The page ${request.path} could not be found.</p>
    <a href="/">Go Home</a>
  `);
});

(async () => {
  const existsRequest = new Request('GET', '/exists');
  const existsResponse = await notFoundController.handleRequest(existsRequest);
  displayResponse(existsResponse, 'Existing Route:');

  const notFoundRequest = new Request('GET', '/does-not-exist');
  const notFoundResponse = await notFoundController.handleRequest(notFoundRequest);
  displayResponse(notFoundResponse, 'Non-existent Route:');
})();

// =============================================================================
// Summary
// =============================================================================
console.log('\n\n=== Front Controller Pattern Summary ===');
console.log('Benefits:');
console.log('  ✓ Centralized request handling');
console.log('  ✓ Consistent preprocessing and postprocessing');
console.log('  ✓ Easy to implement cross-cutting concerns (auth, logging, etc.)');
console.log('  ✓ Simplified routing and dispatching');
console.log('  ✓ Better code organization and maintainability');
console.log('  ✓ Single point for security and validation');
console.log('\nUse Cases:');
console.log('  • Web applications with complex routing');
console.log('  • RESTful APIs requiring authentication');
console.log('  • Applications needing request filtering');
console.log('  • Systems requiring centralized error handling');
console.log('  • Multi-tenant applications');
console.log('  • Microservices gateways');
