/**
 * Special Case Pattern (Null Object variant)
 */

class Customer {
  constructor(name, email, plan) {
    this.name = name;
    this.email = email;
    this.plan = plan;
  }

  getDiscount() {
    return this.plan.getDiscount();
  }

  getPlan() {
    return this.plan;
  }
}

class Plan {
  constructor(name, discount) {
    this.name = name;
    this.discount = discount;
  }

  getDiscount() {
    return this.discount;
  }
}

class NullPlan extends Plan {
  constructor() {
    super('No Plan', 0);
  }

  getDiscount() {
    return 0;
  }
}

class UnknownCustomer extends Customer {
  constructor() {
    super('Unknown', 'unknown@example.com', new NullPlan());
  }

  getDiscount() {
    return 0;
  }
}

module.exports = {
  Customer,
  Plan,
  NullPlan,
  UnknownCustomer
};
