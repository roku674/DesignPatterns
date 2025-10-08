const { UserMapper } = require('./DataMapper');
const mockDb = {
  execute: async (sql) => console.log('Execute:', sql),
  query: async (sql, params) => [{ id: params[0], name: 'John', email: 'john@example.com' }]
};
(async () => {
  const mapper = new UserMapper(mockDb);
  const user = await mapper.findById(1);
  console.log('Found user:', user);
  await mapper.update({ id: 1, name: 'John Doe', email: 'john.doe@example.com' });
})();