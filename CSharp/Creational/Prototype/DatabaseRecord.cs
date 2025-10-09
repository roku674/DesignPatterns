using System.Text.Json;

namespace Prototype;

/// <summary>
/// Production-ready database record with cloning capabilities.
/// Demonstrates real data structure cloning for caching and versioning scenarios.
/// </summary>
public class DatabaseRecord : ICloneable
{
    public Guid Id { get; set; }
    public string TableName { get; set; } = string.Empty;
    public Dictionary<string, object?> Fields { get; set; } = new Dictionary<string, object?>();
    public RecordMetadata Metadata { get; set; } = new RecordMetadata();
    public List<ChangeLog> ChangeLogs { get; set; } = new List<ChangeLog>();
    public RecordState State { get; set; } = RecordState.Active;

    public DatabaseRecord()
    {
        Id = Guid.NewGuid();
        Metadata = new RecordMetadata
        {
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };
    }

    /// <summary>
    /// Copy constructor for deep cloning.
    /// </summary>
    private DatabaseRecord(DatabaseRecord source)
    {
        if (source == null)
        {
            throw new ArgumentNullException(nameof(source));
        }

        Id = source.Id; // Keep same ID for cloning
        TableName = source.TableName;
        State = source.State;

        // Deep copy of Fields dictionary
        Fields = new Dictionary<string, object?>();
        foreach (KeyValuePair<string, object?> field in source.Fields)
        {
            Fields[field.Key] = CloneValue(field.Value);
        }

        // Deep copy of Metadata
        Metadata = source.Metadata.Clone();

        // Deep copy of ChangeLogs
        ChangeLogs = new List<ChangeLog>();
        foreach (ChangeLog log in source.ChangeLogs)
        {
            ChangeLogs.Add(log.Clone());
        }
    }

    /// <summary>
    /// Clones a value, handling different types appropriately.
    /// </summary>
    private object? CloneValue(object? value)
    {
        if (value == null)
        {
            return null;
        }

        Type type = value.GetType();

        // Handle value types and strings (immutable)
        if (type.IsValueType || type == typeof(string))
        {
            return value;
        }

        // Handle ICloneable
        if (value is ICloneable cloneable)
        {
            return cloneable.Clone();
        }

        // Handle lists
        if (value is System.Collections.IList list)
        {
            System.Collections.ArrayList newList = new System.Collections.ArrayList();
            foreach (object? item in list)
            {
                newList.Add(CloneValue(item));
            }
            return newList;
        }

        // For complex objects, use serialization as fallback
        try
        {
            string json = JsonSerializer.Serialize(value);
            return JsonSerializer.Deserialize(json, type);
        }
        catch
        {
            // If serialization fails, return the original reference
            return value;
        }
    }

    /// <summary>
    /// Creates a deep copy of the database record.
    /// </summary>
    public DatabaseRecord Clone()
    {
        return new DatabaseRecord(this);
    }

    /// <summary>
    /// ICloneable implementation.
    /// </summary>
    object ICloneable.Clone()
    {
        return Clone();
    }

    /// <summary>
    /// Creates a snapshot of the record with a new ID.
    /// Useful for versioning.
    /// </summary>
    public DatabaseRecord CreateSnapshot()
    {
        DatabaseRecord snapshot = Clone();
        snapshot.Id = Guid.NewGuid();
        snapshot.Metadata.SnapshotOf = Id;
        snapshot.Metadata.CreatedAt = DateTime.UtcNow;
        snapshot.State = RecordState.Snapshot;
        return snapshot;
    }

    /// <summary>
    /// Sets a field value and logs the change.
    /// </summary>
    public void SetField(string fieldName, object? value, string changedBy = "system")
    {
        object? oldValue = Fields.ContainsKey(fieldName) ? Fields[fieldName] : null;
        Fields[fieldName] = value;

        Metadata.ModifiedAt = DateTime.UtcNow;
        Metadata.ModifiedBy = changedBy;
        Metadata.Version++;

        ChangeLogs.Add(new ChangeLog
        {
            FieldName = fieldName,
            OldValue = oldValue?.ToString() ?? "null",
            NewValue = value?.ToString() ?? "null",
            ChangedAt = DateTime.UtcNow,
            ChangedBy = changedBy
        });
    }

    /// <summary>
    /// Gets a field value with type casting.
    /// </summary>
    public T? GetField<T>(string fieldName)
    {
        if (!Fields.ContainsKey(fieldName))
        {
            return default(T);
        }

        object? value = Fields[fieldName];
        if (value == null)
        {
            return default(T);
        }

        try
        {
            return (T)Convert.ChangeType(value, typeof(T));
        }
        catch
        {
            return default(T);
        }
    }

    /// <summary>
    /// Displays record information.
    /// </summary>
    public void DisplayInfo()
    {
        Console.WriteLine($"\n=== Database Record ===");
        Console.WriteLine($"ID: {Id}");
        Console.WriteLine($"Table: {TableName}");
        Console.WriteLine($"State: {State}");
        Console.WriteLine($"Fields: {Fields.Count}");
        foreach (KeyValuePair<string, object?> field in Fields)
        {
            Console.WriteLine($"  {field.Key}: {field.Value ?? "null"}");
        }
        Console.WriteLine($"Version: {Metadata.Version}");
        Console.WriteLine($"Created: {Metadata.CreatedAt:yyyy-MM-dd HH:mm:ss} by {Metadata.CreatedBy}");
        if (Metadata.ModifiedAt.HasValue)
        {
            Console.WriteLine($"Modified: {Metadata.ModifiedAt:yyyy-MM-dd HH:mm:ss} by {Metadata.ModifiedBy}");
        }
        Console.WriteLine($"Change Logs: {ChangeLogs.Count}");
    }
}

/// <summary>
/// Metadata for database records.
/// </summary>
public class RecordMetadata : ICloneable
{
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? ModifiedAt { get; set; }
    public string ModifiedBy { get; set; } = string.Empty;
    public int Version { get; set; } = 1;
    public Guid? SnapshotOf { get; set; }

    public RecordMetadata Clone()
    {
        return new RecordMetadata
        {
            CreatedAt = CreatedAt,
            CreatedBy = CreatedBy,
            ModifiedAt = ModifiedAt,
            ModifiedBy = ModifiedBy,
            Version = Version,
            SnapshotOf = SnapshotOf
        };
    }

    object ICloneable.Clone()
    {
        return Clone();
    }
}

/// <summary>
/// Change log entry for tracking field modifications.
/// </summary>
public class ChangeLog : ICloneable
{
    public string FieldName { get; set; } = string.Empty;
    public string OldValue { get; set; } = string.Empty;
    public string NewValue { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public string ChangedBy { get; set; } = string.Empty;

    public ChangeLog Clone()
    {
        return new ChangeLog
        {
            FieldName = FieldName,
            OldValue = OldValue,
            NewValue = NewValue,
            ChangedAt = ChangedAt,
            ChangedBy = ChangedBy
        };
    }

    object ICloneable.Clone()
    {
        return Clone();
    }
}

/// <summary>
/// Record state enumeration.
/// </summary>
public enum RecordState
{
    Active,
    Deleted,
    Archived,
    Snapshot,
    Draft
}
