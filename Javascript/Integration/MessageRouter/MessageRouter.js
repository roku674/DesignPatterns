/**
 * MessageRouter Pattern Implementation
 *
 * Purpose:
 * Routes messages to different destinations based on routing logic.
 * Enables dynamic message distribution without tight coupling between components.
 *
 * Use Cases:
 * - Content-based routing
 * - Load balancing across multiple endpoints
 * - Conditional message forwarding
 * - Multi-destination broadcasting
 *
 * Components:
 * - MessageRouter: Base routing implementation
 * - RoutingRule: Defines routing conditions and destinations
 * - RecipientListRouter: Routes to multiple recipients
 * - DynamicRouter: Routes based on runtime conditions
 */

const EventEmitter = require('events');

/**
 * Routing Strategy Types
 */
const RoutingStrategy = {
    FIRST_MATCH: 'first-match',
    ALL_MATCH: 'all-match',
    ROUND_ROBIN: 'round-robin',
    RANDOM: 'random',
    WEIGHTED: 'weighted'
};

/**
 * Router Error
 */
class RouterError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'RouterError';
        this.code = code;
    }
}

/**
 * Routing Rule
 */
class RoutingRule {
    constructor(name, condition, destination, priority = 0) {
        this.name = name;
        this.condition = condition;
        this.destination = destination;
        this.priority = priority;
        this.matchCount = 0;
        this.failureCount = 0;
    }

    /**
     * Check if message matches this rule
     */
    matches(message) {
        try {
            const result = this.condition(message);
            if (result) {
                this.matchCount++;
            }
            return result;
        } catch (error) {
            this.failureCount++;
            throw new RouterError(
                `Rule ${this.name} evaluation failed: ${error.message}`,
                'RULE_EVALUATION_FAILED'
            );
        }
    }

    /**
     * Get rule statistics
     */
    getStats() {
        return {
            name: this.name,
            destination: this.destination,
            priority: this.priority,
            matchCount: this.matchCount,
            failureCount: this.failureCount
        };
    }
}

/**
 * Message Router Base Class
 */
class MessageRouter extends EventEmitter {
    constructor(options = {}) {
        super();
        this.rules = [];
        this.strategy = options.strategy || RoutingStrategy.FIRST_MATCH;
        this.defaultDestination = options.defaultDestination || null;
        this.routedCount = 0;
        this.failedCount = 0;
        this.roundRobinIndex = 0;
    }

    /**
     * Add routing rule
     */
    addRule(name, condition, destination, priority = 0) {
        const rule = new RoutingRule(name, condition, destination, priority);
        this.rules.push(rule);
        this.rules.sort((a, b) => b.priority - a.priority);
        return this;
    }

