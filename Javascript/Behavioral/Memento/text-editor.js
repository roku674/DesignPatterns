/**
 * Memento Pattern - Text Editor with Undo
 */

class EditorMemento {
  constructor(content) {
    this.content = content;
    this.timestamp = new Date();
  }

  getContent() {
    return this.content;
  }
}

class TextEditor {
  constructor() {
    this.content = '';
  }

  type(text) {
    this.content += text;
  }

  getContent() {
    return this.content;
  }

  save() {
    return new EditorMemento(this.content);
  }

  restore(memento) {
    this.content = memento.getContent();
  }
}

class History {
  constructor() {
    this.mementos = [];
  }

  push(memento) {
    this.mementos.push(memento);
  }

  pop() {
    return this.mementos.pop();
  }
}

module.exports = { TextEditor, History };
