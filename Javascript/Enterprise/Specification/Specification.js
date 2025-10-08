/**
 * Specification Pattern
 */

class Specification {
  isSatisfiedBy(candidate) {
    throw new Error('Must implement isSatisfiedBy');
  }

  and(other) {
    return new AndSpecification(this, other);
  }

  or(other) {
    return new OrSpecification(this, other);
  }

  not() {
    return new NotSpecification(this);
  }
}

class AndSpecification extends Specification {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  isSatisfiedBy(candidate) {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

class OrSpecification extends Specification {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  isSatisfiedBy(candidate) {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

class NotSpecification extends Specification {
  constructor(spec) {
    super();
    this.spec = spec;
  }

  isSatisfiedBy(candidate) {
    return !this.spec.isSatisfiedBy(candidate);
  }
}

class PremiumCustomerSpec extends Specification {
  isSatisfiedBy(customer) {
    return customer.isPremium;
  }
}

class HighSpenderSpec extends Specification {
  constructor(threshold) {
    super();
    this.threshold = threshold;
  }

  isSatisfiedBy(customer) {
    return customer.totalSpent > this.threshold;
  }
}

module.exports = {
  Specification,
  PremiumCustomerSpec,
  HighSpenderSpec
};
