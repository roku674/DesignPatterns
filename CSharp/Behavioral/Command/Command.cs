using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DesignPatterns.Behavioral.Command
{
    // Real Command pattern implementation with undo/redo
    // Use case: Text editor with full undo/redo functionality

    public interface ICommand
    {
        Task ExecuteAsync();
        Task UndoAsync();
        string GetDescription();
    }

    // Document class that holds the actual content
    public class Document
    {
        private StringBuilder _content;
        private readonly object _lockObject = new object();

        public Document()
        {
            _content = new StringBuilder();
        }

        public void InsertText(int position, string text)
        {
            lock (_lockObject)
            {
                if (position < 0 || position > _content.Length)
                {
                    throw new ArgumentOutOfRangeException(nameof(position));
                }
                _content.Insert(position, text);
            }
        }

        public void DeleteText(int position, int length)
        {
            lock (_lockObject)
            {
                if (position < 0 || position >= _content.Length)
                {
                    throw new ArgumentOutOfRangeException(nameof(position));
                }
                if (length < 0 || position + length > _content.Length)
                {
                    throw new ArgumentOutOfRangeException(nameof(length));
                }
                _content.Remove(position, length);
            }
        }

        public void ReplaceText(int position, int length, string newText)
        {
            lock (_lockObject)
            {
                if (position < 0 || position >= _content.Length)
                {
                    throw new ArgumentOutOfRangeException(nameof(position));
                }
                if (length < 0 || position + length > _content.Length)
                {
                    throw new ArgumentOutOfRangeException(nameof(length));
                }
                _content.Remove(position, length);
                _content.Insert(position, newText);
            }
        }

        public string GetContent()
        {
            lock (_lockObject)
            {
                return _content.ToString();
            }
        }

        public int Length
        {
            get
            {
                lock (_lockObject)
                {
                    return _content.Length;
                }
            }
        }

        public void Clear()
        {
            lock (_lockObject)
            {
                _content.Clear();
            }
        }
    }

    // Insert text command
    public class InsertTextCommand : ICommand
    {
        private readonly Document _document;
        private readonly int _position;
        private readonly string _text;

        public InsertTextCommand(Document document, int position, string text)
        {
            _document = document ?? throw new ArgumentNullException(nameof(document));
            _position = position;
            _text = text ?? throw new ArgumentNullException(nameof(text));
        }

        public async Task ExecuteAsync()
        {
            await Task.Run(() =>
            {
                _document.InsertText(_position, _text);
            });
        }

        public async Task UndoAsync()
        {
            await Task.Run(() =>
            {
                _document.DeleteText(_position, _text.Length);
            });
        }

        public string GetDescription()
        {
            return $"Insert '{_text}' at position {_position}";
        }
    }

    // Delete text command
    public class DeleteTextCommand : ICommand
    {
        private readonly Document _document;
        private readonly int _position;
        private readonly int _length;
        private string _deletedText;

        public DeleteTextCommand(Document document, int position, int length)
        {
            _document = document ?? throw new ArgumentNullException(nameof(document));
            _position = position;
            _length = length;
        }

        public async Task ExecuteAsync()
        {
            await Task.Run(() =>
            {
                string content = _document.GetContent();
                _deletedText = content.Substring(_position, _length);
                _document.DeleteText(_position, _length);
            });
        }

        public async Task UndoAsync()
        {
            await Task.Run(() =>
            {
                if (_deletedText != null)
                {
                    _document.InsertText(_position, _deletedText);
                }
            });
        }

        public string GetDescription()
        {
            return $"Delete {_length} characters at position {_position}";
        }
    }

    // Replace text command
    public class ReplaceTextCommand : ICommand
    {
        private readonly Document _document;
        private readonly int _position;
        private readonly int _length;
        private readonly string _newText;
        private string _oldText;

        public ReplaceTextCommand(Document document, int position, int length, string newText)
        {
            _document = document ?? throw new ArgumentNullException(nameof(document));
            _position = position;
            _length = length;
            _newText = newText ?? throw new ArgumentNullException(nameof(newText));
        }

        public async Task ExecuteAsync()
        {
            await Task.Run(() =>
            {
                string content = _document.GetContent();
                _oldText = content.Substring(_position, _length);
                _document.ReplaceText(_position, _length, _newText);
            });
        }

        public async Task UndoAsync()
        {
            await Task.Run(() =>
            {
                if (_oldText != null)
                {
                    _document.ReplaceText(_position, _newText.Length, _oldText);
                }
            });
        }

        public string GetDescription()
        {
            return $"Replace {_length} characters at position {_position} with '{_newText}'";
        }
    }

    // Macro command (composite)
    public class MacroCommand : ICommand
    {
        private readonly List<ICommand> _commands;
        private readonly string _description;

        public MacroCommand(string description)
        {
            _description = description ?? "Macro Command";
            _commands = new List<ICommand>();
        }

        public void AddCommand(ICommand command)
        {
            if (command == null)
            {
                throw new ArgumentNullException(nameof(command));
            }
            _commands.Add(command);
        }

        public async Task ExecuteAsync()
        {
            foreach (ICommand command in _commands)
            {
                await command.ExecuteAsync();
            }
        }

        public async Task UndoAsync()
        {
            // Undo in reverse order
            for (int i = _commands.Count - 1; i >= 0; i--)
            {
                await _commands[i].UndoAsync();
            }
        }

        public string GetDescription()
        {
            return $"{_description} ({_commands.Count} operations)";
        }
    }

    // Command manager with undo/redo stacks
    public class CommandManager
    {
        private readonly Stack<ICommand> _undoStack;
        private readonly Stack<ICommand> _redoStack;
        private readonly int _maxHistorySize;
        private readonly object _lockObject = new object();

        public CommandManager(int maxHistorySize = 100)
        {
            _undoStack = new Stack<ICommand>();
            _redoStack = new Stack<ICommand>();
            _maxHistorySize = maxHistorySize;
        }

        public async Task ExecuteCommandAsync(ICommand command)
        {
            if (command == null)
            {
                throw new ArgumentNullException(nameof(command));
            }

            try
            {
                await command.ExecuteAsync();

                lock (_lockObject)
                {
                    _undoStack.Push(command);
                    _redoStack.Clear(); // Clear redo stack after new command

                    // Limit history size
                    if (_undoStack.Count > _maxHistorySize)
                    {
                        Stack<ICommand> tempStack = new Stack<ICommand>();
                        for (int i = 0; i < _maxHistorySize; i++)
                        {
                            tempStack.Push(_undoStack.Pop());
                        }
                        _undoStack.Clear();
                        while (tempStack.Count > 0)
                        {
                            _undoStack.Push(tempStack.Pop());
                        }
                    }
                }

                Console.WriteLine($"[EXECUTED] {command.GetDescription()}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EXECUTION FAILED] {command.GetDescription()}: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> UndoAsync()
        {
            ICommand command = null;

            lock (_lockObject)
            {
                if (_undoStack.Count == 0)
                {
                    Console.WriteLine("[UNDO] No commands to undo");
                    return false;
                }
                command = _undoStack.Pop();
            }

            try
            {
                await command.UndoAsync();

                lock (_lockObject)
                {
                    _redoStack.Push(command);
                }

                Console.WriteLine($"[UNDONE] {command.GetDescription()}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UNDO FAILED] {command.GetDescription()}: {ex.Message}");
                lock (_lockObject)
                {
                    _undoStack.Push(command); // Restore to undo stack
                }
                return false;
            }
        }

        public async Task<bool> RedoAsync()
        {
            ICommand command = null;

            lock (_lockObject)
            {
                if (_redoStack.Count == 0)
                {
                    Console.WriteLine("[REDO] No commands to redo");
                    return false;
                }
                command = _redoStack.Pop();
            }

            try
            {
                await command.ExecuteAsync();

                lock (_lockObject)
                {
                    _undoStack.Push(command);
                }

                Console.WriteLine($"[REDONE] {command.GetDescription()}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[REDO FAILED] {command.GetDescription()}: {ex.Message}");
                lock (_lockObject)
                {
                    _redoStack.Push(command); // Restore to redo stack
                }
                return false;
            }
        }

        public int UndoCount
        {
            get
            {
                lock (_lockObject)
                {
                    return _undoStack.Count;
                }
            }
        }

        public int RedoCount
        {
            get
            {
                lock (_lockObject)
                {
                    return _redoStack.Count;
                }
            }
        }

        public List<string> GetUndoHistory()
        {
            lock (_lockObject)
            {
                return _undoStack.Select(cmd => cmd.GetDescription()).ToList();
            }
        }

        public List<string> GetRedoHistory()
        {
            lock (_lockObject)
            {
                return _redoStack.Select(cmd => cmd.GetDescription()).ToList();
            }
        }
    }

    // Text editor application
    public class TextEditor
    {
        private readonly Document _document;
        private readonly CommandManager _commandManager;

        public TextEditor()
        {
            _document = new Document();
            _commandManager = new CommandManager();
        }

        public async Task InsertTextAsync(int position, string text)
        {
            InsertTextCommand command = new InsertTextCommand(_document, position, text);
            await _commandManager.ExecuteCommandAsync(command);
        }

        public async Task DeleteTextAsync(int position, int length)
        {
            DeleteTextCommand command = new DeleteTextCommand(_document, position, length);
            await _commandManager.ExecuteCommandAsync(command);
        }

        public async Task ReplaceTextAsync(int position, int length, string newText)
        {
            ReplaceTextCommand command = new ReplaceTextCommand(_document, position, length, newText);
            await _commandManager.ExecuteCommandAsync(command);
        }

        public async Task ExecuteMacroAsync(MacroCommand macro)
        {
            await _commandManager.ExecuteCommandAsync(macro);
        }

        public async Task UndoAsync()
        {
            await _commandManager.UndoAsync();
        }

        public async Task RedoAsync()
        {
            await _commandManager.RedoAsync();
        }

        public string GetContent()
        {
            return _document.GetContent();
        }

        public CommandManager CommandManager => _commandManager;
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Command Pattern - Text Editor with Undo/Redo ===\n");

            try
            {
                TextEditor editor = new TextEditor();

                // Execute a series of commands
                await editor.InsertTextAsync(0, "Hello");
                Console.WriteLine($"Content: \"{editor.GetContent()}\"\n");

                await editor.InsertTextAsync(5, " World");
                Console.WriteLine($"Content: \"{editor.GetContent()}\"\n");

                await editor.InsertTextAsync(11, "!");
                Console.WriteLine($"Content: \"{editor.GetContent()}\"\n");

                await editor.ReplaceTextAsync(6, 5, "C#");
                Console.WriteLine($"Content: \"{editor.GetContent()}\"\n");

                // Create and execute a macro
                MacroCommand formatMacro = new MacroCommand("Format Text");
                formatMacro.AddCommand(new DeleteTextCommand(editor.GetContent().Length > 0 ?
                    new Document() : throw new InvalidOperationException(), 0, 0));

                Document macroDoc = new Document();
                macroDoc.InsertText(0, editor.GetContent());

                InsertTextCommand prefixCmd = new InsertTextCommand(macroDoc, 0, "[FORMATTED] ");
                InsertTextCommand suffixCmd = new InsertTextCommand(macroDoc, macroDoc.Length, " [END]");

                formatMacro.AddCommand(prefixCmd);
                formatMacro.AddCommand(suffixCmd);

                Console.WriteLine("\n=== Testing Undo/Redo ===\n");

                // Undo operations
                await editor.UndoAsync();
                Console.WriteLine($"Content: \"{editor.GetContent()}\"\n");

                await editor.UndoAsync();
                Console.WriteLine($"Content: \"{editor.GetContent()}\"\n");

                // Redo operations
                await editor.RedoAsync();
                Console.WriteLine($"Content: \"{editor.GetContent()}\"\n");

                await editor.RedoAsync();
                Console.WriteLine($"Content: \"{editor.GetContent()}\"\n");

                // Undo all
                Console.WriteLine("\n=== Undoing all operations ===\n");
                while (editor.CommandManager.UndoCount > 0)
                {
                    await editor.UndoAsync();
                    Console.WriteLine($"Content: \"{editor.GetContent()}\"");
                }

                // Redo all
                Console.WriteLine("\n=== Redoing all operations ===\n");
                while (editor.CommandManager.RedoCount > 0)
                {
                    await editor.RedoAsync();
                    Console.WriteLine($"Content: \"{editor.GetContent()}\"");
                }

                Console.WriteLine("\n=== Final State ===");
                Console.WriteLine($"Content: \"{editor.GetContent()}\"");
                Console.WriteLine($"Undo Stack Size: {editor.CommandManager.UndoCount}");
                Console.WriteLine($"Redo Stack Size: {editor.CommandManager.RedoCount}");

                Console.WriteLine("\n=== Pattern Demonstration Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }
    }
}
