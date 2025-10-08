const { User } = require('./ActiveRecord');
User.database = {
  query: async (sql, params) => params ? [{ id: params[0], name: 'John', email: 'john@example.com' }] : [],
  execute: async (sql) => ({ insertId: 1 })
};
(async () => {
  const user = await User.find(1);
  console.log('Found:', user);
  user.name = 'John Doe';
  await user.save();
  console.log('Updated user');
})();