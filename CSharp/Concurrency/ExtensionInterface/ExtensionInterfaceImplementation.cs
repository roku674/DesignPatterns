using System;
using System.Collections.Generic;

namespace Concurrency.ExtensionInterface;

/// <summary>
/// Base interface for components that support QueryInterface-style capability discovery
/// </summary>
public interface IExtensible
{
    T QueryInterface<T>() where T : class;
    bool SupportsInterface<T>() where T : class;
    IEnumerable<Type> GetSupportedInterfaces();
}

/// <summary>
/// Basic document interface - version 1
/// </summary>
public interface IDocument
{
    string GetContent();
    void SetContent(string content);
}

/// <summary>
/// Extended document interface with versioning - version 2
/// </summary>
public interface IDocumentV2 : IDocument
{
    string GetMetadata(string key);
    void SetMetadata(string key, string value);
    int GetVersion();
}

/// <summary>
/// Editable interface for components that support editing
/// </summary>
public interface IEditable
{
    void BeginEdit();
    void EndEdit();
    bool IsEditing();
    void Undo();
    void Redo();
}

/// <summary>
/// Serializable interface for components that support persistence
/// </summary>
public interface ISerializable
{
    string Serialize();
    void Deserialize(string data);
    string GetFormat();
}

/// <summary>
/// Printable interface for components that support printing
/// </summary>
public interface IPrintable
{
    void Print();
    string GetPrintPreview();
}

/// <summary>
/// Concrete implementation demonstrating ExtensionInterface pattern.
/// A document component that implements multiple interfaces and supports
/// QueryInterface-style capability discovery.
/// </summary>
public class ExtensibleDocument : IExtensible, IDocumentV2, IEditable, ISerializable, IPrintable
{
    private string _content;
    private readonly Dictionary<string, string> _metadata;
    private bool _isEditing;
    private readonly Stack<string> _undoStack;
    private readonly Stack<string> _redoStack;
    private const int Version = 2;

