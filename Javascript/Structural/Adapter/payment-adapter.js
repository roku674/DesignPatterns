/**
 * Adapter Pattern - Payment Gateway Integration Example
 *
 * The Adapter pattern allows objects with incompatible interfaces to collaborate.
 * It acts as a wrapper between two objects, catching calls for one object and
 * transforming them to format and interface recognizable by the second object.
 */

// ============= Target Interface =============

/**
 * Target Interface: PaymentProcessor
 * This is the interface our application expects
 */
class PaymentProcessor {
  processPayment(amount, currency, customerData) {
    throw new Error('Method processPayment() must be implemented');
  }

  refundPayment(transactionId, amount) {
    throw new Error('Method refundPayment() must be implemented');
  }

  getTransactionStatus(transactionId) {
    throw new Error('Method getTransactionStatus() must be implemented');
  }
}

// ============= Adaptees (Third-party services) =============

/**
 * Adaptee: StripeAPI
 * Third-party payment service with its own interface
 */
class StripeAPI {
  constructor() {
    this.apiKey = 'sk_test_stripe_key';
  }

  createCharge(amountInCents, currencyCode, metadata) {
    // Stripe expects amount in cents
    console.log(`[Stripe] Creating charge: $${amountInCents / 100} ${currencyCode}`);
    console.log(`[Stripe] Customer: ${metadata.email}`);

    return {
      id: 'ch_' + Math.random().toString(36).substr(2, 9),
      status: 'succeeded',
      amount: amountInCents,
      currency: currencyCode,
      created: Date.now()
    };
  }

  createRefund(chargeId, amountInCents) {
    console.log(`[Stripe] Creating refund for charge ${chargeId}: $${amountInCents / 100}`);

    return {
      id: 'ref_' + Math.random().toString(36).substr(2, 9),
      status: 'succeeded',
      amount: amountInCents
    };
  }

  retrieveCharge(chargeId) {
    console.log(`[Stripe] Retrieving charge: ${chargeId}`);
    return {
      id: chargeId,
      status: 'succeeded'
    };
  }
}

/**
 * Adaptee: PayPalSDK
 * Another third-party service with different interface
 */
class PayPalSDK {
  constructor() {
    this.clientId = 'paypal_client_id';
  }

  executePayment(paymentData) {
    // PayPal expects different structure
    console.log(`[PayPal] Executing payment: ${paymentData.amount} ${paymentData.currency}`);
    console.log(`[PayPal] Payer: ${paymentData.payer.email}`);

    return {
      paymentId: 'PAYID-' + Math.random().toString(36).substr(2, 12).toUpperCase(),
      state: 'approved',
      transactions: [{
        amount: {
          total: paymentData.amount,
          currency: paymentData.currency
        }
      }]
    };
  }

  refundSale(saleId, refundAmount) {
    console.log(`[PayPal] Refunding sale ${saleId}: ${refundAmount.amount} ${refundAmount.currency}`);

    return {
      id: 'REFUND-' + Math.random().toString(36).substr(2, 12).toUpperCase(),
      state: 'completed'
    };
  }

  lookupPayment(paymentId) {
    console.log(`[PayPal] Looking up payment: ${paymentId}`);
    return {
      id: paymentId,
      state: 'approved'
    };
  }
}

/**
 * Adaptee: SquareAPI
 * Yet another payment service with its own interface
 */
class SquareAPI {
  constructor() {
    this.accessToken = 'square_access_token';
  }

  chargeCard(money, card, reference) {
    console.log(`[Square] Charging card: ${money.amount / 100} ${money.currency_code}`);
    console.log(`[Square] Reference: ${reference}`);

    return {
      payment: {
        id: 'sqpmt_' + Math.random().toString(36).substr(2, 16),
        status: 'COMPLETED',
        amount_money: money
      }
    };
  }

  refundPayment(paymentId, amountMoney, reason) {
    console.log(`[Square] Refunding payment ${paymentId}: ${amountMoney.amount / 100}`);
    console.log(`[Square] Reason: ${reason}`);

    return {
      refund: {
        id: 'refund_' + Math.random().toString(36).substr(2, 16),
        status: 'COMPLETED',
        amount_money: amountMoney
      }
    };
  }

