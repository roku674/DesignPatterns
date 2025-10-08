/**
 * Table Data Gateway Pattern
 */

class PersonGateway {
  constructor() {
    this.persons = new Map([
      [1, { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }],
      [2, { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }]
    ]);
    this.nextId = 3;
  }

  findAll() {
    console.log('   [DB] SELECT * FROM persons');
    return Array.from(this.persons.values());
  }

  findById(id) {
    console.log(`   [DB] SELECT * FROM persons WHERE id = ${id}`);
    return this.persons.get(id);
  }

  insert(firstName, lastName, email) {
    const id = this.nextId++;
    const person = { id, firstName, lastName, email };
    console.log(`   [DB] INSERT INTO persons VALUES (${id}, '${firstName}', '${lastName}', '${email}')`);
    this.persons.set(id, person);
    return person;
  }

  update(id, firstName, lastName, email) {
    console.log(`   [DB] UPDATE persons SET firstName='${firstName}', lastName='${lastName}', email='${email}' WHERE id=${id}`);
    this.persons.set(id, { id, firstName, lastName, email });
  }

  delete(id) {
    console.log(`   [DB] DELETE FROM persons WHERE id = ${id}`);
    this.persons.delete(id);
  }
}

module.exports = { PersonGateway };
