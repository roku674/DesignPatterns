/**
 * Interpreter Pattern - Mathematical Expression Parser and Evaluator
 *
 * Production-ready implementation that parses and evaluates mathematical expressions
 * with support for variables, functions, and operator precedence.
 */

/**
 * Base Expression class
 */
class Expression {
  interpret(context) {
    throw new Error('interpret() must be implemented');
  }
}

/**
 * Number literal expression
 */
class NumberExpression extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }

  interpret(context) {
    return this.value;
  }

  toString() {
    return this.value.toString();
  }
}

/**
 * Variable expression - reads from context
 */
class VariableExpression extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }

  interpret(context) {
    if (!(this.name in context.variables)) {
      throw new Error(`Undefined variable: ${this.name}`);
    }
    return context.variables[this.name];
  }

  toString() {
    return this.name;
  }
}

/**
 * Binary operation expressions
 */
class AddExpression extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context) {
    return this.left.interpret(context) + this.right.interpret(context);
  }

  toString() {
    return `(${this.left} + ${this.right})`;
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

  toString() {
    return `(${this.left} - ${this.right})`;
  }
}

class MultiplyExpression extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context) {
    return this.left.interpret(context) * this.right.interpret(context);
  }

  toString() {
    return `(${this.left} * ${this.right})`;
  }
}

class DivideExpression extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context) {
    const divisor = this.right.interpret(context);
    if (divisor === 0) {
      throw new Error('Division by zero');
    }
    return this.left.interpret(context) / divisor;
  }

  toString() {
    return `(${this.left} / ${this.right})`;
  }
}

class PowerExpression extends Expression {
  constructor(base, exponent) {
    super();
    this.base = base;
    this.exponent = exponent;
  }

  interpret(context) {
    return Math.pow(this.base.interpret(context), this.exponent.interpret(context));
  }

  toString() {
    return `(${this.base} ^ ${this.exponent})`;
  }
}

class ModuloExpression extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context) {
    return this.left.interpret(context) % this.right.interpret(context);
  }

  toString() {
    return `(${this.left} % ${this.right})`;
  }
}

/**
 * Function call expression
 */
class FunctionExpression extends Expression {
  constructor(name, args) {
    super();
    this.name = name;
    this.args = args;
  }

  interpret(context) {
    if (!(this.name in context.functions)) {
      throw new Error(`Undefined function: ${this.name}`);
    }

    const argValues = this.args.map(arg => arg.interpret(context));
    return context.functions[this.name](...argValues);
  }

  toString() {
    return `${this.name}(${this.args.join(', ')})`;
  }
}

/**
 * Negation expression
 */
class NegateExpression extends Expression {
  constructor(expression) {
    super();
    this.expression = expression;
  }

  interpret(context) {
    return -this.expression.interpret(context);
  }

  toString() {
    return `(-${this.expression})`;
  }
}

/**
 * Execution context with variables and functions
 */
class Context {
  constructor() {
    this.variables = {};
    this.functions = {
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      sqrt: Math.sqrt,
      abs: Math.abs,
      floor: Math.floor,
      ceil: Math.ceil,
      round: Math.round,
      log: Math.log,
      exp: Math.exp,
      min: Math.min,
      max: Math.max
    };
  }

  setVariable(name, value) {
    this.variables[name] = value;
  }

  getVariable(name) {
    return this.variables[name];
  }

  setFunction(name, func) {
    this.functions[name] = func;
  }
}

/**
 * Tokenizer - converts string to tokens
 */
class Tokenizer {
  constructor(expression) {
    this.expression = expression.replace(/\s+/g, '');
    this.position = 0;
  }

  peek() {
    return this.position < this.expression.length ? this.expression[this.position] : null;
  }

  consume() {
    return this.expression[this.position++];
  }

  hasMore() {
    return this.position < this.expression.length;
  }

  consumeNumber() {
    let number = '';
    while (this.hasMore() && /[\d.]/.test(this.peek())) {
      number += this.consume();
    }
    return parseFloat(number);
  }

