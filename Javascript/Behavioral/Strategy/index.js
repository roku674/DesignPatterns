const { CreditCardPayment, PayPalPayment, CryptoPayment, ShoppingCart } = require('./payment-strategy');

console.log('=== Strategy Pattern Demo ===\n');

const cart = new ShoppingCart();
cart.setAmount(99.99);

console.log('Paying with Credit Card:');
cart.setPaymentStrategy(new CreditCardPayment('1234567890123456'));
cart.checkout();

console.log('\nPaying with PayPal:');
cart.setPaymentStrategy(new PayPalPayment('user@example.com'));
cart.checkout();

console.log('\nPaying with Cryptocurrency:');
cart.setPaymentStrategy(new CryptoPayment('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'));
cart.checkout();

console.log('\n=== Demo Complete ===');
