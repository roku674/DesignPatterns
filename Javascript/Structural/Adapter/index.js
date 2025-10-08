/**
 * Adapter Pattern - Demo
 * Demonstrates adapting incompatible payment gateway interfaces
 */

const {
  StripeAdapter,
  PayPalAdapter,
  SquareAdapter
} = require('./payment-adapter');

console.log('=== Adapter Pattern Demo ===\n');

/**
 * Client code that works with the unified PaymentProcessor interface
 */
function processOrderPayment(paymentProcessor, orderInfo) {
  console.log(`\n--- Processing Order #${orderInfo.orderId} ---`);
  console.log(`Amount: $${orderInfo.amount} ${orderInfo.currency}`);
  console.log(`Customer: ${orderInfo.customer.name} (${orderInfo.customer.email})`);

  // Process payment
  const paymentResult = paymentProcessor.processPayment(
    orderInfo.amount,
    orderInfo.currency,
    orderInfo.customer
  );

  console.log(`\nPayment Result:`);
  console.log(`  Transaction ID: ${paymentResult.transactionId}`);
  console.log(`  Status: ${paymentResult.status}`);

  // Check status
  const status = paymentProcessor.getTransactionStatus(paymentResult.transactionId);
  console.log(`  Verified Status: ${status}`);

  return paymentResult;
}

/**
 * Process refund
 */
function processRefund(paymentProcessor, transactionId, amount) {
  console.log(`\n--- Processing Refund ---`);
  console.log(`Transaction ID: ${transactionId}`);
  console.log(`Refund Amount: $${amount}`);

  const refundResult = paymentProcessor.refundPayment(transactionId, amount);

  console.log(`\nRefund Result:`);
  console.log(`  Refund ID: ${refundResult.refundId}`);
  console.log(`  Status: ${refundResult.status}`);

  return refundResult;
}

// Sample order data
const order1 = {
  orderId: 'ORD-001',
  amount: 99.99,
  currency: 'USD',
  customer: {
    name: 'John Doe',
    email: 'john.doe@example.com'
  }
};

const order2 = {
  orderId: 'ORD-002',
  amount: 149.50,
  currency: 'USD',
  customer: {
    name: 'Jane Smith',
    email: 'jane.smith@example.com'
  }
};

const order3 = {
  orderId: 'ORD-003',
  amount: 75.00,
  currency: 'USD',
  customer: {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com'
  }
};

// Example 1: Process payment with Stripe
console.log('=== Example 1: Stripe Payment ===');
const stripeProcessor = new StripeAdapter();
const stripeTransaction = processOrderPayment(stripeProcessor, order1);

// Example 2: Process payment with PayPal
console.log('\n\n=== Example 2: PayPal Payment ===');
const paypalProcessor = new PayPalAdapter();
const paypalTransaction = processOrderPayment(paypalProcessor, order2);

// Example 3: Process payment with Square
console.log('\n\n=== Example 3: Square Payment ===');
const squareProcessor = new SquareAdapter();
const squareTransaction = processOrderPayment(squareProcessor, order3);

// Example 4: Process refunds with different processors
console.log('\n\n=== Example 4: Processing Refunds ===');

processRefund(stripeProcessor, stripeTransaction.transactionId, 50.00);
processRefund(paypalProcessor, paypalTransaction.transactionId, 149.50);
processRefund(squareProcessor, squareTransaction.transactionId, 25.00);

// Example 5: Runtime payment processor selection
console.log('\n\n=== Example 5: Runtime Processor Selection ===');

function getPaymentProcessor(provider) {
  switch (provider.toLowerCase()) {
    case 'stripe':
      return new StripeAdapter();
    case 'paypal':
      return new PayPalAdapter();
    case 'square':
      return new SquareAdapter();
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}

const providers = ['Stripe', 'PayPal', 'Square'];
const testOrder = {
  orderId: 'ORD-004',
  amount: 199.99,
  currency: 'USD',
  customer: {
    name: 'Alice Williams',
    email: 'alice.williams@example.com'
  }
};

providers.forEach(provider => {
  console.log(`\n--- Testing with ${provider} ---`);
  const processor = getPaymentProcessor(provider);
  processOrderPayment(processor, testOrder);
});

// Example 6: Demonstrating adapter benefits
console.log('\n\n=== Example 6: Adapter Benefits ===\n');

console.log('Without Adapter Pattern:');
console.log('  - Each payment gateway requires different code');
console.log('  - Switching providers means rewriting payment logic');
console.log('  - Testing requires mocking multiple different interfaces');
console.log('  - Adding new gateway requires changes throughout codebase\n');

console.log('With Adapter Pattern:');
console.log('  ✓ Uniform interface for all payment gateways');
console.log('  ✓ Easy to switch providers (just swap adapter)');
console.log('  ✓ Simple testing (mock one interface)');
console.log('  ✓ New gateways only require new adapter class');
console.log('  ✓ Client code remains unchanged');

console.log('\n=== Demo Complete ===');