  consumeIdentifier() {
    let identifier = '';
    while (this.hasMore() && /[a-zA-Z_]/.test(this.peek())) {
      identifier += this.consume();
    }
    return identifier;
  }
}

/**
 * Parser - converts tokens to expression tree
 */
class Parser {
  constructor(expression) {
    this.tokenizer = new Tokenizer(expression);
  }

  parse() {
    return this.parseExpression();
  }

  parseExpression() {
    return this.parseAddSubtract();
  }

  parseAddSubtract() {
    let left = this.parseMultiplyDivide();

    while (this.tokenizer.hasMore()) {
      const char = this.tokenizer.peek();

      if (char === '+') {
        this.tokenizer.consume();
        const right = this.parseMultiplyDivide();
        left = new AddExpression(left, right);
      } else if (char === '-' && this.tokenizer.position > 0) {
        this.tokenizer.consume();
        const right = this.parseMultiplyDivide();
        left = new SubtractExpression(left, right);
      } else {
        break;
      }
    }

    return left;
  }

  parseMultiplyDivide() {
    let left = this.parsePower();

    while (this.tokenizer.hasMore()) {
      const char = this.tokenizer.peek();

      if (char === '*') {
        this.tokenizer.consume();
        const right = this.parsePower();
        left = new MultiplyExpression(left, right);
      } else if (char === '/') {
        this.tokenizer.consume();
        const right = this.parsePower();
        left = new DivideExpression(left, right);
      } else if (char === '%') {
        this.tokenizer.consume();
        const right = this.parsePower();
        left = new ModuloExpression(left, right);
      } else {
        break;
      }
    }

    return left;
  }

  parsePower() {
    let left = this.parsePrimary();

    if (this.tokenizer.hasMore() && this.tokenizer.peek() === '^') {
      this.tokenizer.consume();
      const right = this.parsePower();
      return new PowerExpression(left, right);
    }

    return left;
  }

  parsePrimary() {
    const char = this.tokenizer.peek();

    if (!char) {
      throw new Error('Unexpected end of expression');
    }

    if (char === '(') {
      this.tokenizer.consume();
      const expr = this.parseExpression();
      if (this.tokenizer.consume() !== ')') {
        throw new Error('Expected closing parenthesis');
      }
      return expr;
    }

    if (char === '-') {
      this.tokenizer.consume();
      return new NegateExpression(this.parsePrimary());
    }

    if (/\d/.test(char)) {
      return new NumberExpression(this.tokenizer.consumeNumber());
    }

    if (/[a-zA-Z]/.test(char)) {
      const identifier = this.tokenizer.consumeIdentifier();

      if (this.tokenizer.peek() === '(') {
        this.tokenizer.consume();
        const args = this.parseFunctionArgs();
        if (this.tokenizer.consume() !== ')') {
          throw new Error('Expected closing parenthesis');
        }
        return new FunctionExpression(identifier, args);
      }

      return new VariableExpression(identifier);
    }

    throw new Error(`Unexpected character: ${char}`);
  }

  parseFunctionArgs() {
    const args = [];

    if (this.tokenizer.peek() === ')') {
      return args;
    }

    args.push(this.parseExpression());

    while (this.tokenizer.peek() === ',') {
      this.tokenizer.consume();
      args.push(this.parseExpression());
    }

    return args;
  }
}

/**
 * Expression Evaluator - main interface
 */
class ExpressionEvaluator {
  constructor() {
    this.context = new Context();
  }

  setVariable(name, value) {
    this.context.setVariable(name, value);
    return this;
  }

  setFunction(name, func) {
    this.context.setFunction(name, func);
    return this;
  }

  evaluate(expression) {
    const parser = new Parser(expression);
    const ast = parser.parse();
    return ast.interpret(this.context);
  }

  parse(expression) {
    const parser = new Parser(expression);
    return parser.parse();
  }
}

module.exports = {
  Expression,
  NumberExpression,
  VariableExpression,
  AddExpression,
  SubtractExpression,
  MultiplyExpression,
  DivideExpression,
  PowerExpression,
  ModuloExpression,
  FunctionExpression,
  NegateExpression,
  Context,
  Parser,
  ExpressionEvaluator
};
