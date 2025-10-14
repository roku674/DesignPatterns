/**
 * Page Controller Pattern Demonstration
 *
 * The Page Controller pattern assigns a controller to each logical page or action.
 * Each controller handles requests for its specific page, processes logic, and
 * determines which view to render.
 *
 * Real-world scenarios demonstrated:
 * 1. Home page with session awareness
 * 2. User login with validation
 * 3. User registration with complex validation
 * 4. Product detail page with add to cart
 * 5. Contact form with email sending
 * 6. Search functionality with pagination
 * 7. User profile viewing and editing
 * 8. Dashboard with authentication check
 * 9. Form validation and error handling
 * 10. Redirect after successful operations
 */

const {
  HomePageController,
  LoginPageController,
  RegistrationPageController,
  UserProfileController,
  ProductPageController,
  ContactPageController,
  SearchPageController,
  DashboardPageController
} = require('./PageController');

// Mock Services
class MockUserService {
  constructor() {
    this.users = new Map([
      ['1', { id: '1', name: 'John Doe', email: 'john@example.com', username: 'johndoe', bio: 'Software developer' }],
      ['2', { id: '2', name: 'Jane Smith', email: 'jane@example.com', username: 'janesmith', bio: 'Designer' }]
    ]);
    this.usedUsernames = new Set(['johndoe', 'janesmith']);
    this.usedEmails = new Set(['john@example.com', 'jane@example.com']);
  }

  async getUserById(id) {
    return this.users.get(id) || null;
  }

  async usernameExists(username) {
    return this.usedUsernames.has(username);
  }

  async emailExists(email) {
    return this.usedEmails.has(email);
  }

  async createUser(userData) {
    const id = String(this.users.size + 1);
    const user = { id, ...userData };
    this.users.set(id, user);
    this.usedUsernames.add(userData.username);
    this.usedEmails.add(userData.email);
    return user;
  }

  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, updates);
      return user;
    }
    return null;
  }
}

class MockAuthService {
  async authenticate(username, password) {
    if (username === 'admin' && password === 'password123') {
      return { id: '1', username: 'admin', name: 'Admin User' };
    }
    return null;
  }
}

class MockProductService {
  constructor() {
    this.products = new Map([
      ['1', { id: '1', name: 'Laptop', price: 999.99, category: 'Electronics', stock: 10 }],
      ['2', { id: '2', name: 'Phone', price: 599.99, category: 'Electronics', stock: 5 }],
      ['3', { id: '3', name: 'Tablet', price: 399.99, category: 'Electronics', stock: 0 }]
    ]);
  }

  async getProductById(id) {
    return this.products.get(id) || null;
  }

  async getRelatedProducts(category, excludeId) {
    return Array.from(this.products.values())
      .filter(p => p.category === category && p.id !== excludeId)
      .slice(0, 3);
  }
}

class MockCartService {
  constructor() {
    this.carts = new Map();
  }

  async addItem(cartId, item) {
    if (!this.carts.has(cartId)) {
      this.carts.set(cartId, []);
    }
    this.carts.get(cartId).push(item);
  }

  async getItemCount(cartId) {
    return this.carts.get(cartId)?.length || 0;
  }
}

class MockEmailService {
  async sendContactForm(data) {
    console.log('Email sent:', data);
    return true;
  }
}

class MockSearchService {
  async search(query, options) {
    const allItems = [
      { id: 1, title: 'JavaScript Tutorial', type: 'article' },
      { id: 2, title: 'Node.js Guide', type: 'article' },
      { id: 3, title: 'React Documentation', type: 'doc' }
    ];

    const filtered = allItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );

    const start = (options.page - 1) * options.perPage;
    const end = start + options.perPage;

    return {
      items: filtered.slice(start, end),
      total: filtered.length
    };
  }
}

class MockAnalyticsService {
  async getUserStats(userId) {
    return {
      totalViews: 1234,
      totalPosts: 45,
      totalComments: 89
    };
  }

  async getRecentActivity(userId, limit) {
    return [
      { action: 'Created post', timestamp: new Date(), details: 'New blog post' },
      { action: 'Commented', timestamp: new Date(), details: 'On article #123' }
    ];
  }
}

// Helper function to display results
function displayResult(title, result) {
  console.log(`\n${title}`);
  console.log(JSON.stringify(result, null, 2));
}

// =============================================================================
// Scenario 1: Home Page
// =============================================================================
console.log('=== Scenario 1: Home Page ===');

