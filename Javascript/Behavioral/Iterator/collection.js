/**
 * Iterator Pattern - Lazy Collection with Real Data Operations
 *
 * Production-ready implementation with lazy evaluation, filtering, mapping,
 * and real data processing capabilities.
 */

/**
 * Base Iterator interface
 */
class Iterator {
  hasNext() {
    throw new Error('hasNext() must be implemented');
  }

  next() {
    throw new Error('next() must be implemented');
  }
}

/**
 * Array Iterator - basic iteration over arrays
 */
class ArrayIterator extends Iterator {
  constructor(items) {
    super();
    this.items = items;
    this.index = 0;
  }

  hasNext() {
    return this.index < this.items.length;
  }

  next() {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }
    return this.items[this.index++];
  }

  reset() {
    this.index = 0;
  }
}

/**
 * Reverse Iterator - iterates backwards
 */
class ReverseIterator extends Iterator {
  constructor(items) {
    super();
    this.items = items;
    this.index = items.length - 1;
  }

  hasNext() {
    return this.index >= 0;
  }

  next() {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }
    return this.items[this.index--];
  }
}

/**
 * Filter Iterator - lazy filtering
 */
class FilterIterator extends Iterator {
  constructor(iterator, predicate) {
    super();
    this.iterator = iterator;
    this.predicate = predicate;
    this.nextItem = null;
    this.hasNextItem = false;
    this.findNext();
  }

  findNext() {
    this.hasNextItem = false;
    while (this.iterator.hasNext()) {
      const item = this.iterator.next();
      if (this.predicate(item)) {
        this.nextItem = item;
        this.hasNextItem = true;
        break;
      }
    }
  }

  hasNext() {
    return this.hasNextItem;
  }

  next() {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }
    const item = this.nextItem;
    this.findNext();
    return item;
  }
}

/**
 * Map Iterator - lazy transformation
 */
class MapIterator extends Iterator {
  constructor(iterator, mapper) {
    super();
    this.iterator = iterator;
    this.mapper = mapper;
  }

  hasNext() {
    return this.iterator.hasNext();
  }

  next() {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }
    return this.mapper(this.iterator.next());
  }
}

/**
 * Take Iterator - limits number of elements
 */
class TakeIterator extends Iterator {
  constructor(iterator, limit) {
    super();
    this.iterator = iterator;
    this.limit = limit;
    this.count = 0;
  }

  hasNext() {
    return this.count < this.limit && this.iterator.hasNext();
  }

  next() {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }
    this.count++;
    return this.iterator.next();
  }
}

/**
 * Skip Iterator - skips first N elements
 */
class SkipIterator extends Iterator {
  constructor(iterator, count) {
    super();
    this.iterator = iterator;
    this.skipped = false;
    this.skipCount = count;
  }

  skip() {
    if (!this.skipped) {
      for (let i = 0; i < this.skipCount && this.iterator.hasNext(); i++) {
        this.iterator.next();
      }
      this.skipped = true;
    }
  }

  hasNext() {
    this.skip();
    return this.iterator.hasNext();
  }

  next() {
    this.skip();
    return this.iterator.next();
  }
}

/**
 * Range Iterator - generates number sequences
 */
class RangeIterator extends Iterator {
  constructor(start, end, step = 1) {
    super();
    this.current = start;
    this.end = end;
    this.step = step;
  }

  hasNext() {
    return this.step > 0 ? this.current < this.end : this.current > this.end;
  }

  next() {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }
    const value = this.current;
    this.current += this.step;
    return value;
  }
}

/**
 * Lazy Collection - chainable lazy operations
 */
class LazyCollection {
  constructor(items) {
    if (items instanceof Iterator) {
      this.iterator = items;
    } else if (Array.isArray(items)) {
      this.iterator = new ArrayIterator(items);
    } else {
      throw new Error('Invalid items type');
    }
  }

  static range(start, end, step = 1) {
    return new LazyCollection(new RangeIterator(start, end, step));
  }

  static from(items) {
    return new LazyCollection(items);
  }

  filter(predicate) {
    return new LazyCollection(new FilterIterator(this.iterator, predicate));
  }

  map(mapper) {
    return new LazyCollection(new MapIterator(this.iterator, mapper));
  }

  take(limit) {
    return new LazyCollection(new TakeIterator(this.iterator, limit));
  }

  skip(count) {
    return new LazyCollection(new SkipIterator(this.iterator, count));
  }

  forEach(callback) {
    while (this.iterator.hasNext()) {
      callback(this.iterator.next());
    }
  }

  toArray() {
    const result = [];
    while (this.iterator.hasNext()) {
      result.push(this.iterator.next());
    }
    return result;
  }

  reduce(reducer, initialValue) {
    let accumulator = initialValue;
    let first = true;

    while (this.iterator.hasNext()) {
      const item = this.iterator.next();
      if (first && accumulator === undefined) {
        accumulator = item;
        first = false;
      } else {
        accumulator = reducer(accumulator, item);
      }
    }

    return accumulator;
  }

  find(predicate) {
    while (this.iterator.hasNext()) {
      const item = this.iterator.next();
      if (predicate(item)) {
        return item;
      }
    }
    return undefined;
  }

  some(predicate) {
    while (this.iterator.hasNext()) {
      if (predicate(this.iterator.next())) {
        return true;
      }
    }
    return false;
  }

  every(predicate) {
    while (this.iterator.hasNext()) {
      if (!predicate(this.iterator.next())) {
        return false;
      }
    }
    return true;
  }

  count() {
    let count = 0;
    while (this.iterator.hasNext()) {
      this.iterator.next();
      count++;
    }
    return count;
  }

  sum() {
    return this.reduce((acc, val) => acc + val, 0);
  }

  average() {
    let sum = 0;
    let count = 0;

    while (this.iterator.hasNext()) {
      sum += this.iterator.next();
      count++;
    }

    return count === 0 ? 0 : sum / count;
  }

  min() {
    return this.reduce((min, val) => val < min ? val : min);
  }

  max() {
    return this.reduce((max, val) => val > max ? val : max);
  }
}

/**
 * Tree Iterator - depth-first and breadth-first traversal
 */
class TreeNode {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
  }

  addChild(node) {
    this.children.push(node);
  }
}

class DepthFirstIterator extends Iterator {
  constructor(root) {
    super();
    this.stack = root ? [root] : [];
  }

  hasNext() {
    return this.stack.length > 0;
  }

  next() {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }

    const node = this.stack.pop();

    // Add children in reverse order for correct DFS order
    for (let i = node.children.length - 1; i >= 0; i--) {
      this.stack.push(node.children[i]);
    }

    return node.value;
  }
}

class BreadthFirstIterator extends Iterator {
  constructor(root) {
    super();
    this.queue = root ? [root] : [];
  }

  hasNext() {
    return this.queue.length > 0;
  }

  next() {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }

    const node = this.queue.shift();

    // Add all children to queue
    for (const child of node.children) {
      this.queue.push(child);
    }

    return node.value;
  }
}

module.exports = {
  Iterator,
  ArrayIterator,
  ReverseIterator,
  FilterIterator,
  MapIterator,
  TakeIterator,
  SkipIterator,
  RangeIterator,
  LazyCollection,
  TreeNode,
  DepthFirstIterator,
  BreadthFirstIterator
};
