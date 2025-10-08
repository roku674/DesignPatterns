/**
 * Composite Pattern - File System Example
 *
 * The Composite pattern lets you compose objects into tree structures
 * to represent part-whole hierarchies. It lets clients treat individual
 * objects and compositions uniformly.
 */

/**
 * Component: FileSystemNode
 * Base interface for both files and directories
 */
class FileSystemNode {
  constructor(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  getSize() {
    throw new Error('Method getSize() must be implemented');
  }

  print(indent = '') {
    throw new Error('Method print() must be implemented');
  }

  // Methods for composite operations
  add(node) {
    throw new Error('Cannot add to a leaf node');
  }

  remove(node) {
    throw new Error('Cannot remove from a leaf node');
  }

  getChild(index) {
    throw new Error('Leaf nodes have no children');
  }
}

/**
 * Leaf: File
 * Represents individual files (leaf nodes)
 */
class File extends FileSystemNode {
  constructor(name, size) {
    super(name);
    this.size = size;
    this.extension = name.split('.').pop();
  }

  getSize() {
    return this.size;
  }

  getExtension() {
    return this.extension;
  }

  print(indent = '') {
    console.log(`${indent}📄 ${this.name} (${this.formatSize(this.size)})`);
  }

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

/**
 * Composite: Directory
 * Represents directories (composite nodes) that can contain files and other directories
 */
class Directory extends FileSystemNode {
  constructor(name) {
    super(name);
    this.children = [];
  }

  add(node) {
    this.children.push(node);
    return this;
  }

  remove(node) {
    const index = this.children.indexOf(node);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    return this;
  }

  getChild(index) {
    return this.children[index];
  }

  getChildren() {
    return [...this.children];
  }

  getSize() {
    // Recursively calculate total size of all children
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }

  getFileCount() {
    return this.children.reduce((count, child) => {
      if (child instanceof File) {
        return count + 1;
      } else if (child instanceof Directory) {
        return count + child.getFileCount();
      }
      return count;
    }, 0);
  }

  getDirectoryCount() {
    return this.children.reduce((count, child) => {
      if (child instanceof Directory) {
        return count + 1 + child.getDirectoryCount();
      }
      return count;
    }, 0);
  }

  print(indent = '') {
    console.log(`${indent}📁 ${this.name}/ (${this.formatSize(this.getSize())})`);
    this.children.forEach(child => child.print(indent + '  '));
  }

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Find all files with specific extension
   */
  findByExtension(ext) {
    const results = [];

    this.children.forEach(child => {
      if (child instanceof File && child.getExtension() === ext) {
        results.push(child);
      } else if (child instanceof Directory) {
        results.push(...child.findByExtension(ext));
      }
    });

    return results;
  }

  /**
   * Find files larger than specified size
   */
  findLargeFiles(minSize) {
    const results = [];

    this.children.forEach(child => {
      if (child instanceof File && child.getSize() > minSize) {
        results.push(child);
      } else if (child instanceof Directory) {
        results.push(...child.findLargeFiles(minSize));
      }
    });

    return results;
  }
}

module.exports = {
  FileSystemNode,
  File,
  Directory
};
