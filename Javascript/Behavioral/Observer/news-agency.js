/**
 * Observer Pattern - News Agency
 */

class Subject {
  constructor() {
    this.observers = [];
  }

  attach(observer) {
    this.observers.push(observer);
  }

  detach(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class NewsAgency extends Subject {
  publishNews(news) {
    console.log(`\n[NewsAgency] Publishing: "${news}"`);
    this.notify(news);
  }
}

class Observer {
  update(data) {
    throw new Error('update() must be implemented');
  }
}

class EmailSubscriber extends Observer {
  constructor(email) {
    super();
    this.email = email;
  }

  update(news) {
    console.log(`  📧 Email to ${this.email}: ${news}`);
  }
}

class SMSSubscriber extends Observer {
  constructor(phone) {
    super();
    this.phone = phone;
  }

  update(news) {
    console.log(`  📱 SMS to ${this.phone}: ${news}`);
  }
}

module.exports = { NewsAgency, EmailSubscriber, SMSSubscriber };
