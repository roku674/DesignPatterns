/**
 * Builder Pattern - Production Implementation
 * Real HTTP request builder and SQL query builder
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const querystring = require('querystring');

/**
 * Product: HTTPRequest
 * Complex HTTP request object
 */
class HTTPRequest {
  constructor() {
    this.method = 'GET';
    this.url = null;
    this.headers = {};
    this.body = null;
    this.timeout = 30000;
    this.retries = 0;
    this.followRedirects = true;
    this.validateStatus = null;
    this.auth = null;
    this.proxy = null;
    this.queryParams = {};
  }

  async execute() {
    if (!this.url) {
      throw new Error('URL is required');
    }

    const parsedUrl = new URL(this.url);

    // Add query parameters
    if (Object.keys(this.queryParams).length > 0) {
      const qs = querystring.stringify(this.queryParams);
      parsedUrl.search = qs;
    }

    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: this.method,
      headers: this.headers,
      timeout: this.timeout
    };

    // Add authentication
    if (this.auth) {
      const authString = Buffer.from(`${this.auth.username}:${this.auth.password}`).toString('base64');
      options.headers['Authorization'] = `Basic ${authString}`;
    }

    let attempt = 0;
    const maxAttempts = this.retries + 1;

    while (attempt < maxAttempts) {
      try {
        return await this.makeRequest(protocol, options);
      } catch (error) {
        attempt++;
        if (attempt >= maxAttempts) {
          throw error;
        }
        await this.delay(1000 * attempt); // Exponential backoff
      }
    }
  }

  makeRequest(protocol, options) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const req = protocol.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const responseTime = Date.now() - startTime;

          // Validate status if validator provided
          if (this.validateStatus && !this.validateStatus(res.statusCode)) {
            reject(new Error(`Request failed with status ${res.statusCode}`));
            return;
          }

          let parsedData = data;
          const contentType = res.headers['content-type'] || '';

          if (contentType.includes('application/json')) {
            try {
              parsedData = JSON.parse(data);
            } catch (e) {
              // Keep as string if JSON parse fails
            }
          }

          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: parsedData,
            responseTime,
            request: {
              method: this.method,
              url: this.url,
              headers: this.headers
            }
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      // Write body if exists
      if (this.body) {
        const bodyData = typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
        req.write(bodyData);
      }

      req.end();
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  describe() {
    return {
      method: this.method,
      url: this.url,
      headers: this.headers,
      queryParams: this.queryParams,
      hasBody: !!this.body,
      timeout: this.timeout,
      retries: this.retries,
      auth: this.auth ? 'configured' : 'none'
    };
  }
}

/**
 * Builder: HTTPRequestBuilder
 * Fluent interface for building HTTP requests
 */
class HTTPRequestBuilder {
  constructor() {
    this.request = new HTTPRequest();
  }

  setMethod(method) {
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    if (!validMethods.includes(method.toUpperCase())) {
      throw new Error(`Invalid HTTP method: ${method}`);
    }
    this.request.method = method.toUpperCase();
    return this;
  }

