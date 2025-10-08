/**
 * Row Data Gateway Pattern
 */

class PersonGateway {
  constructor(id, firstName, lastName, email) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }

  insert() {
    console.log(`   [DB] INSERT INTO persons VALUES (${this.id}, '${this.firstName}', '${this.lastName}', '${this.email}')`);
    return this;
  }

  update() {
    console.log(`   [DB] UPDATE persons SET firstName='${this.firstName}', lastName='${this.lastName}', email='${this.email}' WHERE id=${this.id}`);
    return this;
  }

  delete() {
    console.log(`   [DB] DELETE FROM persons WHERE id=${this.id}`);
  }

  static find(id) {
    console.log(`   [DB] SELECT * FROM persons WHERE id=${id}`);
    return new PersonGateway(id, 'John', 'Doe', 'john@example.com');
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

module.exports = { PersonGateway };
