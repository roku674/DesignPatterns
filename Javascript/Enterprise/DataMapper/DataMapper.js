class DataMapper {
  constructor(database) { this.database = database; }
  async insert(entity) {
    const sql = this.buildInsertSQL(entity);
    return await this.database.execute(sql);
  }
  async update(entity) {
    const sql = this.buildUpdateSQL(entity);
    return await this.database.execute(sql);
  }
  async delete(id) {
    return await this.database.execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
  }
  async findById(id) {
    const row = await this.database.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return this.mapToEntity(row[0]);
  }
}
class UserMapper extends DataMapper {
  constructor(database) {
    super(database);
    this.tableName = 'users';
  }
  buildInsertSQL(user) {
    return { sql: `INSERT INTO users (name, email) VALUES (?, ?)`, params: [user.name, user.email] };
  }
  buildUpdateSQL(user) {
    return { sql: `UPDATE users SET name = ?, email = ? WHERE id = ?`, params: [user.name, user.email, user.id] };
  }
  mapToEntity(row) {
    if (!row) return null;
    return { id: row.id, name: row.name, email: row.email };
  }
}
module.exports = { DataMapper, UserMapper };