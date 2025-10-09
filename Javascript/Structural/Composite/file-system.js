/**
 * Composite Pattern - REAL Production Implementation
 *
 * Real file system operations with actual directory manipulation,
 * searching, filtering, and tree operations.
 */

const fs = require('fs');
const path = require('path');

// ============= Component =============

class FileSystemNode {
  constructor(name) {
    this.name = name;
    this.parent = null;
  }

  getName() {
    return this.name;
  }

  getPath() {
    if (!this.parent) return this.name;
    return path.join(this.parent.getPath(), this.name);
  }

  setParent(parent) {
    this.parent = parent;
  }

  getSize() {
    throw new Error('Method getSize() must be implemented');
  }

  search(predicate) {
    throw new Error('Method search() must be implemented');
  }

  toJSON() {
    throw new Error('Method toJSON() must be implemented');
  }
}

// ============= Leaf =============

class File extends FileSystemNode {
  constructor(name, size = 0, content = '') {
    super(name);
    this.size = size;
    this.content = content;
    this.extension = path.extname(name).slice(1);
    this.createdAt = new Date();
    this.modifiedAt = new Date();
  }

  getSize() {
    return this.size;
  }

  getExtension() {
    return this.extension;
  }

  getContent() {
    return this.content;
  }

  setContent(content) {
    this.content = content;
    this.size = Buffer.byteLength(content, 'utf8');
    this.modifiedAt = new Date();
  }

  read() {
    return {
      name: this.name,
      content: this.content,
      size: this.size,
      type: 'file'
    };
  }

  write(content) {
    this.setContent(content);
    return { success: true, size: this.size };
  }

  search(predicate) {
    return predicate(this) ? [this] : [];
  }

  toJSON() {
    return {
      type: 'file',
      name: this.name,
      size: this.size,
      extension: this.extension,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt
    };
  }

  clone() {
    return new File(this.name, this.size, this.content);
  }
}

// ============= Composite =============

class Directory extends FileSystemNode {
  constructor(name) {
    super(name);
    this.children = [];
    this.createdAt = new Date();
  }

  add(node) {
    if (!node) {
      throw new Error('Cannot add null node');
    }
    if (this.children.find(child => child.getName() === node.getName())) {
      throw new Error(`Node with name '${node.getName()}' already exists`);
    }
    this.children.push(node);
    node.setParent(this);
    return this;
  }

  remove(node) {
    const index = this.children.indexOf(node);
    if (index > -1) {
      this.children.splice(index, 1);
      node.setParent(null);
      return true;
    }
    return false;
  }

  getChild(name) {
    return this.children.find(child => child.getName() === name);
  }

  getChildren() {
    return [...this.children];
  }

  getSize() {
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

  search(predicate) {
    let results = [];

    if (predicate(this)) {
      results.push(this);
    }

    for (const child of this.children) {
      results = results.concat(child.search(predicate));
    }

    return results;
  }

  findByName(name) {
    return this.search(node => node.getName() === name);
  }

  findByExtension(ext) {
    return this.search(node =>
      node instanceof File && node.getExtension() === ext
    );
  }

  findLargeFiles(minSize) {
    return this.search(node =>
      node instanceof File && node.getSize() > minSize
    );
  }

  findByPattern(pattern) {
    const regex = new RegExp(pattern);
    return this.search(node => regex.test(node.getName()));
  }

  isEmpty() {
    return this.children.length === 0;
  }

  clear() {
    this.children = [];
    return this;
  }

  toJSON() {
    return {
      type: 'directory',
      name: this.name,
      size: this.getSize(),
      fileCount: this.getFileCount(),
      directoryCount: this.getDirectoryCount(),
      createdAt: this.createdAt,
      children: this.children.map(child => child.toJSON())
    };
  }

  toTree(indent = '') {
    let tree = `${indent}${this.name}/\n`;
    const childIndent = indent + '  ';
    for (const child of this.children) {
      if (child instanceof Directory) {
        tree += child.toTree(childIndent);
      } else {
        tree += `${childIndent}${child.getName()} (${this.formatSize(child.getSize())})\n`;
      }
    }
    return tree;
  }

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Real file system operations
  async saveToDisk(basePath) {
    const dirPath = path.join(basePath, this.name);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    for (const child of this.children) {
      if (child instanceof File) {
        const filePath = path.join(dirPath, child.getName());
        fs.writeFileSync(filePath, child.getContent());
      } else if (child instanceof Directory) {
        await child.saveToDisk(dirPath);
      }
    }

    return { success: true, path: dirPath };
  }

  static loadFromDisk(dirPath) {
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Directory not found: ${dirPath}`);
    }

    const dirName = path.basename(dirPath);
    const directory = new Directory(dirName);

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        const subDir = Directory.loadFromDisk(itemPath);
        directory.add(subDir);
      } else if (stats.isFile()) {
        const content = fs.readFileSync(itemPath, 'utf8');
        const file = new File(item, stats.size, content);
        directory.add(file);
      }
    }

    return directory;
  }

  clone() {
    const cloned = new Directory(this.name);
    for (const child of this.children) {
      cloned.add(child.clone());
    }
    return cloned;
  }
}

// ============= Operations =============

class FileSystemOperations {
  static calculateTotalSize(node) {
    return node.getSize();
  }

  static countFiles(node) {
    if (node instanceof File) return 1;
    if (node instanceof Directory) return node.getFileCount();
    return 0;
  }

  static countDirectories(node) {
    if (node instanceof Directory) return 1 + node.getDirectoryCount();
    return 0;
  }

  static findDuplicates(node) {
    const fileMap = new Map();
    const duplicates = [];

    const files = node.search(n => n instanceof File);

    for (const file of files) {
      const key = `${file.getSize()}-${file.getContent().substring(0, 100)}`;
      if (fileMap.has(key)) {
        duplicates.push({
          original: fileMap.get(key),
          duplicate: file
        });
      } else {
        fileMap.set(key, file);
      }
    }

    return duplicates;
  }

  static getStatistics(node) {
    return {
      totalSize: node.getSize(),
      fileCount: FileSystemOperations.countFiles(node),
      directoryCount: FileSystemOperations.countDirectories(node),
      largestFile: FileSystemOperations.findLargestFile(node),
      mostCommonExtension: FileSystemOperations.getMostCommonExtension(node)
    };
  }

  static findLargestFile(node) {
    const files = node.search(n => n instanceof File);
    if (files.length === 0) return null;
    return files.reduce((largest, file) =>
      file.getSize() > largest.getSize() ? file : largest
    );
  }

  static getMostCommonExtension(node) {
    const files = node.search(n => n instanceof File);
    const extCounts = new Map();

    for (const file of files) {
      const ext = file.getExtension();
      extCounts.set(ext, (extCounts.get(ext) || 0) + 1);
    }

    let mostCommon = { ext: null, count: 0 };
    for (const [ext, count] of extCounts) {
      if (count > mostCommon.count) {
        mostCommon = { ext, count };
      }
    }

    return mostCommon;
  }
}

module.exports = {
  FileSystemNode,
  File,
  Directory,
  FileSystemOperations
};