    /**
     * Remove routing rule
     */
    removeRule(name) {
        const index = this.rules.findIndex(rule => rule.name === name);
        if (index > -1) {
            this.rules.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Route message to appropriate destination(s)
     */
    route(message) {
        try {
            let destinations = [];

            switch (this.strategy) {
                case RoutingStrategy.FIRST_MATCH:
                    destinations = this._routeFirstMatch(message);
                    break;
                case RoutingStrategy.ALL_MATCH:
                    destinations = this._routeAllMatch(message);
                    break;
                case RoutingStrategy.ROUND_ROBIN:
                    destinations = this._routeRoundRobin(message);
                    break;
                case RoutingStrategy.RANDOM:
                    destinations = this._routeRandom(message);
                    break;
                case RoutingStrategy.WEIGHTED:
                    destinations = this._routeWeighted(message);
                    break;
                default:
                    destinations = this._routeFirstMatch(message);
            }

            if (destinations.length === 0 && this.defaultDestination) {
                destinations = [this.defaultDestination];
                this.emit('default-route', message, this.defaultDestination);
            }

            if (destinations.length === 0) {
                this.failedCount++;
                this.emit('no-route', message);
                throw new RouterError('No route found for message', 'NO_ROUTE');
            }

            this.routedCount++;
            this.emit('routed', message, destinations);
            return destinations;
        } catch (error) {
            this.failedCount++;
            this.emit('error', error, message);
            throw error;
        }
    }

    /**
     * Route to first matching destination
     */
    _routeFirstMatch(message) {
        for (const rule of this.rules) {
            if (rule.matches(message)) {
                return [rule.destination];
            }
        }
        return [];
    }

    /**
     * Route to all matching destinations
     */
    _routeAllMatch(message) {
        const destinations = [];
        for (const rule of this.rules) {
            if (rule.matches(message)) {
                destinations.push(rule.destination);
            }
        }
        return destinations;
    }

    /**
     * Route using round-robin strategy
     */
    _routeRoundRobin(message) {
        if (this.rules.length === 0) {
            return [];
        }
        const rule = this.rules[this.roundRobinIndex % this.rules.length];
        this.roundRobinIndex++;
        return [rule.destination];
    }

    /**
     * Route to random destination
     */
    _routeRandom(message) {
        if (this.rules.length === 0) {
            return [];
        }
        const randomIndex = Math.floor(Math.random() * this.rules.length);
        return [this.rules[randomIndex].destination];
    }

    /**
     * Route using weighted strategy
     */
    _routeWeighted(message) {
        if (this.rules.length === 0) {
            return [];
        }

        const totalWeight = this.rules.reduce((sum, rule) => sum + rule.priority, 0);
        let random = Math.random() * totalWeight;

        for (const rule of this.rules) {
            random -= rule.priority;
            if (random <= 0) {
                return [rule.destination];
            }
        }

        return [this.rules[this.rules.length - 1].destination];
    }

    /**
     * Get router statistics
     */
    getStats() {
        return {
            strategy: this.strategy,
            ruleCount: this.rules.length,
            routedCount: this.routedCount,
            failedCount: this.failedCount,
            rules: this.rules.map(rule => rule.getStats())
        };
    }

    /**
     * Clear all rules
     */
    clearRules() {
        this.rules = [];
        return this;
    }
}

/**
 * Content-Based Router
 */
class ContentBasedRouter extends MessageRouter {
    constructor(options = {}) {
        super({ ...options, strategy: RoutingStrategy.FIRST_MATCH });
    }

    /**
     * Add routing rule based on message content
     */
    addContentRule(name, path, expectedValue, destination, priority = 0) {
        const condition = (message) => {
            const payload = message.getPayload ? message.getPayload() : message;
            const value = this._getNestedValue(payload, path);
            return value === expectedValue;
        };
        return this.addRule(name, condition, destination, priority);
    }

    /**
     * Get nested value from object
     */
    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => {
            return current ? current[prop] : undefined;
        }, obj);
    }
}

/**
 * Recipient List Router
 */
class RecipientListRouter extends MessageRouter {
    constructor(options = {}) {
        super({ ...options, strategy: RoutingStrategy.ALL_MATCH });
        this.recipientLists = new Map();
    }

    /**
     * Add recipient list
     */
    addRecipientList(name, recipients) {
        this.recipientLists.set(name, recipients);
        return this;
    }

    /**
     * Route to recipient list
     */
    routeToList(message, listName) {
        const recipients = this.recipientLists.get(listName);
        if (!recipients) {
            throw new RouterError(`Recipient list ${listName} not found`, 'LIST_NOT_FOUND');
        }

        this.emit('routed', message, recipients);
        return recipients;
    }
}

/**
 * Dynamic Router
 */
class DynamicRouter extends MessageRouter {
    constructor(options = {}) {
        super(options);
        this.destinationResolver = options.destinationResolver || null;
    }

    /**
     * Set destination resolver function
     */
    setDestinationResolver(resolver) {
        this.destinationResolver = resolver;
        return this;
    }

    /**
     * Route message using dynamic resolution
     */
    route(message) {
        if (this.destinationResolver) {
            try {
                const destination = this.destinationResolver(message);
                if (destination) {
                    this.routedCount++;
                    this.emit('routed', message, [destination]);
                    return [destination];
                }
            } catch (error) {
                this.failedCount++;
                this.emit('error', error, message);
                throw new RouterError(
                    `Dynamic routing failed: ${error.message}`,
                    'DYNAMIC_ROUTING_FAILED'
                );
            }
        }

        return super.route(message);
    }
}

/**
 * Load Balancing Router
 */
