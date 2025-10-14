/**
 * Page Controller Pattern
 *
 * An object that handles a request for a specific page or action on a website.
 * Each page has its own controller that processes the request, invokes domain logic,
 * and determines the view to display. Unlike Front Controller which handles all requests,
 * Page Controller has one controller per logical page.
 *
 * Use Cases:
 * - Simple web applications with distinct pages
 * - Server-side rendered applications
 * - Form processing and validation
 * - Multi-step wizards
 * - CRUD operations per resource
 */

/**
 * Base Page Controller
 * All page controllers extend this class
 */
class PageController {
  constructor() {
    this.viewData = {};
    this.errors = [];
    this.validationRules = {};
  }

  /**
   * Handle GET request
   * @param {Object} request - Request object
   * @returns {Object} View data
   */
  async get(request) {
    throw new Error('GET method must be implemented by subclass');
  }

  /**
   * Handle POST request
   * @param {Object} request - Request object
   * @returns {Object} Response data
   */
  async post(request) {
    throw new Error('POST method must be implemented by subclass');
  }

  /**
   * Validate request data
   * @param {Object} data - Data to validate
   * @returns {boolean} True if valid
   */
  validate(data) {
    this.errors = [];

    for (const [field, rules] of Object.entries(this.validationRules)) {
      const value = data[field];

      if (rules.required && !value) {
        this.errors.push(`${field} is required`);
        continue;
      }

      if (rules.minLength && value && value.length < rules.minLength) {
        this.errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      if (rules.maxLength && value && value.length > rules.maxLength) {
        this.errors.push(`${field} must not exceed ${rules.maxLength} characters`);
      }

      if (rules.pattern && value && !rules.pattern.test(value)) {
        this.errors.push(`${field} has invalid format`);
      }

      if (rules.custom && value) {
        const customError = rules.custom(value);
        if (customError) {
          this.errors.push(customError);
        }
      }
    }

    return this.errors.length === 0;
  }

  /**
   * Set view data
   * @param {string} key - Data key
   * @param {*} value - Data value
   */
  setViewData(key, value) {
    this.viewData[key] = value;
  }

  /**
   * Get view data
   * @returns {Object} View data
   */
  getViewData() {
    return {
      ...this.viewData,
      errors: this.errors
    };
  }

  /**
   * Render view
   * @param {string} viewName - View template name
   * @param {Object} data - Additional view data
   * @returns {Object} Rendered view
   */
  render(viewName, data = {}) {
    return {
      view: viewName,
      data: { ...this.viewData, ...data, errors: this.errors }
    };
  }

  /**
   * Redirect to another page
   * @param {string} url - URL to redirect to
   * @returns {Object} Redirect response
   */
  redirect(url) {
    return {
      redirect: url
    };
  }

  /**
   * Return JSON response
   * @param {Object} data - Response data
   * @param {number} status - HTTP status code
   * @returns {Object} JSON response
   */
  json(data, status = 200) {
    return {
      json: data,
      status
    };
  }
}

/**
 * Home Page Controller
 */
class HomePageController extends PageController {
  async get(request) {
    this.setViewData('title', 'Welcome to Our Website');
    this.setViewData('message', 'This is the home page');
    this.setViewData('user', request.session?.user || null);

    return this.render('home');
  }
}

/**
 * User Profile Page Controller
 */
class UserProfileController extends PageController {
  constructor(userService) {
    super();
    this.userService = userService;
  }

  async get(request) {
    const userId = request.params.id || request.session?.userId;

    if (!userId) {
      return this.redirect('/login');
    }

    try {
      const user = await this.userService.getUserById(userId);

      if (!user) {
        this.errors.push('User not found');
        return this.render('error', { statusCode: 404 });
      }

      this.setViewData('user', user);
      this.setViewData('title', `${user.name}'s Profile`);

      return this.render('profile');
    } catch (error) {
      this.errors.push('Failed to load user profile');
      return this.render('error', { statusCode: 500 });
    }
  }

