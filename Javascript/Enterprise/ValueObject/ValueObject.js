/**
 * Value Object Pattern
 */

class Address {
  constructor(street, city, state, zipCode) {
    this.street = street;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    Object.freeze(this);
  }

  equals(other) {
    return other instanceof Address &&
      this.street === other.street &&
      this.city === other.city &&
      this.state === other.state &&
      this.zipCode === other.zipCode;
  }

  toString() {
    return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}`;
  }
}

class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
    Object.freeze(this);
  }

  add(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  equals(other) {
    return other instanceof Money &&
      this.amount === other.amount &&
      this.currency === other.currency;
  }

  toString() {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}

module.exports = {
  Address,
  Money
};
