/**
 * Monitor Object Pattern Implementation in JavaScript
 *
 * The Monitor Object pattern synchronizes concurrent method execution to ensure
 * that only one method at a time runs within an object. It also allows an object's
 * methods to cooperatively schedule their execution sequences.
 *
 * Key Components:
 * - Monitor Lock: Ensures serialized access to an object's methods
 * - Monitor Condition: Allows threads to wait for conditions to become true
 * - Monitor Object: Combines synchronized methods with condition variables
 * - Synchronized Methods: Methods that acquire the monitor lock before execution
 */

const EventEmitter = require('events');

/**
 * Monitor Lock - Provides mutual exclusion
 */
class MonitorLock {
  constructor() {
    this.locked = false;
    this.waitQueue = [];
    this.owner = null;
  }

  async acquire(ownerId = null) {
    while (this.locked) {
      await new Promise(resolve => this.waitQueue.push(resolve));
    }

    this.locked = true;
    this.owner = ownerId;
  }

  release() {
    if (!this.locked) {
      throw new Error('Lock not held');
    }

    this.locked = false;
    this.owner = null;

    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift();
      resolve();
    }
  }

  isLocked() {
    return this.locked;
  }

  getOwner() {
    return this.owner;
  }
}

/**
 * Monitor Condition - Allows waiting for specific conditions
 */
class MonitorCondition {
  constructor(name) {
    this.name = name;
    this.waiters = [];
  }

  async wait(lock, timeout = null) {
    if (!lock.isLocked()) {
      throw new Error('Lock must be held to wait on condition');
    }

    lock.release();

    const waitPromise = new Promise(resolve => {
      this.waiters.push(resolve);
    });

    if (timeout) {
      await Promise.race([
        waitPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Condition wait timeout')), timeout)
        )
      ]);
    } else {
      await waitPromise;
    }

    await lock.acquire();
  }

  signal() {
    if (this.waiters.length > 0) {
      const resolve = this.waiters.shift();
      resolve();
    }
  }

  broadcast() {
    while (this.waiters.length > 0) {
      const resolve = this.waiters.shift();
      resolve();
    }
  }

  getWaiterCount() {
    return this.waiters.length;
  }
}

/**
 * Monitor Object - Base class for synchronized objects
 */
class MonitorObject {
  constructor(name) {
    this.name = name;
    this.lock = new MonitorLock();
    this.conditions = new Map();
  }

  createCondition(name) {
    const condition = new MonitorCondition(name);
    this.conditions.set(name, condition);
    return condition;
  }

  getCondition(name) {
    return this.conditions.get(name);
  }

  async synchronized(methodName, method, ...args) {
    await this.lock.acquire(methodName);

    try {
      return await method.apply(this, args);
    } finally {
      this.lock.release();
    }
  }
}

/**
 * Bounded Buffer - Classic producer-consumer example
 */
class BoundedBuffer extends MonitorObject {
  constructor(name, capacity) {
    super(name);
    this.capacity = capacity;
    this.buffer = [];
    this.notEmpty = this.createCondition('notEmpty');
    this.notFull = this.createCondition('notFull');
    this.putCount = 0;
    this.getCount = 0;
  }

  async put(item) {
    return this.synchronized('put', async function() {
      while (this.buffer.length >= this.capacity) {
        console.log(`[${this.name}] Buffer full, waiting...`);
        await this.notFull.wait(this.lock);
      }

      this.buffer.push(item);
      this.putCount++;
      console.log(`[${this.name}] Put item ${item}, size: ${this.buffer.length}/${this.capacity}`);

      this.notEmpty.signal();
      return true;
    });
  }

  async get() {
    return this.synchronized('get', async function() {
      while (this.buffer.length === 0) {
        console.log(`[${this.name}] Buffer empty, waiting...`);
        await this.notEmpty.wait(this.lock);
      }

      const item = this.buffer.shift();
      this.getCount++;
      console.log(`[${this.name}] Got item ${item}, size: ${this.buffer.length}/${this.capacity}`);

      this.notFull.signal();
      return item;
    });
  }

