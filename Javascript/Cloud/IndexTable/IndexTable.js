/**
 * Index Table Pattern Implementation
 *
 * Index Table pattern creates indexes on non-primary key attributes to support
 * fast queries on different dimensions without scanning entire datasets.
 *
 * Key Components:
 * - Primary Store: Main data storage
 * - Index Tables: Secondary indexes for different query patterns
 * - Index Manager: Maintains index consistency
 * - Query Router: Routes queries to appropriate index
 * - Index Types: B-Tree, Hash, Inverted, Composite
 */

/**
 * B-Tree Index for range queries
 */
class BTreeIndex {
    constructor(name, field) {
        this.name = name;
        this.field = field;
        this.tree = new Map(); // Simplified B-Tree using Map
        this.statistics = {
            size: 0,
            queries: 0,
            inserts: 0
        };
    }

    insert(key, recordId) {
        const value = this.extractValue(key);

        if (!this.tree.has(value)) {
            this.tree.set(value, new Set());
        }

        this.tree.get(value).add(recordId);
        this.statistics.size = this.tree.size;
        this.statistics.inserts++;
    }

    delete(key, recordId) {
        const value = this.extractValue(key);
        const recordSet = this.tree.get(value);

        if (recordSet) {
            recordSet.delete(recordId);
            if (recordSet.size === 0) {
                this.tree.delete(value);
            }
        }

        this.statistics.size = this.tree.size;
    }

    find(value) {
        this.statistics.queries++;
        const recordSet = this.tree.get(value);
        return recordSet ? Array.from(recordSet) : [];
    }

    findRange(minValue, maxValue) {
        this.statistics.queries++;
        const results = new Set();

        for (const [key, recordSet] of this.tree) {
            if (key >= minValue && key <= maxValue) {
                recordSet.forEach(id => results.add(id));
            }
        }

        return Array.from(results);
    }

    extractValue(key) {
        return typeof key === 'object' ? key[this.field] : key;
    }

    getStatistics() {
        return {
            name: this.name,
            field: this.field,
            type: 'BTree',
            ...this.statistics
        };
    }
}

/**
 * Hash Index for equality queries
 */
class HashIndex {
    constructor(name, field) {
        this.name = name;
        this.field = field;
        this.index = new Map();
        this.statistics = {
            size: 0,
            queries: 0,
            inserts: 0,
            collisions: 0
        };
    }

    insert(key, recordId) {
        const value = this.extractValue(key);
        const hash = this.hash(value);

        if (!this.index.has(hash)) {
            this.index.set(hash, []);
        } else {
            this.statistics.collisions++;
        }

        this.index.get(hash).push({ value, recordId });
        this.statistics.size = this.index.size;
        this.statistics.inserts++;
    }

    delete(key, recordId) {
        const value = this.extractValue(key);
        const hash = this.hash(value);
        const bucket = this.index.get(hash);

        if (bucket) {
            const filtered = bucket.filter(entry => entry.recordId !== recordId);
            if (filtered.length === 0) {
                this.index.delete(hash);
            } else {
                this.index.set(hash, filtered);
            }
        }

        this.statistics.size = this.index.size;
    }

    find(value) {
        this.statistics.queries++;
        const hash = this.hash(value);
        const bucket = this.index.get(hash);

        if (!bucket) {
            return [];
        }

        return bucket
            .filter(entry => entry.value === value)
            .map(entry => entry.recordId);
    }

    hash(value) {
        let hash = 0;
        const str = String(value);

        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }

        return Math.abs(hash);
    }

    extractValue(key) {
        return typeof key === 'object' ? key[this.field] : key;
    }

    getStatistics() {
        return {
            name: this.name,
            field: this.field,
            type: 'Hash',
            ...this.statistics
        };
    }
}

/**
 * Inverted Index for text search
 */
class InvertedIndex {
    constructor(name, field) {
        this.name = name;
        this.field = field;
        this.index = new Map(); // term -> Set of record IDs
        this.statistics = {
            terms: 0,
            queries: 0,
            inserts: 0
        };
    }

    insert(record, recordId) {
        const text = this.extractValue(record);
        const terms = this.tokenize(text);

        for (const term of terms) {
            if (!this.index.has(term)) {
                this.index.set(term, new Set());
            }
            this.index.get(term).add(recordId);
        }

        this.statistics.terms = this.index.size;
        this.statistics.inserts++;
    }

    delete(record, recordId) {
        const text = this.extractValue(record);
        const terms = this.tokenize(text);

        for (const term of terms) {
            const recordSet = this.index.get(term);
            if (recordSet) {
                recordSet.delete(recordId);
                if (recordSet.size === 0) {
                    this.index.delete(term);
                }
            }
        }

        this.statistics.terms = this.index.size;
    }

    search(query) {
        this.statistics.queries++;
        const terms = this.tokenize(query);

        if (terms.length === 0) {
            return [];
        }

        // Find documents containing all terms (AND operation)
        let results = null;

        for (const term of terms) {
            const termResults = this.index.get(term);
            if (!termResults) {
                return []; // If any term not found, no results
            }

            if (results === null) {
                results = new Set(termResults);
            } else {
                // Intersection
                results = new Set([...results].filter(id => termResults.has(id)));
            }
        }

        return results ? Array.from(results) : [];
    }

