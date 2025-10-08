const { NewsAgency, EmailSubscriber, SMSSubscriber } = require('./news-agency');

console.log('=== Observer Pattern Demo ===\n');

const agency = new NewsAgency();

const subscriber1 = new EmailSubscriber('john@example.com');
const subscriber2 = new EmailSubscriber('jane@example.com');
const subscriber3 = new SMSSubscriber('+1-555-0123');

agency.attach(subscriber1);
agency.attach(subscriber2);
agency.attach(subscriber3);

agency.publishNews('Breaking: New Design Pattern Released!');

agency.detach(subscriber2);

agency.publishNews('Update: Pattern Implementation Complete');

console.log('\n=== Demo Complete ===');