(async () => {
  const homeController = new HomePageController();

  // Anonymous user
  const anonymousRequest = {
    session: {}
  };
  const anonymousResult = await homeController.get(anonymousRequest);
  displayResult('Anonymous User Home Page:', anonymousResult);

  // Logged in user
  const loggedInRequest = {
    session: {
      user: { name: 'John Doe', username: 'johndoe' }
    }
  };
  const loggedInResult = await homeController.get(loggedInRequest);
  displayResult('Logged In User Home Page:', loggedInResult);
})();

// =============================================================================
// Scenario 2: Login Page - GET and POST
// =============================================================================
console.log('\n\n=== Scenario 2: Login Page ===');

(async () => {
  const authService = new MockAuthService();
  const loginController = new LoginPageController(authService);

  // GET login page
  const getRequest = {
    session: {},
    query: { returnUrl: '/dashboard' }
  };
  const getResult = await loginController.get(getRequest);
  displayResult('GET Login Page:', getResult);

  // POST with invalid credentials
  const invalidLoginRequest = {
    session: {},
    body: { username: 'admin', password: 'wrong' }
  };
  const invalidResult = await loginController.post(invalidLoginRequest);
  displayResult('Invalid Login Attempt:', invalidResult);

  // POST with valid credentials
  const validLoginRequest = {
    session: {},
    body: { username: 'admin', password: 'password123', returnUrl: '/dashboard' }
  };
  const validResult = await loginController.post(validLoginRequest);
  displayResult('Successful Login:', validResult);
  console.log('Session after login:', validLoginRequest.session);
})();

// =============================================================================
// Scenario 3: Registration with Validation
// =============================================================================
console.log('\n\n=== Scenario 3: User Registration ===');

