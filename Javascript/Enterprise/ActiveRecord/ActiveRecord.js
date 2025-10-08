class ActiveRecord {
  constructor(data = {}) {
    Object.assign(this, data);
    this.isDirty = false;
  }
  static async find(id) {
    const row = await this.database.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return row[0] ? new this(row[0]) : null;
  }
  static async findAll() {
    const rows = await this.database.query(`SELECT * FROM ${this.tableName}`);
    return rows.map(row => new this(row));
  }
  async save() {
    if (this.id) {
      await this.update();
    } else {
      await this.insert();
    }
    this.isDirty = false;
  }
  async insert() {
    const result = await this.constructor.database.execute(this.buildInsertSQL());
    this.id = result.insertId;
  }
  async update() {
    await this.constructor.database.execute(this.buildUpdateSQL());
  }
  async delete() {
    await this.constructor.database.execute(`DELETE FROM ${this.constructor.tableName} WHERE id = ?`, [this.id]);
  }
}
class User extends ActiveRecord {
  static tableName = 'users';
  static database = null;
  buildInsertSQL() {
    return { sql: `INSERT INTO users (name, email) VALUES (?, ?)`, params: [this.name, this.email] };
  }
  buildUpdateSQL() {
    return { sql: `UPDATE users SET name = ?, email = ? WHERE id = ?`, params: [this.name, this.email, this.id] };
  }
}
module.exports = { ActiveRecord, User };