  setUrl(url) {
    try {
      new URL(url);
      this.request.url = url;
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
    return this;
  }

  setHeader(key, value) {
    this.request.headers[key] = value;
    return this;
  }

  setHeaders(headers) {
    Object.assign(this.request.headers, headers);
    return this;
  }

  setBody(body) {
    this.request.body = body;
    if (typeof body === 'object' && !this.request.headers['Content-Type']) {
      this.request.headers['Content-Type'] = 'application/json';
    }
    return this;
  }

  setQueryParam(key, value) {
    this.request.queryParams[key] = value;
    return this;
  }

  setQueryParams(params) {
    Object.assign(this.request.queryParams, params);
    return this;
  }

  setTimeout(timeout) {
    if (timeout < 0) {
      throw new Error('Timeout must be positive');
    }
    this.request.timeout = timeout;
    return this;
  }

  setRetries(retries) {
    if (retries < 0) {
      throw new Error('Retries must be non-negative');
    }
    this.request.retries = retries;
    return this;
  }

  setAuth(username, password) {
    this.request.auth = { username, password };
    return this;
  }

  setBearerToken(token) {
    this.request.headers['Authorization'] = `Bearer ${token}`;
    return this;
  }

  setFollowRedirects(follow) {
    this.request.followRedirects = follow;
    return this;
  }

  setValidateStatus(validator) {
    this.request.validateStatus = validator;
    return this;
  }

  // Convenience methods
  get(url) {
    return this.setMethod('GET').setUrl(url);
  }

  post(url) {
    return this.setMethod('POST').setUrl(url);
  }

  put(url) {
    return this.setMethod('PUT').setUrl(url);
  }

  delete(url) {
    return this.setMethod('DELETE').setUrl(url);
  }

  patch(url) {
    return this.setMethod('PATCH').setUrl(url);
  }

  build() {
    if (!this.request.url) {
      throw new Error('URL is required');
    }

    const builtRequest = this.request;
    this.request = new HTTPRequest(); // Reset for next build
    return builtRequest;
  }

  reset() {
    this.request = new HTTPRequest();
    return this;
  }
}

/**
 * Product: SQLQuery
 * Complex SQL query object
 */
class SQLQuery {
  constructor() {
    this.type = null; // SELECT, INSERT, UPDATE, DELETE
    this.table = null;
    this.selectFields = [];
    this.whereConditions = [];
    this.joins = [];
    this.orderBy = [];
    this.groupBy = [];
    this.having = [];
    this.limit = null;
    this.offset = null;
    this.insertData = {};
    this.updateData = {};
    this.parameters = [];
  }

  toString() {
    switch (this.type) {
      case 'SELECT':
        return this.buildSelectQuery();
      case 'INSERT':
        return this.buildInsertQuery();
      case 'UPDATE':
        return this.buildUpdateQuery();
      case 'DELETE':
        return this.buildDeleteQuery();
      default:
        throw new Error('Query type not set');
    }
  }

  buildSelectQuery() {
    const fields = this.selectFields.length > 0 ? this.selectFields.join(', ') : '*';
    let query = `SELECT ${fields} FROM ${this.table}`;

    if (this.joins.length > 0) {
      query += ' ' + this.joins.join(' ');
    }

    if (this.whereConditions.length > 0) {
      query += ' WHERE ' + this.whereConditions.join(' AND ');
    }

    if (this.groupBy.length > 0) {
      query += ' GROUP BY ' + this.groupBy.join(', ');
    }

    if (this.having.length > 0) {
      query += ' HAVING ' + this.having.join(' AND ');
    }

    if (this.orderBy.length > 0) {
      query += ' ORDER BY ' + this.orderBy.join(', ');
    }

    if (this.limit !== null) {
      query += ` LIMIT ${this.limit}`;
    }

    if (this.offset !== null) {
      query += ` OFFSET ${this.offset}`;
    }

    return query;
  }

  buildInsertQuery() {
    const fields = Object.keys(this.insertData);
    const values = fields.map((_, i) => `$${i + 1}`);

    return `INSERT INTO ${this.table} (${fields.join(', ')}) VALUES (${values.join(', ')})`;
  }

  buildUpdateQuery() {
    const updates = Object.keys(this.updateData).map((field, i) => `${field} = $${i + 1}`);
    let query = `UPDATE ${this.table} SET ${updates.join(', ')}`;

    if (this.whereConditions.length > 0) {
      query += ' WHERE ' + this.whereConditions.join(' AND ');
    }

    return query;
  }

  buildDeleteQuery() {
    let query = `DELETE FROM ${this.table}`;

    if (this.whereConditions.length > 0) {
      query += ' WHERE ' + this.whereConditions.join(' AND ');
    }

    return query;
  }

  getParameters() {
    if (this.type === 'INSERT') {
      return Object.values(this.insertData);
    } else if (this.type === 'UPDATE') {
      return Object.values(this.updateData);
    }
    return this.parameters;
  }
}

/**
 * Builder: SQLQueryBuilder
 * Fluent interface for building SQL queries
 */
class SQLQueryBuilder {
  constructor() {
    this.query = new SQLQuery();
  }

  select(...fields) {
    this.query.type = 'SELECT';
    this.query.selectFields = fields.length > 0 ? fields : ['*'];
    return this;
  }

