/**
 * Interpreter Pattern - Simple Math Expression Interpreter
 */

class Expression {
  interpret(context) {
    throw new Error('interpret() must be implemented');
  }
}

class NumberExpression extends Expression {
  constructor(number) {
    super();
    this.number = number;
  }

  interpret(context) {
    return this.number;
  }
}

class AddExpression extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context) {
    return this.left.interpret(context) + this.right.interpret(context);
  }
}

class SubtractExpression extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context) {
    return this.left.interpret(context) - this.right.interpret(context);
  }
}

module.exports = { NumberExpression, AddExpression, SubtractExpression };
