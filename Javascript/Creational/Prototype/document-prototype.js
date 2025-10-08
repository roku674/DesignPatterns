/**
 * Prototype Pattern - Document Cloning Example
 *
 * The Prototype pattern lets you copy existing objects without making
 * your code dependent on their classes. It delegates the cloning process
 * to the actual objects being cloned.
 */

/**
 * Prototype Interface
 * Declares the cloning method
 */
class Prototype {
  clone() {
    throw new Error('Method clone() must be implemented');
  }
}

/**
 * Concrete Prototype: Document
 * Base document class with cloning capability
 */
class Document extends Prototype {
  constructor(title, content, metadata = {}) {
    super();
    this.title = title;
    this.content = content;
    this.metadata = { ...metadata };
    this.createdAt = new Date();
    this.author = metadata.author || 'Unknown';
    this.tags = metadata.tags || [];
  }

  /**
   * Clone this document
   * Performs deep copy of all properties
   */
  clone() {
    // Create a new instance with same properties
    const cloned = new Document(
      this.title,
      this.content,
      {
        author: this.author,
        tags: [...this.tags] // Deep copy array
      }
    );

    // Copy other properties
    cloned.createdAt = new Date(this.createdAt);

    return cloned;
  }

  /**
   * Display document info
   */
  display() {
    return `
Document: "${this.title}"
Author: ${this.author}
Created: ${this.createdAt.toLocaleDateString()}
Tags: ${this.tags.join(', ') || 'None'}
Content Preview: ${this.content.substring(0, 50)}...
    `.trim();
  }

  /**
   * Update content
   */
  setContent(content) {
    this.content = content;
  }

  /**
   * Add tag
   */
  addTag(tag) {
    this.tags.push(tag);
  }
}

/**
 * Concrete Prototype: Report Document
 * Specialized document type with additional properties
 */
class ReportDocument extends Document {
  constructor(title, content, metadata = {}) {
    super(title, content, metadata);
    this.sections = [];
    this.charts = [];
    this.confidential = metadata.confidential || false;
  }

  /**
   * Clone this report with all sections and charts
   */
  clone() {
    const cloned = new ReportDocument(
      this.title,
      this.content,
      {
        author: this.author,
        tags: [...this.tags],
        confidential: this.confidential
      }
    );

    // Deep copy sections and charts
    cloned.sections = this.sections.map(section => ({ ...section }));
    cloned.charts = this.charts.map(chart => ({ ...chart }));
    cloned.createdAt = new Date(this.createdAt);

    return cloned;
  }

  /**
   * Add a section to the report
   */
  addSection(title, data) {
    this.sections.push({ title, data });
  }

  /**
   * Add a chart to the report
   */
  addChart(type, data) {
    this.charts.push({ type, data });
  }

  /**
   * Display report info
   */
  display() {
    const baseInfo = super.display();
    const reportInfo = `
Confidential: ${this.confidential ? 'Yes' : 'No'}
Sections: ${this.sections.length}
Charts: ${this.charts.length}
    `.trim();
    return `${baseInfo}\n${reportInfo}`;
  }
}

/**
 * Concrete Prototype: Template Document
 * Represents a reusable document template
 */
class TemplateDocument extends Document {
  constructor(title, content, metadata = {}) {
    super(title, content, metadata);
    this.placeholders = metadata.placeholders || [];
    this.category = metadata.category || 'General';
  }

  /**
   * Clone this template
   */
  clone() {
    const cloned = new TemplateDocument(
      this.title,
      this.content,
      {
        author: this.author,
        tags: [...this.tags],
        placeholders: [...this.placeholders],
        category: this.category
      }
    );

    cloned.createdAt = new Date(this.createdAt);
    return cloned;
  }

  /**
   * Fill placeholders in the template
   */
  fillPlaceholders(values) {
    let filledContent = this.content;

    this.placeholders.forEach(placeholder => {
      const pattern = new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g');
      const value = values[placeholder] || `{${placeholder}}`;
      filledContent = filledContent.replace(pattern, value);
    });

    return filledContent;
  }

  /**
   * Display template info
   */
  display() {
    const baseInfo = super.display();
    const templateInfo = `
Category: ${this.category}
Placeholders: ${this.placeholders.join(', ') || 'None'}
    `.trim();
    return `${baseInfo}\n${templateInfo}`;
  }
}

/**
 * Prototype Registry
 * Manages a catalog of prototype instances
 */
class DocumentRegistry {
  constructor() {
    this.prototypes = new Map();
  }

  /**
   * Register a prototype
   */
  register(key, prototype) {
    this.prototypes.set(key, prototype);
  }

  /**
   * Get a clone of a registered prototype
   */
  create(key) {
    const prototype = this.prototypes.get(key);
    if (!prototype) {
      throw new Error(`Prototype "${key}" not found in registry`);
    }
    return prototype.clone();
  }

  /**
   * List all registered prototypes
   */
  list() {
    return Array.from(this.prototypes.keys());
  }

  /**
   * Remove a prototype from registry
   */
  unregister(key) {
    return this.prototypes.delete(key);
  }
}

module.exports = {
  Document,
  ReportDocument,
  TemplateDocument,
  DocumentRegistry
};
