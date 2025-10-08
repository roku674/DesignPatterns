const { UserRepository } = require('./Repository');
const mockMapper = {
  findById: async (id) => ({ id, name: 'John', email: 'john@example.com' }),
  findAll: async () => [{ id: 1, name: 'John' }],
  save: async (e) => console.log('Saved:', e),
  delete: async (id) => console.log('Deleted:', id),
  findByEmail: async (email) => ({ id: 1, email })
};
(async () => {
  const repo = new UserRepository(mockMapper);
  const user1 = await repo.findById(1);
  const user2 = await repo.findById(1);
  console.log('Same object?', user1 === user2);
  const userByEmail = await repo.findByEmail('john@example.com');
  console.log('Found by email:', userByEmail);
})();