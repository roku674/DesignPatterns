namespace Enterprise.Distribution.DataTransferObject;

/// <summary>
/// Object carrying data between processes
/// </summary>
public interface IDataTransferObject
{
    void Execute();
}