  getPayment(paymentId) {
    console.log(`[Square] Getting payment: ${paymentId}`);
    return {
      payment: {
        id: paymentId,
        status: 'COMPLETED'
      }
    };
  }
}

// ============= Adapters =============

/**
 * Adapter: StripeAdapter
 * Adapts Stripe API to our PaymentProcessor interface
 */
class StripeAdapter extends PaymentProcessor {
  constructor() {
    super();
    this.stripe = new StripeAPI();
  }

  processPayment(amount, currency, customerData) {
    // Convert dollars to cents (Stripe requirement)
    const amountInCents = Math.round(amount * 100);

    // Adapt customer data to Stripe metadata format
    const metadata = {
      email: customerData.email,
      name: customerData.name
    };

    const result = this.stripe.createCharge(amountInCents, currency, metadata);

    return {
      transactionId: result.id,
      status: result.status === 'succeeded' ? 'completed' : 'failed',
      amount: amount,
      currency: currency
    };
  }

  refundPayment(transactionId, amount) {
    const amountInCents = Math.round(amount * 100);
    const result = this.stripe.createRefund(transactionId, amountInCents);

    return {
      refundId: result.id,
      status: result.status === 'succeeded' ? 'completed' : 'failed',
      amount: amount
    };
  }

  getTransactionStatus(transactionId) {
    const result = this.stripe.retrieveCharge(transactionId);
    return result.status === 'succeeded' ? 'completed' : 'pending';
  }
}

/**
 * Adapter: PayPalAdapter
 * Adapts PayPal SDK to our PaymentProcessor interface
 */
class PayPalAdapter extends PaymentProcessor {
  constructor() {
    super();
    this.paypal = new PayPalSDK();
  }

  processPayment(amount, currency, customerData) {
    // Adapt to PayPal's payment data structure
    const paymentData = {
      amount: amount.toString(),
      currency: currency,
      payer: {
        email: customerData.email,
        firstName: customerData.name.split(' ')[0],
        lastName: customerData.name.split(' ').slice(1).join(' ')
      }
    };

    const result = this.paypal.executePayment(paymentData);

    return {
      transactionId: result.paymentId,
      status: result.state === 'approved' ? 'completed' : 'failed',
      amount: amount,
      currency: currency
    };
  }

  refundPayment(transactionId, amount) {
    const refundAmount = {
      amount: amount.toString(),
      currency: 'USD' // PayPal requires currency for refunds
    };

    const result = this.paypal.refundSale(transactionId, refundAmount);

    return {
      refundId: result.id,
      status: result.state === 'completed' ? 'completed' : 'failed',
      amount: amount
    };
  }

  getTransactionStatus(transactionId) {
    const result = this.paypal.lookupPayment(transactionId);
    return result.state === 'approved' ? 'completed' : 'pending';
  }
}

/**
 * Adapter: SquareAdapter
 * Adapts Square API to our PaymentProcessor interface
 */
class SquareAdapter extends PaymentProcessor {
  constructor() {
    super();
    this.square = new SquareAPI();
  }

  processPayment(amount, currency, customerData) {
    // Convert to Square's money format (amount in cents)
    const money = {
      amount: Math.round(amount * 100),
      currency_code: currency
    };

    const reference = `${customerData.name} - ${customerData.email}`;

    const result = this.square.chargeCard(money, {}, reference);

    return {
      transactionId: result.payment.id,
      status: result.payment.status === 'COMPLETED' ? 'completed' : 'failed',
      amount: amount,
      currency: currency
    };
  }

  refundPayment(transactionId, amount) {
    const amountMoney = {
      amount: Math.round(amount * 100),
      currency_code: 'USD'
    };

    const result = this.square.refundPayment(transactionId, amountMoney, 'Customer request');

    return {
      refundId: result.refund.id,
      status: result.refund.status === 'COMPLETED' ? 'completed' : 'failed',
      amount: amount
    };
  }

  getTransactionStatus(transactionId) {
    const result = this.square.getPayment(transactionId);
    return result.payment.status === 'COMPLETED' ? 'completed' : 'pending';
  }
}

module.exports = {
  PaymentProcessor,
  StripeAdapter,
  PayPalAdapter,
  SquareAdapter,
  // Export adaptees for demonstration
  StripeAPI,
  PayPalSDK,
  SquareAPI
};
