/**
 * Money Pattern
 */

class Money {
  constructor(amount, currency) {
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

  equals(other) {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString() {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}

module.exports = { Money };
