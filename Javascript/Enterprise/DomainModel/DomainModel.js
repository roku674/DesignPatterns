/**
 * Domain Model Pattern
 *
 * An object model of the domain that incorporates both behavior and data.
 * Rich domain objects contain business logic and rules.
 */

/**
 * Money Value Object
 */
class Money {
  constructor(amount, currency = 'USD') {
    this.amount = amount;
    this.currency = currency;
  }

  add(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor) {
    return new Money(this.amount * factor, this.currency);
  }

  isGreaterThan(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare different currencies');
    }
    return this.amount > other.amount;
  }

  toString() {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}

/**
 * Account Entity
 */
class Account {
  constructor(id, owner, balance = new Money(0)) {
    this.id = id;
    this.owner = owner;
    this.balance = balance;
    this.transactions = [];
  }

  /**
   * Withdraw money from account
   */
  withdraw(amount) {
    if (this.balance.isGreaterThan(amount) || this.balance.amount === amount.amount) {
      this.balance = this.balance.subtract(amount);
      this.recordTransaction('withdrawal', amount);
    } else {
      throw new Error('Insufficient funds');
    }
  }

  /**
   * Deposit money to account
   */
  deposit(amount) {
    this.balance = this.balance.add(amount);
    this.recordTransaction('deposit', amount);
  }

  /**
   * Transfer money to another account
   */
  transferTo(targetAccount, amount) {
    this.withdraw(amount);
    targetAccount.deposit(amount);
    this.recordTransaction('transfer_out', amount, targetAccount.id);
    targetAccount.recordTransaction('transfer_in', amount, this.id);
  }

  recordTransaction(type, amount, relatedAccountId = null) {
    this.transactions.push({
      type,
      amount: amount.toString(),
      relatedAccount: relatedAccountId,
      timestamp: new Date()
    });
  }

  getStatement() {
    return {
      accountId: this.id,
      owner: this.owner,
      balance: this.balance.toString(),
      transactions: this.transactions
    };
  }
}

/**
 * Order Entity with complex business rules
 */
class Order {
  constructor(id, customer) {
    this.id = id;
    this.customer = customer;
    this.items = [];
    this.status = 'draft';
    this.createdAt = new Date();
  }

  addItem(product, quantity) {
    if (this.status !== 'draft') {
      throw new Error('Cannot modify submitted order');
    }

    const existingItem = this.items.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push(new OrderItem(product, quantity));
    }
  }

  removeItem(productId) {
    if (this.status !== 'draft') {
      throw new Error('Cannot modify submitted order');
    }
    this.items = this.items.filter(item => item.product.id !== productId);
  }

  getTotal() {
    let total = this.items.reduce((sum, item) => sum.add(item.getSubtotal()), new Money(0));

    // Apply customer discounts
    if (this.customer.isPremium()) {
      total = total.multiply(0.9); // 10% discount
    }

    return total;
  }

  submit() {
    if (this.items.length === 0) {
      throw new Error('Cannot submit empty order');
    }
    if (this.status !== 'draft') {
      throw new Error('Order already submitted');
    }
    this.status = 'submitted';
    this.submittedAt = new Date();
  }

  approve() {
    if (this.status !== 'submitted') {
      throw new Error('Can only approve submitted orders');
    }
    this.status = 'approved';
    this.approvedAt = new Date();
  }

  ship() {
    if (this.status !== 'approved') {
      throw new Error('Can only ship approved orders');
    }
    this.status = 'shipped';
    this.shippedAt = new Date();
  }
}

/**
 * Order Item Value Object
 */
class OrderItem {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity;
  }

  getSubtotal() {
    return this.product.price.multiply(this.quantity);
  }
}

/**
 * Product Entity
 */
class Product {
  constructor(id, name, price) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}

/**
 * Customer Entity
 */
class Customer {
  constructor(id, name, email, membershipLevel = 'standard') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.membershipLevel = membershipLevel;
  }

  isPremium() {
    return this.membershipLevel === 'premium';
  }
}

module.exports = {
  Money,
  Account,
  Order,
  OrderItem,
  Product,
  Customer
};
