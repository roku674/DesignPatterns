/**
 * Chain of Responsibility Pattern - Demo
 */

const {
  Level1Support,
  Level2Support,
  Level3Support,
  BillingSupport,
  ManagementSupport
} = require('./support-system');

console.log('=== Chain of Responsibility Pattern Demo ===\n');

// Example 1: Building the chain
console.log('=== Example 1: Building Support Chain ===\n');

const level1 = new Level1Support();
const level2 = new Level2Support();
const level3 = new Level3Support();
const billing = new BillingSupport();
const management = new ManagementSupport();

// Build the chain
level1.setNext(level2).setNext(level3).setNext(billing).setNext(management);

console.log('Support chain created:');
console.log('Level 1 → Level 2 → Level 3 → Billing → Management\n');

// Example 2: Handling different requests
console.log('=== Example 2: Processing Support Requests ===\n');

const requests = [
  {
    type: 'technical',
    priority: 'low',
    description: 'Password reset needed'
  },
  {
    type: 'technical',
    priority: 'medium',
    description: 'Software installation issue'
  },
  {
    type: 'technical',
    priority: 'high',
    description: 'Server is down'
  },
  {
    type: 'billing',
    priority: 'medium',
    description: 'Incorrect charge on invoice'
  },
  {
    type: 'general',
    priority: 'high',
    description: 'CEO complaint about service'
  }
];

requests.forEach((request, index) => {
  console.log(`Request ${index + 1}: ${request.description} [${request.type}, ${request.priority}]`);
  const result = level1.handle(request);
  console.log(`Result: ${result}`);
  console.log();
});

// Example 3: Alternative chain configuration
console.log('=== Example 3: Alternative Chain (Billing First) ===\n');

const billingFirst = new BillingSupport();
const techSupport = new Level1Support();
const escalation = new ManagementSupport();

billingFirst.setNext(techSupport).setNext(escalation);

const billingRequest = {
  type: 'billing',
  priority: 'high',
  description: 'Payment not received'
};

console.log(`Request: ${billingRequest.description}`);
const result = billingFirst.handle(billingRequest);
console.log(`Result: ${result}\n`);

// Example 4: Benefits demonstration
console.log('=== Example 4: Pattern Benefits ===\n');

console.log('WITHOUT Chain of Responsibility:');
console.log('  ✗ Client must know which handler to call');
console.log('  ✗ Tight coupling between client and handlers');
console.log('  ✗ Complex if-else or switch statements');
console.log('  ✗ Hard to add new handlers\n');

console.log('WITH Chain of Responsibility:');
console.log('  ✓ Client just sends request to first handler');
console.log('  ✓ Loose coupling - request sender doesn\'t know who handles it');
console.log('  ✓ Easy to add/remove/reorder handlers');
console.log('  ✓ Single Responsibility - each handler does one thing');
console.log('  ✓ Open/Closed Principle - extend without modifying\n');

console.log('=== Demo Complete ===');