    searchOr(query) {
        this.statistics.queries++;
        const terms = this.tokenize(query);
        const results = new Set();

        for (const term of terms) {
            const termResults = this.index.get(term);
            if (termResults) {
                termResults.forEach(id => results.add(id));
            }
        }

        return Array.from(results);
    }

    tokenize(text) {
        if (!text) return [];
        return String(text)
            .toLowerCase()
            .split(/\W+/)
            .filter(term => term.length > 0);
    }

    extractValue(record) {
        return typeof record === 'object' ? record[this.field] : record;
    }

    getStatistics() {
        return {
            name: this.name,
            field: this.field,
            type: 'Inverted',
            ...this.statistics
        };
    }
}

/**
 * Composite Index for multi-column queries
 */
class CompositeIndex {
    constructor(name, fields) {
        this.name = name;
        this.fields = fields;
        this.index = new Map();
        this.statistics = {
            size: 0,
            queries: 0,
            inserts: 0
        };
    }

    insert(record, recordId) {
        const key = this.createCompositeKey(record);

        if (!this.index.has(key)) {
            this.index.set(key, new Set());
        }

        this.index.get(key).add(recordId);
        this.statistics.size = this.index.size;
        this.statistics.inserts++;
    }

    delete(record, recordId) {
        const key = this.createCompositeKey(record);
        const recordSet = this.index.get(key);

        if (recordSet) {
            recordSet.delete(recordId);
            if (recordSet.size === 0) {
                this.index.delete(key);
            }
        }

        this.statistics.size = this.index.size;
    }

    find(criteria) {
        this.statistics.queries++;
        const key = this.createCompositeKey(criteria);
        const recordSet = this.index.get(key);
        return recordSet ? Array.from(recordSet) : [];
    }

    createCompositeKey(record) {
        return this.fields
            .map(field => record[field])
            .join('::');
    }

    getStatistics() {
        return {
            name: this.name,
            fields: this.fields,
            type: 'Composite',
            ...this.statistics
        };
    }
}

/**
 * Primary Data Store
 */
class DataStore {
    constructor() {
        this.records = new Map();
        this.nextId = 1;
    }

    insert(record) {
        const recordId = `rec_${this.nextId++}`;
        this.records.set(recordId, {
            ...record,
            _id: recordId,
            _createdAt: new Date()
        });
        return recordId;
    }

    get(recordId) {
        return this.records.get(recordId);
    }

    update(recordId, updates) {
        const record = this.records.get(recordId);
        if (!record) {
            throw new Error(`Record not found: ${recordId}`);
        }

        Object.assign(record, updates, { _updatedAt: new Date() });
        return record;
    }

    delete(recordId) {
        return this.records.delete(recordId);
    }

    getAll() {
        return Array.from(this.records.values());
    }
}

/**
 * Index Manager - Maintains all indexes
 */
class IndexManager {
    constructor(dataStore) {
        this.dataStore = dataStore;
        this.indexes = new Map();
    }

    createBTreeIndex(name, field) {
        const index = new BTreeIndex(name, field);
        this.indexes.set(name, index);
        return index;
    }

    createHashIndex(name, field) {
        const index = new HashIndex(name, field);
        this.indexes.set(name, index);
        return index;
    }

    createInvertedIndex(name, field) {
        const index = new InvertedIndex(name, field);
        this.indexes.set(name, index);
        return index;
    }

    createCompositeIndex(name, fields) {
        const index = new CompositeIndex(name, fields);
        this.indexes.set(name, index);
        return index;
    }

    insert(record) {
        // Insert into primary store
        const recordId = this.dataStore.insert(record);

        // Update all indexes
        for (const index of this.indexes.values()) {
            index.insert(record, recordId);
        }

        return recordId;
    }

    update(recordId, updates) {
        const oldRecord = this.dataStore.get(recordId);
        if (!oldRecord) {
            throw new Error(`Record not found: ${recordId}`);
        }

        // Remove old index entries
        for (const index of this.indexes.values()) {
            index.delete(oldRecord, recordId);
        }

        // Update record
        const newRecord = this.dataStore.update(recordId, updates);

        // Add new index entries
        for (const index of this.indexes.values()) {
            index.insert(newRecord, recordId);
        }

        return newRecord;
    }

    delete(recordId) {
        const record = this.dataStore.get(recordId);
        if (!record) {
            return false;
        }

        // Remove from all indexes
        for (const index of this.indexes.values()) {
            index.delete(record, recordId);
        }

        // Delete from primary store
        return this.dataStore.delete(recordId);
    }

    queryByIndex(indexName, value) {
        const index = this.indexes.get(indexName);
        if (!index) {
            throw new Error(`Index not found: ${indexName}`);
        }

        const recordIds = index.find(value);
        return recordIds.map(id => this.dataStore.get(id));
    }

