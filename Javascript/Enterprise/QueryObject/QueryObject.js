/**
 * Query Object Pattern
 */

class QueryObject {
  constructor() {
    this.criteria = [];
  }

  where(field, operator, value) {
    this.criteria.push({ field, operator, value });
    return this;
  }

  build() {
    return this.criteria.map(c => 
      `${c.field} ${c.operator} ${this.formatValue(c.value)}`
    ).join(' AND ');
  }

  formatValue(value) {
    return typeof value === 'string' ? `'${value}'` : value;
  }
}

class UserQuery extends QueryObject {
  byEmail(email) {
    return this.where('email', '=', email);
  }

  byStatus(status) {
    return this.where('status', '=', status);
  }

  olderThan(age) {
    return this.where('age', '>', age);
  }
}

module.exports = {
  QueryObject,
  UserQuery
};
