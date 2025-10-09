/**
 * Command Pattern - Document Editor with Real Undo/Redo
 *
 * Production-ready implementation of command pattern for a document editor.
 * Supports text manipulation with full undo/redo functionality.
 */

/**
 * Document class - the receiver that holds the actual data
 */
class Document {
  constructor() {
    this.content = [];
    this.cursor = 0;
  }

  insertText(text, position) {
    this.content.splice(position, 0, ...text.split(''));
    this.cursor = position + text.length;
    return { position, text };
  }

  deleteText(position, length) {
    const deleted = this.content.splice(position, length).join('');
    this.cursor = position;
    return { position, text: deleted };
  }

  replaceText(position, length, newText) {
    const deleted = this.content.splice(position, length, ...newText.split('')).join('');
    this.cursor = position + newText.length;
    return { position, oldText: deleted, newText };
  }

  getText() {
    return this.content.join('');
  }

  getLength() {
    return this.content.length;
  }

  setCursor(position) {
    this.cursor = Math.max(0, Math.min(position, this.content.length));
  }
}

/**
 * Abstract Command class
 */
class Command {
  execute() {
    throw new Error('execute() must be implemented');
  }

  undo() {
    throw new Error('undo() must be implemented');
  }

  redo() {
    return this.execute();
  }

  merge(command) {
    return false;
  }
}

/**
 * Insert text command
 */
class InsertTextCommand extends Command {
  constructor(document, text, position = null) {
    super();
    this.document = document;
    this.text = text;
    this.position = position !== null ? position : document.cursor;
    this.executed = false;
  }

  execute() {
    this.document.insertText(this.text, this.position);
    this.executed = true;
    return {
      action: 'insert',
      text: this.text,
      position: this.position,
      result: this.document.getText()
    };
  }

  undo() {
    if (!this.executed) {
      throw new Error('Cannot undo command that was not executed');
    }
    this.document.deleteText(this.position, this.text.length);
    return {
      action: 'undo insert',
      text: this.text,
      position: this.position,
      result: this.document.getText()
    };
  }

  merge(command) {
    if (command instanceof InsertTextCommand &&
        this.position + this.text.length === command.position) {
      this.text += command.text;
      return true;
    }
    return false;
  }
}

/**
 * Delete text command
 */
class DeleteTextCommand extends Command {
  constructor(document, position, length) {
    super();
    this.document = document;
    this.position = position;
    this.length = length;
    this.deletedText = null;
    this.executed = false;
  }

  execute() {
    const result = this.document.deleteText(this.position, this.length);
    this.deletedText = result.text;
    this.executed = true;
    return {
      action: 'delete',
      text: this.deletedText,
      position: this.position,
      result: this.document.getText()
    };
  }

  undo() {
    if (!this.executed) {
      throw new Error('Cannot undo command that was not executed');
    }
    this.document.insertText(this.deletedText, this.position);
    return {
      action: 'undo delete',
      text: this.deletedText,
      position: this.position,
      result: this.document.getText()
    };
  }
}

/**
 * Replace text command
 */
class ReplaceTextCommand extends Command {
  constructor(document, position, length, newText) {
    super();
    this.document = document;
    this.position = position;
    this.length = length;
    this.newText = newText;
    this.oldText = null;
    this.executed = false;
  }

  execute() {
    const result = this.document.replaceText(this.position, this.length, this.newText);
    this.oldText = result.oldText;
    this.executed = true;
    return {
      action: 'replace',
      oldText: this.oldText,
      newText: this.newText,
      position: this.position,
      result: this.document.getText()
    };
  }

  undo() {
    if (!this.executed) {
      throw new Error('Cannot undo command that was not executed');
    }
    this.document.replaceText(this.position, this.newText.length, this.oldText);
    return {
      action: 'undo replace',
      text: this.oldText,
      position: this.position,
      result: this.document.getText()
    };
  }
}

/**
 * Macro command - executes multiple commands as one
 */
class MacroCommand extends Command {
  constructor(commands = []) {
    super();
    this.commands = commands;
    this.executed = false;
  }

  addCommand(command) {
    this.commands.push(command);
  }

  execute() {
    const results = [];
    for (const command of this.commands) {
      results.push(command.execute());
    }
    this.executed = true;
    return { action: 'macro', results };
  }

  undo() {
    if (!this.executed) {
      throw new Error('Cannot undo command that was not executed');
    }
    const results = [];
    for (let i = this.commands.length - 1; i >= 0; i--) {
      results.push(this.commands[i].undo());
    }
    return { action: 'undo macro', results };
  }
}

/**
 * Command Manager - handles undo/redo stack
 */
class CommandManager {
  constructor(maxHistorySize = 100) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistorySize = maxHistorySize;
  }

  execute(command) {
    const result = command.execute();

    // Try to merge with previous command (e.g., consecutive typing)
    if (this.undoStack.length > 0) {
      const lastCommand = this.undoStack[this.undoStack.length - 1];
      if (lastCommand.merge(command)) {
        this.redoStack = [];
        return result;
      }
    }

    this.undoStack.push(command);
    this.redoStack = [];

    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    return result;
  }

  undo() {
    if (this.undoStack.length === 0) {
      throw new Error('Nothing to undo');
    }

    const command = this.undoStack.pop();
    const result = command.undo();
    this.redoStack.push(command);

    return result;
  }

  redo() {
    if (this.redoStack.length === 0) {
      throw new Error('Nothing to redo');
    }

    const command = this.redoStack.pop();
    const result = command.redo();
    this.undoStack.push(command);

    return result;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  getHistorySize() {
    return {
      undo: this.undoStack.length,
      redo: this.redoStack.length
    };
  }
}

/**
 * Document Editor - high-level interface
 */
class DocumentEditor {
  constructor() {
    this.document = new Document();
    this.commandManager = new CommandManager();
  }

  type(text) {
    const command = new InsertTextCommand(this.document, text);
    return this.commandManager.execute(command);
  }

  insertAt(text, position) {
    const command = new InsertTextCommand(this.document, text, position);
    return this.commandManager.execute(command);
  }

  delete(length) {
    const position = Math.max(0, this.document.cursor - length);
    const command = new DeleteTextCommand(this.document, position, length);
    return this.commandManager.execute(command);
  }

  deleteAt(position, length) {
    const command = new DeleteTextCommand(this.document, position, length);
    return this.commandManager.execute(command);
  }

  replace(position, length, newText) {
    const command = new ReplaceTextCommand(this.document, position, length, newText);
    return this.commandManager.execute(command);
  }

  findAndReplace(searchText, replaceText) {
    const text = this.document.getText();
    const macro = new MacroCommand();

    let position = 0;
    while ((position = text.indexOf(searchText, position)) !== -1) {
      macro.addCommand(
        new ReplaceTextCommand(this.document, position, searchText.length, replaceText)
      );
      position += replaceText.length;
    }

    if (macro.commands.length > 0) {
      return this.commandManager.execute(macro);
    }

    return { action: 'findAndReplace', found: 0 };
  }

  undo() {
    return this.commandManager.undo();
  }

  redo() {
    return this.commandManager.redo();
  }

  getText() {
    return this.document.getText();
  }

  canUndo() {
    return this.commandManager.canUndo();
  }

  canRedo() {
    return this.commandManager.canRedo();
  }

  getHistory() {
    return this.commandManager.getHistorySize();
  }
}

module.exports = {
  Document,
  Command,
  InsertTextCommand,
  DeleteTextCommand,
  ReplaceTextCommand,
  MacroCommand,
  CommandManager,
  DocumentEditor
};