  insert() {
    this.query.type = 'INSERT';
    return this;
  }

  update() {
    this.query.type = 'UPDATE';
    return this;
  }

  delete() {
    this.query.type = 'DELETE';
    return this;
  }

  from(table) {
    this.query.table = table;
    return this;
  }

  into(table) {
    this.query.table = table;
    return this;
  }

  where(condition, ...params) {
    this.query.whereConditions.push(condition);
    this.query.parameters.push(...params);
    return this;
  }

  and(condition, ...params) {
    return this.where(condition, ...params);
  }

  join(table, condition) {
    this.query.joins.push(`JOIN ${table} ON ${condition}`);
    return this;
  }

  leftJoin(table, condition) {
    this.query.joins.push(`LEFT JOIN ${table} ON ${condition}`);
    return this;
  }

  rightJoin(table, condition) {
    this.query.joins.push(`RIGHT JOIN ${table} ON ${condition}`);
    return this;
  }

  orderBy(field, direction = 'ASC') {
    this.query.orderBy.push(`${field} ${direction}`);
    return this;
  }

  groupBy(...fields) {
    this.query.groupBy.push(...fields);
    return this;
  }

  having(condition) {
    this.query.having.push(condition);
    return this;
  }

  limit(limit) {
    this.query.limit = limit;
    return this;
  }

  offset(offset) {
    this.query.offset = offset;
    return this;
  }

  values(data) {
    this.query.insertData = data;
    return this;
  }

  set(data) {
    this.query.updateData = data;
    return this;
  }

  build() {
    const builtQuery = this.query;
    this.query = new SQLQuery(); // Reset for next build
    return builtQuery;
  }

  reset() {
    this.query = new SQLQuery();
    return this;
  }
}

/**
 * Director: RequestDirector
 * Constructs common request patterns
 */
class RequestDirector {
  constructor(builder) {
    this.builder = builder;
  }

  buildJSONPostRequest(url, data) {
    return this.builder
      .post(url)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Accept', 'application/json')
      .setBody(data)
      .setTimeout(10000)
      .setRetries(2)
      .build();
  }

  buildAuthenticatedGetRequest(url, token) {
    return this.builder
      .get(url)
      .setBearerToken(token)
      .setHeader('Accept', 'application/json')
      .setTimeout(15000)
      .build();
  }

  buildFormPostRequest(url, formData) {
    const body = querystring.stringify(formData);
    return this.builder
      .post(url)
      .setHeader('Content-Type', 'application/x-www-form-urlencoded')
      .setBody(body)
      .setTimeout(10000)
      .build();
  }

  buildFileUploadRequest(url, fileData, authToken) {
    return this.builder
      .post(url)
      .setBearerToken(authToken)
      .setHeader('Content-Type', 'multipart/form-data')
      .setBody(fileData)
      .setTimeout(60000)
      .setRetries(3)
      .build();
  }
}

/**
 * Director: QueryDirector
 * Constructs common SQL query patterns
 */
class QueryDirector {
  constructor(builder) {
    this.builder = builder;
  }

  buildPaginatedQuery(table, page, pageSize) {
    const offset = (page - 1) * pageSize;
    return this.builder
      .select()
      .from(table)
      .orderBy('created_at', 'DESC')
      .limit(pageSize)
      .offset(offset)
      .build();
  }

  buildSearchQuery(table, searchField, searchTerm, limit = 10) {
    return this.builder
      .select()
      .from(table)
      .where(`${searchField} LIKE ?`, `%${searchTerm}%`)
      .limit(limit)
      .build();
  }

  buildJoinQuery(mainTable, joinTable, joinCondition, fields) {
    return this.builder
      .select(...fields)
      .from(mainTable)
      .join(joinTable, joinCondition)
      .build();
  }

  buildAggregateQuery(table, groupField, aggregateField) {
    return this.builder
      .select(groupField, `COUNT(${aggregateField}) as count`)
      .from(table)
      .groupBy(groupField)
      .orderBy('count', 'DESC')
      .build();
  }
}

module.exports = {
  HTTPRequest,
  HTTPRequestBuilder,
  SQLQuery,
  SQLQueryBuilder,
  RequestDirector,
  QueryDirector
};