    queryRange(indexName, minValue, maxValue) {
        const index = this.indexes.get(indexName);
        if (!index || !(index instanceof BTreeIndex)) {
            throw new Error(`BTree index not found: ${indexName}`);
        }

        const recordIds = index.findRange(minValue, maxValue);
        return recordIds.map(id => this.dataStore.get(id));
    }

    searchText(indexName, query) {
        const index = this.indexes.get(indexName);
        if (!index || !(index instanceof InvertedIndex)) {
            throw new Error(`Inverted index not found: ${indexName}`);
        }

        const recordIds = index.search(query);
        return recordIds.map(id => this.dataStore.get(id));
    }

    rebuildIndex(indexName) {
        const index = this.indexes.get(indexName);
        if (!index) {
            throw new Error(`Index not found: ${indexName}`);
        }

        console.log(`Rebuilding index: ${indexName}`);

        // Clear index
        if (index instanceof BTreeIndex || index instanceof HashIndex) {
            index.tree?.clear();
            index.index?.clear();
        } else if (index instanceof InvertedIndex) {
            index.index.clear();
        } else if (index instanceof CompositeIndex) {
            index.index.clear();
        }

        // Rebuild from data store
        for (const [recordId, record] of this.dataStore.records) {
            index.insert(record, recordId);
        }

        console.log(`Index ${indexName} rebuilt`);
    }

    getAllIndexStatistics() {
        const stats = [];
        for (const index of this.indexes.values()) {
            stats.push(index.getStatistics());
        }
        return stats;
    }
}

/**
 * Demonstration
 */
function demonstrateIndexTable() {
    console.log('=== Index Table Pattern Demonstration ===\n');

    const dataStore = new DataStore();
    const indexManager = new IndexManager(dataStore);

    // Create indexes
    console.log('1. Creating indexes...');
    indexManager.createHashIndex('userIdIndex', 'userId');
    indexManager.createBTreeIndex('ageIndex', 'age');
    indexManager.createInvertedIndex('descriptionIndex', 'description');
    indexManager.createCompositeIndex('locationIndex', ['city', 'country']);

    // Insert data
    console.log('\n2. Inserting records...');
    const users = [
        { userId: 'u1', name: 'Alice', age: 25, city: 'New York', country: 'USA', description: 'Software engineer interested in cloud computing' },
        { userId: 'u2', name: 'Bob', age: 30, city: 'London', country: 'UK', description: 'Data scientist working with machine learning' },
        { userId: 'u3', name: 'Charlie', age: 35, city: 'New York', country: 'USA', description: 'Cloud architect designing scalable systems' },
        { userId: 'u4', name: 'David', age: 28, city: 'Paris', country: 'France', description: 'Software engineer specializing in distributed systems' },
        { userId: 'u5', name: 'Eve', age: 32, city: 'London', country: 'UK', description: 'DevOps engineer automating cloud infrastructure' }
    ];

    for (const user of users) {
        indexManager.insert(user);
    }

    // Query by hash index
    console.log('\n3. Query by userId (Hash Index):');
    console.time('Hash query');
    const user = indexManager.queryByIndex('userIdIndex', 'u3');
    console.timeEnd('Hash query');
    console.log('Result:', user);

    // Query by B-Tree range
    console.log('\n4. Query by age range (BTree Index):');
    console.time('Range query');
    const usersInRange = indexManager.queryRange('ageIndex', 28, 32);
    console.timeEnd('Range query');
    console.log(`Found ${usersInRange.length} users aged 28-32:`, usersInRange.map(u => u.name));

    // Text search
    console.log('\n5. Text search (Inverted Index):');
    console.time('Text search');
    const engineersResults = indexManager.searchText('descriptionIndex', 'cloud engineer');
    console.timeEnd('Text search');
    console.log(`Found ${engineersResults.length} results for "cloud engineer":`, engineersResults.map(u => u.name));

    // Composite index query
    console.log('\n6. Query by composite index:');
    console.time('Composite query');
    const nyUsers = indexManager.queryByIndex('locationIndex', { city: 'New York', country: 'USA' });
    console.timeEnd('Composite query');
    console.log(`Found ${nyUsers.length} users in New York, USA:`, nyUsers.map(u => u.name));

    // Index statistics
    console.log('\n7. Index statistics:');
    const stats = indexManager.getAllIndexStatistics();
    console.log(JSON.stringify(stats, null, 2));

    // Update operation
    console.log('\n8. Testing index update:');
    const recordId = 'rec_1';
    console.log('Before update:', indexManager.dataStore.get(recordId));
    indexManager.update(recordId, { age: 26, city: 'Boston' });
    console.log('After update:', indexManager.dataStore.get(recordId));

    // Verify index was updated
    const bostonUsers = indexManager.queryByIndex('locationIndex', { city: 'Boston', country: 'USA' });
    console.log('Users in Boston:', bostonUsers.map(u => u.name));
}

// Run demonstration
if (require.main === module) {
    demonstrateIndexTable();
}

module.exports = {
    BTreeIndex,
    HashIndex,
    InvertedIndex,
    CompositeIndex,
    DataStore,
    IndexManager
};