  async post(request) {
    const userId = request.session?.userId;

    if (!userId) {
      return this.json({ error: 'Unauthorized' }, 401);
    }

    const { name, email, bio } = request.body;

    this.validationRules = {
      name: { required: true, minLength: 2, maxLength: 50 },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      bio: { maxLength: 500 }
    };

    if (!this.validate(request.body)) {
      return this.render('profile', { user: request.body });
    }

    try {
      const updatedUser = await this.userService.updateUser(userId, {
        name,
        email,
        bio
      });

      return this.redirect(`/users/${userId}?updated=true`);
    } catch (error) {
      this.errors.push('Failed to update profile');
      return this.render('profile', { user: request.body });
    }
  }
}

/**
 * Login Page Controller
 */
class LoginPageController extends PageController {
  constructor(authService) {
    super();
    this.authService = authService;
  }

  async get(request) {
    // Check if already logged in
    if (request.session?.userId) {
      return this.redirect('/dashboard');
    }

    this.setViewData('title', 'Login');
    this.setViewData('returnUrl', request.query.returnUrl || '/');

    return this.render('login');
  }

  async post(request) {
    const { username, password } = request.body;

    this.validationRules = {
      username: { required: true, minLength: 3 },
      password: { required: true, minLength: 6 }
    };

    if (!this.validate(request.body)) {
      return this.render('login', { username });
    }

    try {
      const user = await this.authService.authenticate(username, password);

      if (!user) {
        this.errors.push('Invalid username or password');
        return this.render('login', { username });
      }

      // Set session
      request.session.userId = user.id;
      request.session.username = user.username;

      const returnUrl = request.body.returnUrl || '/dashboard';
      return this.redirect(returnUrl);

    } catch (error) {
      this.errors.push('Login failed. Please try again.');
      return this.render('login', { username });
    }
  }
}

/**
 * Registration Page Controller
 */
class RegistrationPageController extends PageController {
  constructor(userService) {
    super();
    this.userService = userService;
  }

  async get(request) {
    this.setViewData('title', 'Create Account');
    return this.render('register');
  }

  async post(request) {
    const { username, email, password, confirmPassword } = request.body;

    this.validationRules = {
      username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        custom: async (value) => {
          const exists = await this.userService.usernameExists(value);
          return exists ? 'Username already taken' : null;
        }
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        custom: async (value) => {
          const exists = await this.userService.emailExists(value);
          return exists ? 'Email already registered' : null;
        }
      },
      password: {
        required: true,
        minLength: 8,
        custom: (value) => {
          if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter';
          if (!/[a-z]/.test(value)) return 'Password must contain lowercase letter';
          if (!/[0-9]/.test(value)) return 'Password must contain number';
          return null;
        }
      },
      confirmPassword: {
        required: true,
        custom: (value) => {
          return value !== password ? 'Passwords do not match' : null;
        }
      }
    };

    if (!this.validate(request.body)) {
      return this.render('register', { username, email });
    }

    try {
      const user = await this.userService.createUser({
        username,
        email,
        password
      });

      // Auto-login after registration
      request.session.userId = user.id;
      request.session.username = user.username;

      return this.redirect('/welcome');

    } catch (error) {
      this.errors.push('Registration failed. Please try again.');
      return this.render('register', { username, email });
    }
  }
}

/**
 * Product Page Controller
 */
class ProductPageController extends PageController {
  constructor(productService, cartService) {
    super();
    this.productService = productService;
    this.cartService = cartService;
  }

  async get(request) {
    const productId = request.params.id;

    try {
      const product = await this.productService.getProductById(productId);

      if (!product) {
        return this.render('error', {
          statusCode: 404,
          message: 'Product not found'
        });
      }

      const relatedProducts = await this.productService.getRelatedProducts(
        product.category,
        productId
      );

      this.setViewData('product', product);
      this.setViewData('relatedProducts', relatedProducts);
      this.setViewData('title', product.name);

      return this.render('product-detail');

    } catch (error) {
      return this.render('error', {
        statusCode: 500,
        message: 'Failed to load product'
      });
    }
  }

