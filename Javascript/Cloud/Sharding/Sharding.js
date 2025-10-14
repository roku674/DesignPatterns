/**
 * Sharding Pattern Implementation
 *
 * Sharding (horizontal partitioning) divides data across multiple databases/nodes
 * to improve scalability and performance.
 *
 * Key Components:
 * - Shard Key: Attribute used to determine shard placement
 * - Sharding Strategy: Hash-based, range-based, or geographic
 * - Shard Router: Routes queries to appropriate shards
 * - Shard Manager: Manages shard lifecycle and rebalancing
 * - Cross-Shard Query Executor: Handles queries spanning multiple shards
 */

/**
 * Hash-based Sharding Strategy
 */
class HashBasedSharding {
    constructor(shardCount) {
        this.shardCount = shardCount;
    }

    getShardId(key) {
        let hash = 0;
        const keyStr = String(key);

        for (let i = 0; i < keyStr.length; i++) {
            hash = ((hash << 5) - hash) + keyStr.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }

        return Math.abs(hash) % this.shardCount;
    }

    getAllShardIds() {
        return Array.from({ length: this.shardCount }, (_, i) => i);
    }
}

/**
 * Range-based Sharding Strategy
 */
class RangeBasedSharding {
    constructor() {
        this.ranges = [];
    }

    addRange(minValue, maxValue, shardId) {
        this.ranges.push({ minValue, maxValue, shardId });
        this.ranges.sort((a, b) => a.minValue - b.minValue);
    }

    getShardId(key) {
        const numericKey = typeof key === 'number' ? key : parseInt(key, 10);

        for (const range of this.ranges) {
            if (numericKey >= range.minValue && numericKey < range.maxValue) {
                return range.shardId;
            }
        }

        throw new Error(`No shard found for key: ${key}`);
    }

    getAllShardIds() {
        return [...new Set(this.ranges.map(r => r.shardId))];
    }
}

/**
 * Geographic Sharding Strategy
 */
class GeographicSharding {
    constructor() {
        this.regionMap = new Map();
    }

    addRegion(region, shardId) {
        this.regionMap.set(region.toLowerCase(), shardId);
    }

    getShardId(region) {
        const shardId = this.regionMap.get(region.toLowerCase());
        if (shardId === undefined) {
            throw new Error(`No shard found for region: ${region}`);
        }
        return shardId;
    }

    getAllShardIds() {
        return [...new Set(this.regionMap.values())];
    }
}

/**
 * Shard - Represents a single data partition
 */
class Shard {
    constructor(shardId) {
        this.shardId = shardId;
        this.data = new Map();
        this.metadata = {
            recordCount: 0,
            lastAccessed: null,
            createdAt: new Date()
        };
    }

    insert(key, value) {
        this.data.set(key, {
            value,
            insertedAt: new Date()
        });
        this.metadata.recordCount = this.data.size;
        this.metadata.lastAccessed = new Date();
    }

    get(key) {
        this.metadata.lastAccessed = new Date();
        const record = this.data.get(key);
        return record ? record.value : null;
    }

    update(key, value) {
        if (!this.data.has(key)) {
            throw new Error(`Key not found: ${key}`);
        }

        this.data.set(key, {
            value,
            updatedAt: new Date()
        });
        this.metadata.lastAccessed = new Date();
    }

    delete(key) {
        const deleted = this.data.delete(key);
        this.metadata.recordCount = this.data.size;
        this.metadata.lastAccessed = new Date();
        return deleted;
    }

    query(predicate) {
        this.metadata.lastAccessed = new Date();
        const results = [];

        for (const [key, record] of this.data) {
            if (predicate(key, record.value)) {
                results.push({ key, value: record.value });
            }
        }

        return results;
    }

    getMetadata() {
        return {
            shardId: this.shardId,
            ...this.metadata,
            size: this.data.size
        };
    }

    getAllData() {
        const results = [];
        for (const [key, record] of this.data) {
            results.push({ key, value: record.value });
        }
        return results;
    }
}

