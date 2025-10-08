/**
 * Distributed Cache Pattern
 */

class CacheNode {
  constructor(id) {
    this.id = id;
    this.cache = new Map();
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = 60000) {
    this.cache.set(key, { value, expiresAt: Date.now() + ttl });
    setTimeout(() => this.cache.delete(key), ttl);
  }

  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

class DistributedCache {
  constructor(nodeCount = 3) {
    this.nodes = Array.from({ length: nodeCount }, (_, i) => new CacheNode(i));
  }

  getNode(key) {
    const hash = this.hash(key);
    return this.nodes[hash % this.nodes.length];
  }

  hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  get(key) {
    const node = this.getNode(key);
    console.log(`   [Cache] GET ${key} from node ${node.id}`);
    const entry = node.get(key);
    return entry ? entry.value : null;
  }

  set(key, value, ttl) {
    const node = this.getNode(key);
    console.log(`   [Cache] SET ${key} on node ${node.id}`);
    node.set(key, value, ttl);
  }

  has(key) {
    const node = this.getNode(key);
    return node.has(key);
  }
}

module.exports = {
  DistributedCache
};
