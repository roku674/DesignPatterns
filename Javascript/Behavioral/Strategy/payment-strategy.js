/**
 * Strategy Pattern - Payment Processing
 */

class PaymentStrategy {
  pay(amount) {
    throw new Error('pay() must be implemented');
  }
}

class CreditCardPayment extends PaymentStrategy {
  constructor(cardNumber) {
    super();
    this.cardNumber = cardNumber;
  }

  pay(amount) {
    console.log(`Paid $${amount} using Credit Card ending in ${this.cardNumber.slice(-4)}`);
  }
}

class PayPalPayment extends PaymentStrategy {
  constructor(email) {
    super();
    this.email = email;
  }

  pay(amount) {
    console.log(`Paid $${amount} using PayPal account ${this.email}`);
  }
}

class CryptoPayment extends PaymentStrategy {
  constructor(walletAddress) {
    super();
    this.walletAddress = walletAddress;
  }

  pay(amount) {
    console.log(`Paid $${amount} using Crypto wallet ${this.walletAddress.slice(0, 10)}...`);
  }
}

class ShoppingCart {
  constructor() {
    this.amount = 0;
    this.paymentStrategy = null;
  }

  setAmount(amount) {
    this.amount = amount;
  }

  setPaymentStrategy(strategy) {
    this.paymentStrategy = strategy;
  }

  checkout() {
    if (!this.paymentStrategy) {
      console.log('Please select a payment method');
      return;
    }
    this.paymentStrategy.pay(this.amount);
  }
}

module.exports = { CreditCardPayment, PayPalPayment, CryptoPayment, ShoppingCart };
