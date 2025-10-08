/**
 * Lazy Load Pattern
 */

class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this._orders = null;
  }

  get orders() {
    if (this._orders === null) {
      console.log(`   [Lazy Load] Loading orders for user ${this.id}`);
      this._orders = this.loadOrders();
    }
    return this._orders;
  }

  loadOrders() {
    return [
      { id: '1', total: 99.99 },
      { id: '2', total: 149.99 }
    ];
  }
}

class VirtualProxy {
  constructor(loader) {
    this.loader = loader;
    this._realObject = null;
  }

  get realObject() {
    if (this._realObject === null) {
      console.log('   [Virtual Proxy] Loading real object');
      this._realObject = this.loader();
    }
    return this._realObject;
  }

  getData() {
    return this.realObject.getData();
  }
}

class ExpensiveObject {
  constructor() {
    console.log('   [ExpensiveObject] Expensive initialization');
  }

  getData() {
    return 'Expensive data';
  }
}

module.exports = {
  User,
  VirtualProxy,
  ExpensiveObject
};