(async () => {
  const userService = new MockUserService();
  const registerController = new RegistrationPageController(userService);

  // GET registration page
  const getRequest = { session: {} };
  const getResult = await registerController.get(getRequest);
  displayResult('GET Registration Page:', getResult);

  // POST with validation errors
  const invalidRequest = {
    session: {},
    body: {
      username: 'ab',  // Too short
      email: 'invalid-email',
      password: 'weak',
      confirmPassword: 'different'
    }
  };
  const invalidResult = await registerController.post(invalidRequest);
  displayResult('Registration with Validation Errors:', invalidResult);

  // POST with duplicate username
  const duplicateRequest = {
    session: {},
    body: {
      username: 'johndoe',  // Already exists
      email: 'new@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    }
  };
  const duplicateResult = await registerController.post(duplicateRequest);
  displayResult('Registration with Duplicate Username:', duplicateResult);

  // POST with valid data
  const validRequest = {
    session: {},
    body: {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    }
  };
  const validResult = await registerController.post(validRequest);
  displayResult('Successful Registration:', validResult);
  console.log('Session after registration:', validRequest.session);
})();

// =============================================================================
// Scenario 4: User Profile - View and Edit
// =============================================================================
console.log('\n\n=== Scenario 4: User Profile ===');

(async () => {
  const userService = new MockUserService();
  const profileController = new UserProfileController(userService);

  // GET profile without authentication
  const unauthRequest = {
    session: {},
    params: {}
  };
  const unauthResult = await profileController.get(unauthRequest);
  displayResult('Unauthorized Profile Access:', unauthResult);

  // GET profile with authentication
  const authRequest = {
    session: { userId: '1' },
    params: { id: '1' }
  };
  const authResult = await profileController.get(authRequest);
  displayResult('View User Profile:', authResult);

  // POST to update profile with validation errors
  const invalidUpdateRequest = {
    session: { userId: '1' },
    body: {
      name: 'J',  // Too short
      email: 'invalid',
      bio: 'Updated bio'
    }
  };
  const invalidUpdateResult = await profileController.post(invalidUpdateRequest);
  displayResult('Profile Update with Errors:', invalidUpdateResult);

  // POST to update profile successfully
  const validUpdateRequest = {
    session: { userId: '1' },
    body: {
      name: 'John Updated',
      email: 'john.updated@example.com',
      bio: 'Updated biography'
    }
  };
  const validUpdateResult = await profileController.post(validUpdateRequest);
  displayResult('Successful Profile Update:', validUpdateResult);
})();

// =============================================================================
// Scenario 5: Product Page with Add to Cart
// =============================================================================
console.log('\n\n=== Scenario 5: Product Page ===');

(async () => {
  const productService = new MockProductService();
  const cartService = new MockCartService();
  const productController = new ProductPageController(productService, cartService);

  // GET existing product
  const getRequest = {
    params: { id: '1' },
    session: { cartId: 'cart-123' }
  };
  const getResult = await productController.get(getRequest);
  displayResult('Product Detail Page:', getResult);

  // GET non-existent product
  const notFoundRequest = {
    params: { id: '999' },
    session: {}
  };
  const notFoundResult = await productController.get(notFoundRequest);
  displayResult('Product Not Found:', notFoundResult);

  // POST add to cart with invalid quantity
  const invalidQuantityRequest = {
    params: { id: '1' },
    body: { quantity: 150 },
    session: { cartId: 'cart-123' }
  };
  const invalidQuantityResult = await productController.post(invalidQuantityRequest);
  displayResult('Invalid Quantity:', invalidQuantityResult);

  // POST add to cart with out of stock
  const outOfStockRequest = {
    params: { id: '3' },
    body: { quantity: 1 },
    session: { cartId: 'cart-123' }
  };
  const outOfStockResult = await productController.post(outOfStockRequest);
  displayResult('Out of Stock:', outOfStockResult);

  // POST successful add to cart
  const validAddRequest = {
    params: { id: '1' },
    body: { quantity: 2 },
    session: { cartId: 'cart-123' }
  };
  const validAddResult = await productController.post(validAddRequest);
  displayResult('Successful Add to Cart:', validAddResult);
})();

// =============================================================================
// Scenario 6: Contact Form
// =============================================================================
console.log('\n\n=== Scenario 6: Contact Form ===');

(async () => {
  const emailService = new MockEmailService();
  const contactController = new ContactPageController(emailService);

  // GET contact page
  const getRequest = {};
  const getResult = await contactController.get(getRequest);
  displayResult('GET Contact Page:', getResult);

  // POST with validation errors
  const invalidRequest = {
    body: {
      name: 'A',
      email: 'invalid',
      subject: 'Hi',
      message: 'Short'
    }
  };
  const invalidResult = await contactController.post(invalidRequest);
  displayResult('Contact Form with Errors:', invalidResult);

  // POST with valid data
  const validRequest = {
    body: {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Product Inquiry',
      message: 'I would like to know more about your products and services.'
    }
  };
  const validResult = await contactController.post(validRequest);
  displayResult('Successful Contact Form Submission:', validResult);
})();

// =============================================================================
// Scenario 7: Search with Pagination
// =============================================================================
console.log('\n\n=== Scenario 7: Search Functionality ===');

(async () => {
  const searchService = new MockSearchService();
  const searchController = new SearchPageController(searchService);

  // GET search page without query
  const emptyRequest = {
    query: {}
  };
  const emptyResult = await searchController.get(emptyRequest);
  displayResult('Empty Search Page:', emptyResult);

  // GET search with query
  const searchRequest = {
    query: { q: 'JavaScript', page: '1' }
  };
  const searchResult = await searchController.get(searchRequest);
  displayResult('Search Results:', searchResult);
})();

// =============================================================================
// Scenario 8: Dashboard with Authentication
// =============================================================================
console.log('\n\n=== Scenario 8: Dashboard ===');

(async () => {
  const userService = new MockUserService();
  const analyticsService = new MockAnalyticsService();
  const dashboardController = new DashboardPageController(userService, analyticsService);

  // GET dashboard without authentication
  const unauthRequest = {
    session: {}
  };
  const unauthResult = await dashboardController.get(unauthRequest);
  displayResult('Unauthorized Dashboard Access:', unauthResult);

  // GET dashboard with authentication
  const authRequest = {
    session: { userId: '1' }
  };
  const authResult = await dashboardController.get(authRequest);
  displayResult('Authenticated Dashboard:', authResult);
})();

// =============================================================================
// Summary
// =============================================================================
console.log('\n\n=== Page Controller Pattern Summary ===');
console.log('Benefits:');
console.log('  ✓ Simple and intuitive design');
console.log('  ✓ One controller per logical page');
console.log('  ✓ Easy to understand and maintain');
console.log('  ✓ Good for small to medium applications');
console.log('  ✓ Clear separation of concerns');
console.log('  ✓ Built-in validation support');
console.log('\nUse Cases:');
console.log('  • Server-side rendered web applications');
console.log('  • Form processing and validation');
console.log('  • CRUD operations per resource');
console.log('  • Multi-step forms and wizards');
console.log('  • Traditional MVC applications');
console.log('  • Admin panels and dashboards');
console.log('\nDifference from Front Controller:');
console.log('  • Page Controller: One controller per page/action');
console.log('  • Front Controller: Single entry point for all requests');
console.log('  • Page Controller is simpler for straightforward applications');
console.log('  • Front Controller provides more centralized control');