/**
 * Shard Router - Routes operations to appropriate shards
 */
class ShardRouter {
    constructor(shardingStrategy) {
        this.shardingStrategy = shardingStrategy;
        this.shards = new Map();
        this.statistics = {
            totalRequests: 0,
            requestsPerShard: new Map()
        };

        // Initialize shards
        for (const shardId of this.shardingStrategy.getAllShardIds()) {
            this.shards.set(shardId, new Shard(shardId));
            this.statistics.requestsPerShard.set(shardId, 0);
        }
    }

    insert(shardKey, key, value) {
        const shardId = this.shardingStrategy.getShardId(shardKey);
        const shard = this.shards.get(shardId);

        if (!shard) {
            throw new Error(`Shard not found: ${shardId}`);
        }

        shard.insert(key, value);
        this.recordRequest(shardId);

        return { shardId, key };
    }

    get(shardKey, key) {
        const shardId = this.shardingStrategy.getShardId(shardKey);
        const shard = this.shards.get(shardId);

        if (!shard) {
            throw new Error(`Shard not found: ${shardId}`);
        }

        this.recordRequest(shardId);
        return shard.get(key);
    }

    update(shardKey, key, value) {
        const shardId = this.shardingStrategy.getShardId(shardKey);
        const shard = this.shards.get(shardId);

        if (!shard) {
            throw new Error(`Shard not found: ${shardId}`);
        }

        shard.update(key, value);
        this.recordRequest(shardId);
    }

    delete(shardKey, key) {
        const shardId = this.shardingStrategy.getShardId(shardKey);
        const shard = this.shards.get(shardId);

        if (!shard) {
            throw new Error(`Shard not found: ${shardId}`);
        }

        this.recordRequest(shardId);
        return shard.delete(key);
    }

    queryAcrossShards(predicate) {
        // Query all shards and aggregate results
        const results = [];

        for (const [shardId, shard] of this.shards) {
            const shardResults = shard.query(predicate);
            results.push({
                shardId,
                results: shardResults,
                count: shardResults.length
            });
            this.recordRequest(shardId);
        }

        return results;
    }

    recordRequest(shardId) {
        this.statistics.totalRequests++;
        const current = this.statistics.requestsPerShard.get(shardId) || 0;
        this.statistics.requestsPerShard.set(shardId, current + 1);
    }

    getStatistics() {
        const shardStats = [];

        for (const [shardId, shard] of this.shards) {
            shardStats.push({
                ...shard.getMetadata(),
                requests: this.statistics.requestsPerShard.get(shardId) || 0
            });
        }

        return {
            totalRequests: this.statistics.totalRequests,
            totalShards: this.shards.size,
            shards: shardStats
        };
    }

    getShard(shardId) {
        return this.shards.get(shardId);
    }
}

/**
 * Shard Manager - Manages shard lifecycle and rebalancing
 */
class ShardManager {
    constructor(shardRouter) {
        this.shardRouter = shardRouter;
    }

    addShard(shardId) {
        if (this.shardRouter.shards.has(shardId)) {
            throw new Error(`Shard already exists: ${shardId}`);
        }

        this.shardRouter.shards.set(shardId, new Shard(shardId));
        this.shardRouter.statistics.requestsPerShard.set(shardId, 0);
    }

    removeShard(shardId) {
        if (!this.shardRouter.shards.has(shardId)) {
            throw new Error(`Shard not found: ${shardId}`);
        }

        // In production, would migrate data to other shards first
        this.shardRouter.shards.delete(shardId);
        this.shardRouter.statistics.requestsPerShard.delete(shardId);
    }

