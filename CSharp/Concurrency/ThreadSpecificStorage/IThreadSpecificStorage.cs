namespace Concurrency.ThreadSpecificStorage;

/// <summary>
/// Allows multiple threads to use logically global access
/// </summary>
public interface IThreadSpecificStorage
{
    void Execute();
}
