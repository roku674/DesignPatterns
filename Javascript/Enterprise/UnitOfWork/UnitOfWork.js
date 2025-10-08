/**
 * Unit of Work Pattern
 *
 * Maintains a list of objects affected by a business transaction and coordinates
 * the writing out of changes and resolution of concurrency problems.
 */

class UnitOfWork {
  constructor() {
    this.newObjects = new Set();
    this.dirtyObjects = new Set();
    this.removedObjects = new Set();
    this.identityMap = new Map();
  }

  /**
   * Register new object
   */
  registerNew(entity) {
    if (this.removedObjects.has(entity)) {
      throw new Error('Cannot register removed object as new');
    }
    if (this.dirtyObjects.has(entity)) {
      throw new Error('Cannot register dirty object as new');
    }
    if (!this.newObjects.has(entity)) {
      this.newObjects.add(entity);
    }
  }

  /**
   * Register dirty (modified) object
   */
  registerDirty(entity) {
    if (!this.removedObjects.has(entity) && !this.newObjects.has(entity)) {
      this.dirtyObjects.add(entity);
    }
  }

  /**
   * Register removed object
   */
  registerRemoved(entity) {
    if (this.newObjects.has(entity)) {
      this.newObjects.delete(entity);
      return;
    }
    this.dirtyObjects.delete(entity);
    if (!this.removedObjects.has(entity)) {
      this.removedObjects.add(entity);
    }
  }

  /**
   * Register clean object in identity map
   */
  registerClean(entity, id) {
    this.identityMap.set(id, entity);
  }

  /**
   * Get from identity map
   */
  getFromIdentityMap(id) {
    return this.identityMap.get(id);
  }

  /**
   * Commit all changes
   */
  async commit(database) {
    const transaction = await database.beginTransaction();

    try {
      // Insert new objects
      for (const entity of this.newObjects) {
        await this.insertEntity(entity, database, transaction);
      }

      // Update dirty objects
      for (const entity of this.dirtyObjects) {
        await this.updateEntity(entity, database, transaction);
      }

      // Delete removed objects
      for (const entity of this.removedObjects) {
        await this.deleteEntity(entity, database, transaction);
      }

      await transaction.commit();

      // Move new objects to identity map
      for (const entity of this.newObjects) {
        this.identityMap.set(entity.id, entity);
      }

      // Clear change sets
      this.newObjects.clear();
      this.dirtyObjects.clear();
      this.removedObjects.clear();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async insertEntity(entity, database, transaction) {
    const mapper = this.getMapperFor(entity);
    await mapper.insert(entity, database, transaction);
  }

  async updateEntity(entity, database, transaction) {
    const mapper = this.getMapperFor(entity);
    await mapper.update(entity, database, transaction);
  }

  async deleteEntity(entity, database, transaction) {
    const mapper = this.getMapperFor(entity);
    await mapper.delete(entity, database, transaction);
  }

  getMapperFor(entity) {
    // Simplified - in real implementation, use mapper registry
    return {
      insert: async (e, db, txn) => {
        console.log(`[UnitOfWork] Inserting ${entity.constructor.name}:`, e);
        e.id = Date.now();
      },
      update: async (e, db, txn) => {
        console.log(`[UnitOfWork] Updating ${entity.constructor.name}:`, e);
      },
      delete: async (e, db, txn) => {
        console.log(`[UnitOfWork] Deleting ${entity.constructor.name}:`, e);
      }
    };
  }

  /**
   * Rollback all changes
   */
  rollback() {
    this.newObjects.clear();
    this.dirtyObjects.clear();
    this.removedObjects.clear();
  }
}

/**
 * Example domain entity that works with UnitOfWork
 */
class Customer {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

class Order {
  constructor(id, customerId, total) {
    this.id = id;
    this.customerId = customerId;
    this.total = total;
  }
}

module.exports = {
  UnitOfWork,
  Customer,
  Order
};