    rebalanceShards() {
        console.log('Starting shard rebalancing...');

        const shards = Array.from(this.shardRouter.shards.values());
        const totalRecords = shards.reduce((sum, shard) => sum + shard.data.size, 0);
        const avgRecordsPerShard = totalRecords / shards.length;

        console.log(`Total records: ${totalRecords}, Target per shard: ${avgRecordsPerShard}`);

        // Find overloaded and underloaded shards
        const overloaded = [];
        const underloaded = [];

        for (const shard of shards) {
            const variance = shard.data.size - avgRecordsPerShard;
            if (variance > avgRecordsPerShard * 0.2) {
                overloaded.push({ shard, excess: variance });
            } else if (variance < -avgRecordsPerShard * 0.2) {
                underloaded.push({ shard, deficit: -variance });
            }
        }

        console.log(`Overloaded shards: ${overloaded.length}, Underloaded shards: ${underloaded.length}`);

        // In a real system, would migrate data between shards
        // For demonstration, we just report the analysis
        return {
            totalRecords,
            avgRecordsPerShard,
            overloaded: overloaded.length,
            underloaded: underloaded.length,
            rebalanceNeeded: overloaded.length > 0 || underloaded.length > 0
        };
    }

    getShardHealth() {
        const health = [];

        for (const [shardId, shard] of this.shardRouter.shards) {
            const metadata = shard.getMetadata();
            const requests = this.shardRouter.statistics.requestsPerShard.get(shardId) || 0;

            health.push({
                shardId,
                recordCount: metadata.recordCount,
                requests,
                status: requests > 0 ? 'healthy' : 'idle',
                lastAccessed: metadata.lastAccessed
            });
        }

        return health;
    }
}

/**
 * Cross-Shard Query Executor
 */
class CrossShardQueryExecutor {
    constructor(shardRouter) {
        this.shardRouter = shardRouter;
    }

    async aggregateQuery(predicate, aggregateFn) {
        const shardResults = this.shardRouter.queryAcrossShards(predicate);

        // Flatten results from all shards
        const allResults = [];
        for (const shardResult of shardResults) {
            allResults.push(...shardResult.results);
        }

        // Apply aggregation function
        return aggregateFn(allResults);
    }

    async count(predicate) {
        return await this.aggregateQuery(predicate, (results) => results.length);
    }

    async sum(predicate, field) {
        return await this.aggregateQuery(predicate, (results) => {
            return results.reduce((sum, item) => sum + (item.value[field] || 0), 0);
        });
    }

    async groupBy(predicate, groupField) {
        return await this.aggregateQuery(predicate, (results) => {
            const groups = new Map();

            for (const item of results) {
                const groupKey = item.value[groupField];
                if (!groups.has(groupKey)) {
                    groups.set(groupKey, []);
                }
                groups.get(groupKey).push(item);
            }

            return Array.from(groups.entries()).map(([key, values]) => ({
                [groupField]: key,
                count: values.length,
                items: values
            }));
        });
    }
}

/**
 * Consistent Hashing for dynamic shard addition/removal
 */
class ConsistentHashingRouter {
    constructor(virtualNodeCount = 100) {
        this.virtualNodeCount = virtualNodeCount;
        this.ring = new Map();
        this.shards = new Map();
        this.sortedKeys = [];
    }

    addShard(shardId) {
        const shard = new Shard(shardId);
        this.shards.set(shardId, shard);

        // Add virtual nodes to the ring
        for (let i = 0; i < this.virtualNodeCount; i++) {
            const virtualKey = `${shardId}:${i}`;
            const hash = this.hash(virtualKey);
            this.ring.set(hash, shardId);
        }

        this.sortedKeys = Array.from(this.ring.keys()).sort((a, b) => a - b);
    }

    getShardForKey(key) {
        if (this.sortedKeys.length === 0) {
            throw new Error('No shards available');
        }

        const keyHash = this.hash(key);

        // Find the first shard with hash >= keyHash
        for (const ringHash of this.sortedKeys) {
            if (ringHash >= keyHash) {
                return this.ring.get(ringHash);
            }
        }

        // Wrap around to the first shard
        return this.ring.get(this.sortedKeys[0]);
    }

    hash(key) {
        let hash = 0;
        const keyStr = String(key);

        for (let i = 0; i < keyStr.length; i++) {
            hash = ((hash << 5) - hash) + keyStr.charCodeAt(i);
            hash = hash & hash;
        }

        return Math.abs(hash);
    }