  async post(request) {
    const productId = request.params.id;
    const { quantity = 1 } = request.body;

    if (quantity < 1 || quantity > 99) {
      this.errors.push('Quantity must be between 1 and 99');
      return this.json({ error: this.errors[0] }, 400);
    }

    try {
      const product = await this.productService.getProductById(productId);

      if (!product) {
        return this.json({ error: 'Product not found' }, 404);
      }

      if (product.stock < quantity) {
        return this.json({ error: 'Insufficient stock' }, 400);
      }

      await this.cartService.addItem(request.session.cartId, {
        productId,
        quantity,
        price: product.price
      });

      return this.json({
        success: true,
        message: 'Product added to cart',
        cartCount: await this.cartService.getItemCount(request.session.cartId)
      });

    } catch (error) {
      return this.json({ error: 'Failed to add to cart' }, 500);
    }
  }
}

/**
 * Contact Form Page Controller
 */
class ContactPageController extends PageController {
  constructor(emailService) {
    super();
    this.emailService = emailService;
  }

  async get(request) {
    this.setViewData('title', 'Contact Us');
    return this.render('contact');
  }

  async post(request) {
    const { name, email, subject, message } = request.body;

    this.validationRules = {
      name: { required: true, minLength: 2 },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      subject: { required: true, minLength: 5 },
      message: { required: true, minLength: 10, maxLength: 1000 }
    };

    if (!this.validate(request.body)) {
      return this.render('contact', { name, email, subject, message });
    }

    try {
      await this.emailService.sendContactForm({
        name,
        email,
        subject,
        message,
        timestamp: new Date()
      });

      this.setViewData('success', true);
      this.setViewData('successMessage', 'Thank you! We will get back to you soon.');

      return this.render('contact-success');

    } catch (error) {
      this.errors.push('Failed to send message. Please try again later.');
      return this.render('contact', { name, email, subject, message });
    }
  }
}

/**
 * Search Page Controller
 */
class SearchPageController extends PageController {
  constructor(searchService) {
    super();
    this.searchService = searchService;
  }

  async get(request) {
    const query = request.query.q || '';
    const page = parseInt(request.query.page) || 1;
    const perPage = 20;

    if (!query) {
      this.setViewData('title', 'Search');
      return this.render('search');
    }

    try {
      const results = await this.searchService.search(query, {
        page,
        perPage
      });

      this.setViewData('query', query);
      this.setViewData('results', results.items);
      this.setViewData('totalResults', results.total);
      this.setViewData('currentPage', page);
      this.setViewData('totalPages', Math.ceil(results.total / perPage));
      this.setViewData('title', `Search results for "${query}"`);

      return this.render('search-results');

    } catch (error) {
      this.errors.push('Search failed. Please try again.');
      return this.render('search', { query });
    }
  }
}

/**
 * Dashboard Page Controller
 */
class DashboardPageController extends PageController {
  constructor(userService, analyticsService) {
    super();
    this.userService = userService;
    this.analyticsService = analyticsService;
  }

  async get(request) {
    const userId = request.session?.userId;

    if (!userId) {
      return this.redirect('/login?returnUrl=/dashboard');
    }

    try {
      const user = await this.userService.getUserById(userId);
      const stats = await this.analyticsService.getUserStats(userId);
      const recentActivity = await this.analyticsService.getRecentActivity(userId, 10);

      this.setViewData('user', user);
      this.setViewData('stats', stats);
      this.setViewData('recentActivity', recentActivity);
      this.setViewData('title', 'Dashboard');

      return this.render('dashboard');

    } catch (error) {
      this.errors.push('Failed to load dashboard');
      return this.render('error', { statusCode: 500 });
    }
  }
}

module.exports = {
  PageController,
  HomePageController,
  UserProfileController,
  LoginPageController,
  RegistrationPageController,
  ProductPageController,
  ContactPageController,
  SearchPageController,
  DashboardPageController
};
