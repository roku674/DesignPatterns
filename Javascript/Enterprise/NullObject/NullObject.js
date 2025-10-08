/**
 * Null Object Pattern
 */

class Logger {
  log(message) {
    throw new Error('Must implement log');
  }
}

class ConsoleLogger extends Logger {
  log(message) {
    console.log(`[LOG] ${message}`);
  }
}

class NullLogger extends Logger {
  log(message) {
    // Do nothing
  }
}

class UserService {
  constructor(logger = new NullLogger()) {
    this.logger = logger;
  }

  createUser(username) {
    this.logger.log(`Creating user: ${username}`);
    return { id: 1, username };
  }
}

module.exports = {
  ConsoleLogger,
  NullLogger,
  UserService
};