    insert(key, value) {
        const shardId = this.getShardForKey(key);
        const shard = this.shards.get(shardId);
        shard.insert(key, value);
        return { shardId, key };
    }

    get(key) {
        const shardId = this.getShardForKey(key);
        const shard = this.shards.get(shardId);
        return shard.get(key);
    }
}

/**
 * Demonstration
 */
function demonstrateSharding() {
    console.log('=== Sharding Pattern Demonstration ===\n');

    // 1. Hash-based Sharding
    console.log('1. Hash-based Sharding:');
    const hashStrategy = new HashBasedSharding(4);
    const hashRouter = new ShardRouter(hashStrategy);

    for (let i = 1; i <= 20; i++) {
        hashRouter.insert(i, `user:${i}`, {
            id: i,
            name: `User ${i}`,
            email: `user${i}@example.com`
        });
    }

    console.log('Hash-based shard distribution:');
    console.log(JSON.stringify(hashRouter.getStatistics(), null, 2));

    // 2. Range-based Sharding
    console.log('\n2. Range-based Sharding:');
    const rangeStrategy = new RangeBasedSharding();
    rangeStrategy.addRange(0, 100, 0);
    rangeStrategy.addRange(100, 200, 1);
    rangeStrategy.addRange(200, 300, 2);

    const rangeRouter = new ShardRouter(rangeStrategy);

    for (let i = 0; i < 300; i += 10) {
        rangeRouter.insert(i, `order:${i}`, {
            id: i,
            amount: Math.random() * 1000
        });
    }

    console.log('Range-based shard distribution:');
    console.log(JSON.stringify(rangeRouter.getStatistics(), null, 2));

    // 3. Geographic Sharding
    console.log('\n3. Geographic Sharding:');
    const geoStrategy = new GeographicSharding();
    geoStrategy.addRegion('us-east', 0);
    geoStrategy.addRegion('us-west', 1);
    geoStrategy.addRegion('eu-central', 2);
    geoStrategy.addRegion('asia-pacific', 3);

    const geoRouter = new ShardRouter(geoStrategy);

    const regions = ['us-east', 'us-west', 'eu-central', 'asia-pacific'];
    for (let i = 0; i < 100; i++) {
        const region = regions[i % regions.length];
        geoRouter.insert(region, `customer:${i}`, {
            id: i,
            region,
            name: `Customer ${i}`
        });
    }

    console.log('Geographic shard distribution:');
    console.log(JSON.stringify(geoRouter.getStatistics(), null, 2));

    // 4. Cross-shard queries
    console.log('\n4. Cross-shard Query:');
    const queryExecutor = new CrossShardQueryExecutor(hashRouter);

    const userCount = queryExecutor.count(() => true);
    console.log(`Total users across all shards: ${userCount}`);

    // 5. Shard Management
    console.log('\n5. Shard Management:');
    const shardManager = new ShardManager(hashRouter);
    const health = shardManager.getShardHealth();
    console.log('Shard health:', JSON.stringify(health, null, 2));

    const rebalanceReport = shardManager.rebalanceShards();
    console.log('Rebalance report:', JSON.stringify(rebalanceReport, null, 2));

    // 6. Consistent Hashing
    console.log('\n6. Consistent Hashing:');
    const consistentRouter = new ConsistentHashingRouter(50);
    consistentRouter.addShard(0);
    consistentRouter.addShard(1);
    consistentRouter.addShard(2);

    for (let i = 0; i < 30; i++) {
        consistentRouter.insert(`key:${i}`, { data: `value ${i}` });
    }

    console.log('Consistent hashing distribution:');
    for (const [shardId, shard] of consistentRouter.shards) {
        console.log(`  Shard ${shardId}: ${shard.data.size} keys`);
    }
}

// Run demonstration
if (require.main === module) {
    demonstrateSharding();
}

module.exports = {
    HashBasedSharding,
    RangeBasedSharding,
    GeographicSharding,
    Shard,
    ShardRouter,
    ShardManager,
    CrossShardQueryExecutor,
    ConsistentHashingRouter
};