  async size() {
    return this.synchronized('size', async function() {
      return this.buffer.length;
    });
  }

  async isEmpty() {
    return this.synchronized('isEmpty', async function() {
      return this.buffer.length === 0;
    });
  }

  async isFull() {
    return this.synchronized('isFull', async function() {
      return this.buffer.length >= this.capacity;
    });
  }

  async getStats() {
    return this.synchronized('getStats', async function() {
      return {
        size: this.buffer.length,
        capacity: this.capacity,
        putCount: this.putCount,
        getCount: this.getCount
      };
    });
  }
}

/**
 * Read-Write Lock - Multiple readers, single writer
 */
class ReadWriteLock extends MonitorObject {
  constructor(name) {
    super(name);
    this.readers = 0;
    this.writers = 0;
    this.writeRequests = 0;
    this.canRead = this.createCondition('canRead');
    this.canWrite = this.createCondition('canWrite');
  }

  async acquireReadLock() {
    return this.synchronized('acquireReadLock', async function() {
      while (this.writers > 0 || this.writeRequests > 0) {
        await this.canRead.wait(this.lock);
      }

      this.readers++;
      console.log(`[${this.name}] Read lock acquired, readers: ${this.readers}`);
    });
  }

  async releaseReadLock() {
    return this.synchronized('releaseReadLock', async function() {
      this.readers--;
      console.log(`[${this.name}] Read lock released, readers: ${this.readers}`);

      if (this.readers === 0) {
        this.canWrite.signal();
      }
    });
  }

  async acquireWriteLock() {
    return this.synchronized('acquireWriteLock', async function() {
      this.writeRequests++;

      while (this.readers > 0 || this.writers > 0) {
        await this.canWrite.wait(this.lock);
      }

      this.writeRequests--;
      this.writers++;
      console.log(`[${this.name}] Write lock acquired`);
    });
  }

  async releaseWriteLock() {
    return this.synchronized('releaseWriteLock', async function() {
      this.writers--;
      console.log(`[${this.name}] Write lock released`);

      if (this.writeRequests > 0) {
        this.canWrite.signal();
      } else {
        this.canRead.broadcast();
      }
    });
  }

  async getStats() {
    return this.synchronized('getStats', async function() {
      return {
        readers: this.readers,
        writers: this.writers,
        writeRequests: this.writeRequests
      };
    });
  }
}

/**
 * Thread-Safe Counter
 */
class Counter extends MonitorObject {
  constructor(name, initialValue = 0) {
    super(name);
    this.value = initialValue;
    this.incrementCount = 0;
    this.decrementCount = 0;
  }

  async increment() {
    return this.synchronized('increment', async function() {
      this.value++;
      this.incrementCount++;
      console.log(`[${this.name}] Incremented to ${this.value}`);
      return this.value;
    });
  }

  async decrement() {
    return this.synchronized('decrement', async function() {
      this.value--;
      this.decrementCount++;
      console.log(`[${this.name}] Decremented to ${this.value}`);
      return this.value;
    });
  }

  async get() {
    return this.synchronized('get', async function() {
      return this.value;
    });
  }

  async set(newValue) {
    return this.synchronized('set', async function() {
      this.value = newValue;
      console.log(`[${this.name}] Set to ${this.value}`);
      return this.value;
    });
  }

  async reset() {
    return this.synchronized('reset', async function() {
      this.value = 0;
      console.log(`[${this.name}] Reset to 0`);
      return 0;
    });
  }
}

/**
 * Thread-Safe Queue
 */
class ThreadSafeQueue extends MonitorObject {
  constructor(name, maxSize = Infinity) {
    super(name);
    this.queue = [];
    this.maxSize = maxSize;
    this.notEmpty = this.createCondition('notEmpty');
    this.notFull = this.createCondition('notFull');
  }

  async enqueue(item) {
    return this.synchronized('enqueue', async function() {
      while (this.queue.length >= this.maxSize) {
        await this.notFull.wait(this.lock);
      }

      this.queue.push(item);
      console.log(`[${this.name}] Enqueued ${item}, size: ${this.queue.length}`);

      this.notEmpty.signal();
      return true;
    });
  }

