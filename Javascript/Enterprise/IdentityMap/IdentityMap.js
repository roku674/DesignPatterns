/**
 * Identity Map Pattern
 */

class IdentityMap {
  constructor() {
    this.map = new Map();
  }

  get(id) {
    return this.map.get(id);
  }

  put(id, object) {
    this.map.set(id, object);
  }

  has(id) {
    return this.map.has(id);
  }

  remove(id) {
    this.map.delete(id);
  }

  clear() {
    this.map.clear();
  }
}

class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

class UserRepository {
  constructor() {
    this.identityMap = new IdentityMap();
    this.database = new Map([
      ['1', { id: '1', name: 'John', email: 'john@example.com' }],
      ['2', { id: '2', name: 'Jane', email: 'jane@example.com' }]
    ]);
  }

  findById(id) {
    if (this.identityMap.has(id)) {
      console.log(`   [Cache Hit] User ${id} found in Identity Map`);
      return this.identityMap.get(id);
    }

    console.log(`   [Cache Miss] Loading User ${id} from database`);
    const data = this.database.get(id);
    if (data) {
      const user = new User(data.id, data.name, data.email);
      this.identityMap.put(id, user);
      return user;
    }
    return null;
  }
}

module.exports = {
  IdentityMap,
  User,
  UserRepository
};
