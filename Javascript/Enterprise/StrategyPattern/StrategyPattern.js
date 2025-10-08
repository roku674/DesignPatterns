/**
 * Strategy Pattern (Enterprise variant)
 */

class PricingStrategy {
  calculate(amount) {
    throw new Error('Must implement calculate');
  }
}

class RegularPricing extends PricingStrategy {
  calculate(amount) {
    return amount;
  }
}

class MemberPricing extends PricingStrategy {
  calculate(amount) {
    return amount * 0.9; // 10% discount
  }
}

class VIPPricing extends PricingStrategy {
  calculate(amount) {
    return amount * 0.8; // 20% discount
  }
}

class Order {
  constructor(items, pricingStrategy) {
    this.items = items;
    this.pricingStrategy = pricingStrategy;
  }

  calculateTotal() {
    const subtotal = this.items.reduce((sum, item) => sum + item.price, 0);
    return this.pricingStrategy.calculate(subtotal);
  }

  setPricingStrategy(strategy) {
    this.pricingStrategy = strategy;
  }
}

module.exports = {
  RegularPricing,
  MemberPricing,
  VIPPricing,
  Order
};