    public ExtensibleDocument()
    {
        _content = string.Empty;
        _metadata = new Dictionary<string, string>();
        _isEditing = false;
        _undoStack = new Stack<string>();
        _redoStack = new Stack<string>();

        // Initialize default metadata
        _metadata["created"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        _metadata["modified"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    }

    #region IExtensible Implementation

    /// <summary>
    /// QueryInterface-style capability discovery
    /// </summary>
    public T QueryInterface<T>() where T : class
    {
        if (typeof(T).IsAssignableFrom(GetType()))
        {
            return this as T;
        }
        return null;
    }

    /// <summary>
    /// Check if this component supports a specific interface
    /// </summary>
    public bool SupportsInterface<T>() where T : class
    {
        return typeof(T).IsAssignableFrom(GetType());
    }

    /// <summary>
    /// Get all interfaces supported by this component
    /// </summary>
    public IEnumerable<Type> GetSupportedInterfaces()
    {
        return new List<Type>
        {
            typeof(IExtensible),
            typeof(IDocument),
            typeof(IDocumentV2),
            typeof(IEditable),
            typeof(ISerializable),
            typeof(IPrintable)
        };
    }

    #endregion

    #region IDocument Implementation (V1)

    public string GetContent()
    {
        return _content;
    }

    public void SetContent(string content)
    {
        if (_isEditing)
        {
            _undoStack.Push(_content);
            _redoStack.Clear();
        }
        _content = content;
        _metadata["modified"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    }

    #endregion

    #region IDocumentV2 Implementation (V2)

    public string GetMetadata(string key)
    {
        return _metadata.ContainsKey(key) ? _metadata[key] : null;
    }

    public void SetMetadata(string key, string value)
    {
        _metadata[key] = value;
        _metadata["modified"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    }

    public int GetVersion()
    {
        return Version;
    }

    #endregion

    #region IEditable Implementation

    public void BeginEdit()
    {
        _isEditing = true;
        Console.WriteLine("  [Edit Mode] Started");
    }

    public void EndEdit()
    {
        _isEditing = false;
        Console.WriteLine("  [Edit Mode] Ended");
    }

    public bool IsEditing()
    {
        return _isEditing;
    }

    public void Undo()
    {
        if (_undoStack.Count > 0)
        {
            _redoStack.Push(_content);
            _content = _undoStack.Pop();
            Console.WriteLine("  [Edit] Undo performed");
        }
        else
        {
            Console.WriteLine("  [Edit] Nothing to undo");
        }
    }

    public void Redo()
    {
        if (_redoStack.Count > 0)
        {
            _undoStack.Push(_content);
            _content = _redoStack.Pop();
            Console.WriteLine("  [Edit] Redo performed");
        }
        else
        {
            Console.WriteLine("  [Edit] Nothing to redo");
        }
    }

    #endregion

    #region ISerializable Implementation

    public string Serialize()
    {
        string metadataStr = string.Join(";", _metadata.Keys);
        string metadataValues = string.Join(";", _metadata.Values);
        return $"DOCUMENT|{_content}|{metadataStr}|{metadataValues}";
    }

    public void Deserialize(string data)
    {
        string[] parts = data.Split('|');
        if (parts.Length >= 2 && parts[0] == "DOCUMENT")
        {
            _content = parts[1];
            if (parts.Length >= 4)
            {
                string[] keys = parts[2].Split(';');
                string[] values = parts[3].Split(';');
                _metadata.Clear();
                for (int i = 0; i < Math.Min(keys.Length, values.Length); i++)
                {
                    _metadata[keys[i]] = values[i];
                }
            }
        }
    }

    public string GetFormat()
    {
        return "DOCUMENT_FORMAT_V2";
    }

    #endregion

    #region IPrintable Implementation

    public void Print()
    {
        Console.WriteLine("\n========== DOCUMENT PRINT ==========");
        Console.WriteLine($"Content: {_content}");
        Console.WriteLine($"Created: {GetMetadata("created")}");
        Console.WriteLine($"Modified: {GetMetadata("modified")}");
        Console.WriteLine($"Version: {Version}");
        Console.WriteLine("====================================\n");
    }

    public string GetPrintPreview()
    {
        return $"[Preview] Content: {_content.Substring(0, Math.Min(50, _content.Length))}...";
    }

    #endregion
}

/// <summary>
/// Concrete implementation of ExtensionInterface pattern.
/// Demonstrates the pattern by showing multiple interface implementations
/// and QueryInterface-style capability discovery.
/// </summary>
public class ExtensionInterfaceImplementation : IExtensionInterface
{
    public void Execute()
    {
        Console.WriteLine("ExtensionInterface pattern executing...\n");

        // Create a component that implements multiple interfaces
        ExtensibleDocument document = new ExtensibleDocument();

        Console.WriteLine("1. Demonstrating Multiple Interface Support:");
        Console.WriteLine("   Supported interfaces:");
        foreach (Type interfaceType in document.GetSupportedInterfaces())
        {
            Console.WriteLine($"   - {interfaceType.Name}");
        }

        // Use as IDocument (V1)
        Console.WriteLine("\n2. Using as IDocument (Version 1):");
        IDocument docV1 = document.QueryInterface<IDocument>();
        if (docV1 != null)
        {
            docV1.SetContent("Hello, ExtensionInterface Pattern!");
            Console.WriteLine($"   Content: {docV1.GetContent()}");
        }

        // Use as IDocumentV2 (versioned interface)
        Console.WriteLine("\n3. Using as IDocumentV2 (Version 2 - with metadata):");
        IDocumentV2 docV2 = document.QueryInterface<IDocumentV2>();
        if (docV2 != null)
        {
            docV2.SetMetadata("author", "Design Patterns Demo");
            docV2.SetMetadata("category", "Concurrency");
            Console.WriteLine($"   Version: {docV2.GetVersion()}");
            Console.WriteLine($"   Author: {docV2.GetMetadata("author")}");
            Console.WriteLine($"   Category: {docV2.GetMetadata("category")}");
        }

        // Use as IEditable
        Console.WriteLine("\n4. Using as IEditable:");
        IEditable editable = document.QueryInterface<IEditable>();
        if (editable != null)
        {
            editable.BeginEdit();
            docV1.SetContent("Modified content during edit");
            Console.WriteLine($"   Is editing: {editable.IsEditing()}");
            docV1.SetContent("Further modifications");
            editable.Undo();
            Console.WriteLine($"   Content after undo: {docV1.GetContent()}");
            editable.EndEdit();
        }

        // Use as ISerializable
        Console.WriteLine("\n5. Using as ISerializable:");
        ISerializable serializable = document.QueryInterface<ISerializable>();
        if (serializable != null)
        {
            Console.WriteLine($"   Format: {serializable.GetFormat()}");
            string serialized = serializable.Serialize();
            Console.WriteLine($"   Serialized: {serialized.Substring(0, Math.Min(80, serialized.Length))}...");
        }

        // Use as IPrintable
        Console.WriteLine("\n6. Using as IPrintable:");
        IPrintable printable = document.QueryInterface<IPrintable>();
        if (printable != null)
        {
            Console.WriteLine($"   {printable.GetPrintPreview()}");
            printable.Print();
        }

        // Demonstrate interface checking
        Console.WriteLine("7. Demonstrating Interface Capability Checking:");
        Console.WriteLine($"   Supports IEditable? {document.SupportsInterface<IEditable>()}");
        Console.WriteLine($"   Supports IPrintable? {document.SupportsInterface<IPrintable>()}");
        Console.WriteLine($"   Supports IDisposable? {document.SupportsInterface<IDisposable>()}");

        // Demonstrate QueryInterface returning null for unsupported interfaces
        Console.WriteLine("\n8. Demonstrating Unsupported Interface Query:");
        IDisposable disposable = document.QueryInterface<IDisposable>();
        Console.WriteLine($"   QueryInterface<IDisposable>() returned: {(disposable == null ? "null (not supported)" : "instance")}");

        Console.WriteLine("\nPattern Benefits:");
        Console.WriteLine("- Single component provides multiple capabilities");
        Console.WriteLine("- Runtime capability discovery via QueryInterface");
        Console.WriteLine("- Interface versioning support (IDocument vs IDocumentV2)");
        Console.WriteLine("- Clients can query for specific capabilities they need");
        Console.WriteLine("- Graceful degradation when interfaces not supported");
    }
}
