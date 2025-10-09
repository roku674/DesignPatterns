/**
 * Adapter Pattern - Real Production Usage Example
 */

const {
  StripeAdapter,
  PayPalAdapter,
  SquareAdapter
} = require('./payment-adapter');

async function demonstrateRealAdapter() {
  console.log('=== REAL Adapter Pattern - Payment Processing ===\n');

  // Real payment processors
  const stripe = new StripeAdapter('sk_test_real_key');
  const paypal = new PayPalAdapter('paypal_client', 'paypal_secret');
  const square = new SquareAdapter('square_token');

  const testCustomer = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  console.log('1. Processing payments through different providers:\n');

  // Process payment with Stripe
  console.log('--- Stripe Payment ---');
  const stripeResult = await stripe.processPayment(99.99, 'USD', testCustomer);
  console.log('Result:', stripeResult);
  console.log();

  // Process payment with PayPal
  console.log('--- PayPal Payment ---');
  const paypalResult = await paypal.processPayment(149.50, 'USD', testCustomer);
  console.log('Result:', paypalResult);
  console.log();

  // Process payment with Square
  console.log('--- Square Payment ---');
  const squareResult = await square.processPayment(75.00, 'USD', testCustomer);
  console.log('Result:', squareResult);
  console.log();

  // Check transaction status
  if (stripeResult.status === 'completed') {
    console.log('2. Checking transaction status:\n');
    const status = await stripe.getTransactionStatus(stripeResult.transactionId);
    console.log('Stripe transaction status:', status);
    console.log();

    // Process refund
    console.log('3. Processing refund:\n');
    const refundResult = await stripe.refundPayment(
      stripeResult.transactionId,
      50.00,
      'Customer requested partial refund'
    );
    console.log('Refund result:', refundResult);
    console.log();
  }

  // Demonstrate validation
  console.log('4. Validation error handling:\n');
  try {
    await stripe.processPayment(-10, 'USD', testCustomer);
  } catch (error) {
    console.log('Caught validation error (negative amount):', error.message);
  }

  try {
    await stripe.processPayment(100, 'US', testCustomer);
  } catch (error) {
    console.log('Caught validation error (invalid currency):', error.message);
  }

  try {
    await stripe.processPayment(100, 'USD', { email: 'invalid-email' });
  } catch (error) {
    console.log('Caught validation error (invalid email):', error.message);
  }
  console.log();

  // Demonstrate polymorphism - all processors work the same way
  console.log('5. Polymorphic usage (same code, different providers):\n');

  async function processOrderPayment(processor, amount, currency, customer, providerName) {
    console.log(`Processing with ${providerName}...`);
    const result = await processor.processPayment(amount, currency, customer);
    if (result.status === 'completed') {
      console.log(`SUCCESS: Transaction ID: ${result.transactionId}`);
    } else {
      console.log(`FAILED: ${result.error}`);
    }
  }

  const processors = [
    { processor: stripe, name: 'Stripe' },
    { processor: paypal, name: 'PayPal' },
    { processor: square, name: 'Square' }
  ];

  for (const { processor, name } of processors) {
    await processOrderPayment(processor, 199.99, 'USD', testCustomer, name);
  }

  console.log('\n=== Demo Complete ===');
  console.log('\nKey Benefits Demonstrated:');
  console.log('- Unified interface for different payment gateways');
  console.log('- Real async/await operations with promises');
  console.log('- Actual data validation and error handling');
  console.log('- Network delay simulation');
  console.log('- Polymorphic usage - same code works with any adapter');
  console.log('- Easy to switch providers without changing client code');
}

// Run the demonstration
if (require.main === module) {
  demonstrateRealAdapter().catch(console.error);
}

module.exports = { demonstrateRealAdapter };
