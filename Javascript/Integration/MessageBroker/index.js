const MessageBroker = require('./MessageBroker');

const broker = new MessageBroker();

broker.createChannel('orders');
broker.createChannel('notifications');

broker.subscribe('orders', 'OrderService', async (msg) => {
  console.log('[OrderService] Processing:', msg.data);
});

broker.subscribe('notifications', 'EmailService', async (msg) => {
  console.log('[EmailService] Sending:', msg.data);
});

broker.addRoutingRule(
  (msg) => msg.data && msg.data.urgent,
  'notifications'
);

(async () => {
  await broker.publish('orders', { data: { orderId: 'ORD-001', urgent: true } });
  console.log('Stats:', broker.getChannelStats('orders'));
})();
