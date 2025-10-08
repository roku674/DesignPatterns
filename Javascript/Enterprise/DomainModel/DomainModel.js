/**
 * Domain Model Pattern
 *
 * An object model of the domain that incorporates both behavior and data.
 * Rich domain objects with business logic encapsulated within them.
 *
 * Use when:
 * - You have complex business logic
 * - Domain logic is intricate and changes frequently
 * - You want object-oriented modeling of business rules
 */

/**
 * Account entity with business logic
 */
class Account {
  /**
   * @param {string} accountNumber
   * @param {number} balance
   * @param {string} accountType
   */
  constructor(accountNumber, balance = 0, accountType = 'CHECKING') {
    this.accountNumber = accountNumber;
    this.balance = balance;
    this.accountType = accountType;
    this.transactions = [];
    this.overdraftLimit = accountType === 'CHECKING' ? 500 : 0;
  }

  /**
   * Deposit money into account
   * @param {number} amount
   * @throws {Error} if amount is negative
   */
  deposit(amount) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this.balance += amount;
    this.transactions.push({
      type: 'DEPOSIT',
      amount,
      date: new Date(),
      balance: this.balance
    });
  }

  /**
   * Withdraw money from account
   * @param {number} amount
   * @throws {Error} if insufficient funds
   */
  withdraw(amount) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    if (!this.canWithdraw(amount)) {
      throw new Error('Insufficient funds');
    }

    this.balance -= amount;
    this.transactions.push({
      type: 'WITHDRAWAL',
      amount,
      date: new Date(),
      balance: this.balance
    });
  }

  /**
   * Check if withdrawal is allowed
   * @param {number} amount
   * @returns {boolean}
   */
  canWithdraw(amount) {
    return (this.balance + this.overdraftLimit) >= amount;
  }

  /**
   * Transfer money to another account
   * @param {Account} toAccount
   * @param {number} amount
   */
  transfer(toAccount, amount) {
    this.withdraw(amount);
    toAccount.deposit(amount);
  }

  /**
   * Calculate interest based on account type
   * @returns {number}
   */
  calculateInterest() {
    const rates = {
      'SAVINGS': 0.02,
      'CHECKING': 0.001,
      'MONEY_MARKET': 0.015
    };
    return this.balance * (rates[this.accountType] || 0);
  }

  /**
   * Get account statement
   * @returns {Object}
   */
  getStatement() {
    return {
      accountNumber: this.accountNumber,
      accountType: this.accountType,
      balance: this.balance,
      transactions: [...this.transactions]
    };
  }
}

/**
 * Customer entity with domain logic
 */
class Customer {
  /**
   * @param {string} customerId
   * @param {string} name
   * @param {string} email
   */
  constructor(customerId, name, email) {
    this.customerId = customerId;
    this.name = name;
    this.email = email;
    this.accounts = new Map();
    this.creditScore = 700;
  }

  /**
   * Add account to customer
   * @param {Account} account
   */
  addAccount(account) {
    this.accounts.set(account.accountNumber, account);
  }

  /**
   * Get total balance across all accounts
   * @returns {number}
   */
  getTotalBalance() {
    return Array.from(this.accounts.values())
      .reduce((sum, account) => sum + account.balance, 0);
  }

  /**
   * Check if customer is eligible for loan
   * @param {number} amount
   * @returns {boolean}
   */
  isEligibleForLoan(amount) {
    const totalBalance = this.getTotalBalance();
    const hasGoodCredit = this.creditScore >= 650;
    const hasCollateral = totalBalance >= amount * 0.2;

    return hasGoodCredit && hasCollateral;
  }

  /**
   * Update credit score based on payment history
   * @param {boolean} onTimePayment
   */
  updateCreditScore(onTimePayment) {
    if (onTimePayment) {
      this.creditScore = Math.min(850, this.creditScore + 5);
    } else {
      this.creditScore = Math.max(300, this.creditScore - 25);
    }
  }
}

/**
 * Loan entity with complex business rules
 */
class Loan {
  /**
   * @param {string} loanId
   * @param {Customer} customer
   * @param {number} principal
   * @param {number} interestRate
   * @param {number} termMonths
   */
  constructor(loanId, customer, principal, interestRate, termMonths) {
    this.loanId = loanId;
    this.customer = customer;
    this.principal = principal;
    this.interestRate = interestRate;
    this.termMonths = termMonths;
    this.remainingBalance = principal;
    this.payments = [];
    this.status = 'ACTIVE';
  }

  /**
   * Calculate monthly payment amount
   * @returns {number}
   */
  calculateMonthlyPayment() {
    const monthlyRate = this.interestRate / 12 / 100;
    const numerator = this.principal * monthlyRate * Math.pow(1 + monthlyRate, this.termMonths);
    const denominator = Math.pow(1 + monthlyRate, this.termMonths) - 1;
    return numerator / denominator;
  }

  /**
   * Make loan payment
   * @param {number} amount
   * @throws {Error} if payment is invalid
   */
  makePayment(amount) {
    if (this.status !== 'ACTIVE') {
      throw new Error('Loan is not active');
    }

    const monthlyPayment = this.calculateMonthlyPayment();
    if (amount < monthlyPayment * 0.5) {
      throw new Error('Payment below minimum amount');
    }

    const interest = this.remainingBalance * (this.interestRate / 12 / 100);
    const principalPayment = amount - interest;

    this.remainingBalance = Math.max(0, this.remainingBalance - principalPayment);
    this.payments.push({
      amount,
      interest,
      principal: principalPayment,
      remainingBalance: this.remainingBalance,
      date: new Date()
    });

    this.customer.updateCreditScore(true);

    if (this.remainingBalance === 0) {
      this.status = 'PAID_OFF';
    }
  }

  /**
   * Check if loan is in default
   * @returns {boolean}
   */
  isInDefault() {
    if (this.payments.length === 0) return false;

    const lastPayment = this.payments[this.payments.length - 1];
    const daysSinceLastPayment = (Date.now() - lastPayment.date.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastPayment > 60;
  }
}

export { Account, Customer, Loan };