  async dequeue() {
    return this.synchronized('dequeue', async function() {
      while (this.queue.length === 0) {
        await this.notEmpty.wait(this.lock);
      }

      const item = this.queue.shift();
      console.log(`[${this.name}] Dequeued ${item}, size: ${this.queue.length}`);

      this.notFull.signal();
      return item;
    });
  }

  async size() {
    return this.synchronized('size', async function() {
      return this.queue.length;
    });
  }

  async isEmpty() {
    return this.synchronized('isEmpty', async function() {
      return this.queue.length === 0;
    });
  }
}

/**
 * Semaphore
 */
class Semaphore extends MonitorObject {
  constructor(name, permits) {
    super(name);
    this.permits = permits;
    this.available = this.createCondition('available');
  }

  async acquire(count = 1) {
    return this.synchronized('acquire', async function() {
      while (this.permits < count) {
        await this.available.wait(this.lock);
      }

      this.permits -= count;
      console.log(`[${this.name}] Acquired ${count} permit(s), ${this.permits} remaining`);
    });
  }

  async release(count = 1) {
    return this.synchronized('release', async function() {
      this.permits += count;
      console.log(`[${this.name}] Released ${count} permit(s), ${this.permits} available`);

      this.available.broadcast();
    });
  }

  async availablePermits() {
    return this.synchronized('availablePermits', async function() {
      return this.permits;
    });
  }
}

/**
 * Barrier
 */
class Barrier extends MonitorObject {
  constructor(name, parties) {
    super(name);
    this.parties = parties;
    this.waiting = 0;
    this.generation = 0;
    this.allArrived = this.createCondition('allArrived');
  }

  async await() {
    return this.synchronized('await', async function() {
      const myGeneration = this.generation;
      this.waiting++;

      console.log(`[${this.name}] Thread arrived, ${this.waiting}/${this.parties} waiting`);

      if (this.waiting === this.parties) {
        console.log(`[${this.name}] All threads arrived, releasing barrier`);
        this.waiting = 0;
        this.generation++;
        this.allArrived.broadcast();
      } else {
        while (this.generation === myGeneration) {
          await this.allArrived.wait(this.lock);
        }
      }
    });
  }

  async getWaiting() {
    return this.synchronized('getWaiting', async function() {
      return this.waiting;
    });
  }
}

/**
 * Account with transfer capability
 */
class BankAccount extends MonitorObject {
  constructor(name, accountNumber, initialBalance = 0) {
    super(name);
    this.accountNumber = accountNumber;
    this.balance = initialBalance;
    this.transactions = [];
  }

  async deposit(amount) {
    return this.synchronized('deposit', async function() {
      if (amount <= 0) {
        throw new Error('Deposit amount must be positive');
      }

      this.balance += amount;
      this.transactions.push({ type: 'deposit', amount, balance: this.balance });
      console.log(`[${this.name}] Deposited $${amount}, balance: $${this.balance}`);

      return this.balance;
    });
  }

  async withdraw(amount) {
    return this.synchronized('withdraw', async function() {
      if (amount <= 0) {
        throw new Error('Withdrawal amount must be positive');
      }

      if (amount > this.balance) {
        throw new Error('Insufficient funds');
      }

      this.balance -= amount;
      this.transactions.push({ type: 'withdraw', amount, balance: this.balance });
      console.log(`[${this.name}] Withdrew $${amount}, balance: $${this.balance}`);

      return this.balance;
    });
  }

  async getBalance() {
    return this.synchronized('getBalance', async function() {
      return this.balance;
    });
  }

  async transfer(targetAccount, amount) {
    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    await this.withdraw(amount);
    await targetAccount.deposit(amount);

    console.log(`[${this.name}] Transferred $${amount} to ${targetAccount.name}`);
  }
}

/**
 * Example Usage and Demonstrations
 */