class LoadBalancingRouter extends MessageRouter {
    constructor(destinations, strategy = RoutingStrategy.ROUND_ROBIN) {
        super({ strategy });
        this.destinations = destinations;
        this.loadCounts = new Map();
        destinations.forEach(dest => this.loadCounts.set(dest, 0));
    }

    /**
     * Add destination
     */
    addDestination(destination) {
        this.destinations.push(destination);
        this.loadCounts.set(destination, 0);
        return this;
    }

    /**
     * Route with load balancing
     */
    route(message) {
        let destination;

        switch (this.strategy) {
            case RoutingStrategy.ROUND_ROBIN:
                destination = this.destinations[this.roundRobinIndex % this.destinations.length];
                this.roundRobinIndex++;
                break;
            case RoutingStrategy.RANDOM:
                destination = this.destinations[Math.floor(Math.random() * this.destinations.length)];
                break;
            default:
                destination = this._leastLoadedDestination();
        }

        this.loadCounts.set(destination, (this.loadCounts.get(destination) || 0) + 1);
        this.routedCount++;
        this.emit('routed', message, [destination]);
        return [destination];
    }

    /**
     * Get least loaded destination
     */
    _leastLoadedDestination() {
        let minLoad = Infinity;
        let selected = this.destinations[0];

        for (const [dest, count] of this.loadCounts.entries()) {
            if (count < minLoad) {
                minLoad = count;
                selected = dest;
            }
        }

        return selected;
    }

    /**
     * Get load statistics
     */
    getLoadStats() {
        return Object.fromEntries(this.loadCounts);
    }
}

/**
 * Example Usage and Testing
 */
function demonstrateMessageRouterPattern() {
    console.log('=== MessageRouter Pattern Demonstration ===\n');

    // Example 1: Content-Based Router
    console.log('1. Content-Based Router:');
    const contentRouter = new ContentBasedRouter();
    contentRouter.addContentRule('high-priority', 'priority', 'high', 'priority-queue', 1);
    contentRouter.addContentRule('normal-priority', 'priority', 'normal', 'normal-queue', 0);

    const msg1 = { getPayload: () => ({ priority: 'high', data: 'urgent' }) };
    const destinations1 = contentRouter.route(msg1);
    console.log('High priority message routed to:', destinations1);
    console.log();

    // Example 2: Recipient List Router
    console.log('2. Recipient List Router:');
    const recipientRouter = new RecipientListRouter();
    recipientRouter.addRecipientList('admins', ['admin1@example.com', 'admin2@example.com']);
    recipientRouter.addRecipientList('users', ['user1@example.com', 'user2@example.com']);

    const recipients = recipientRouter.routeToList({ type: 'alert' }, 'admins');
    console.log('Alert routed to:', recipients);
    console.log();

    // Example 3: Load Balancing Router
    console.log('3. Load Balancing Router:');
    const loadBalancer = new LoadBalancingRouter(['server1', 'server2', 'server3']);

    for (let i = 0; i < 10; i++) {
        loadBalancer.route({ data: `request-${i}` });
    }

    console.log('Load distribution:', loadBalancer.getLoadStats());
    console.log();

    // Example 4: Dynamic Router
    console.log('4. Dynamic Router:');
    const dynamicRouter = new DynamicRouter();
    dynamicRouter.setDestinationResolver((message) => {
        const payload = message.getPayload ? message.getPayload() : message;
        return payload.amount > 1000 ? 'high-value-processor' : 'standard-processor';
    });

    const msg2 = { getPayload: () => ({ amount: 1500 }) };
    const dest2 = dynamicRouter.route(msg2);
    console.log('High value message routed to:', dest2);
    console.log();

    // Example 5: Router Statistics
    console.log('5. Router Statistics:');
    console.log('Content Router Stats:', contentRouter.getStats());
}

// Export classes
module.exports = {
    MessageRouter,
    ContentBasedRouter,
    RecipientListRouter,
    DynamicRouter,
    LoadBalancingRouter,
    RoutingRule,
    RoutingStrategy,
    RouterError,
    demonstrateMessageRouterPattern
};

// Run demonstration if executed directly
if (require.main === module) {
    demonstrateMessageRouterPattern();
}
