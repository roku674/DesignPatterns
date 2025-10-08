/**
 * Event Sourcing Pattern
 */

class Event {
  constructor(type, data) {
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();
  }
}

class EventStore {
  constructor() {
    this.events = [];
  }

  append(event) {
    this.events.push(event);
  }

  getEvents(aggregateId) {
    return this.events.filter(e => e.data.id === aggregateId);
  }

  getAllEvents() {
    return [...this.events];
  }
}

class BankAccount {
  constructor(id) {
    this.id = id;
    this.balance = 0;
    this.version = 0;
  }

  apply(event) {
    switch(event.type) {
      case 'AccountCreated':
        this.balance = event.data.initialBalance;
        break;
      case 'MoneyDeposited':
        this.balance += event.data.amount;
        break;
      case 'MoneyWithdrawn':
        this.balance -= event.data.amount;
        break;
    }
    this.version++;
  }

  static fromEvents(events) {
    const account = new BankAccount(events[0].data.id);
    events.forEach(event => account.apply(event));
    return account;
  }
}

module.exports = {
  Event,
  EventStore,
  BankAccount
};