async function demonstrateBoundedBuffer() {
  console.log('\n=== Bounded Buffer Demo ===\n');

  const buffer = new BoundedBuffer('Buffer-1', 3);

  const producer = async (id, items) => {
    for (const item of items) {
      await buffer.put(`${id}-${item}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const consumer = async (id, count) => {
    for (let i = 0; i < count; i++) {
      const item = await buffer.get();
      await new Promise(resolve => setTimeout(resolve, 70));
    }
  };

  Promise.all([
    producer('P1', [1, 2, 3]),
    producer('P2', [4, 5, 6]),
    consumer('C1', 6)
  ]);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const stats = await buffer.getStats();
  console.log(`\nBuffer stats:`, stats);
}

async function demonstrateReadWriteLock() {
  console.log('\n=== Read-Write Lock Demo ===\n');

  const rwLock = new ReadWriteLock('RWLock-1');
  let sharedData = 0;

  const reader = async (id) => {
    await rwLock.acquireReadLock();
    console.log(`Reader ${id} reads: ${sharedData}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    await rwLock.releaseReadLock();
  };

  const writer = async (id, value) => {
    await rwLock.acquireWriteLock();
    sharedData = value;
    console.log(`Writer ${id} writes: ${value}`);
    await new Promise(resolve => setTimeout(resolve, 150));
    await rwLock.releaseWriteLock();
  };

  Promise.all([
    reader('R1'),
    reader('R2'),
    writer('W1', 42),
    reader('R3'),
    writer('W2', 100)
  ]);

  await new Promise(resolve => setTimeout(resolve, 1000));
}

async function demonstrateCounter() {
  console.log('\n=== Thread-Safe Counter Demo ===\n');

  const counter = new Counter('Counter-1', 0);

  const incrementer = async (count) => {
    for (let i = 0; i < count; i++) {
      await counter.increment();
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  };

  const decrementer = async (count) => {
    for (let i = 0; i < count; i++) {
      await counter.decrement();
      await new Promise(resolve => setTimeout(resolve, 40));
    }
  };

  await Promise.all([
    incrementer(5),
    incrementer(5),
    decrementer(3)
  ]);

  const finalValue = await counter.get();
  console.log(`\nFinal counter value: ${finalValue}`);
}

async function demonstrateSemaphore() {
  console.log('\n=== Semaphore Demo ===\n');

  const semaphore = new Semaphore('Semaphore-1', 2);

  const task = async (id) => {
    console.log(`Task ${id} waiting for permit...`);
    await semaphore.acquire();
    console.log(`Task ${id} executing...`);
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log(`Task ${id} done`);
    await semaphore.release();
  };

  await Promise.all([
    task(1),
    task(2),
    task(3),
    task(4)
  ]);
}

async function demonstrateBarrier() {
  console.log('\n=== Barrier Demo ===\n');

  const barrier = new Barrier('Barrier-1', 3);

  const worker = async (id) => {
    console.log(`Worker ${id} doing initial work...`);
    await new Promise(resolve => setTimeout(resolve, 100 * id));
    console.log(`Worker ${id} reaching barrier...`);
    await barrier.await();
    console.log(`Worker ${id} proceeding after barrier`);
  };

  await Promise.all([
    worker(1),
    worker(2),
    worker(3)
  ]);
}

async function demonstrateBankTransfer() {
  console.log('\n=== Bank Account Transfer Demo ===\n');

  const account1 = new BankAccount('Account-1', 'ACC001', 1000);
  const account2 = new BankAccount('Account-2', 'ACC002', 500);

  await account1.transfer(account2, 200);
  await account2.transfer(account1, 100);

  const balance1 = await account1.getBalance();
  const balance2 = await account2.getBalance();

  console.log(`\nFinal balances: Account-1=$${balance1}, Account-2=$${balance2}`);
}

async function runAllDemos() {
  await demonstrateBoundedBuffer();
  await demonstrateReadWriteLock();
  await demonstrateCounter();
  await demonstrateSemaphore();
  await demonstrateBarrier();
  await demonstrateBankTransfer();
}

if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  MonitorObject,
  MonitorLock,
  MonitorCondition,
  BoundedBuffer,
  ReadWriteLock,
  Counter,
  ThreadSafeQueue,
  Semaphore,
  Barrier,
  BankAccount
};
