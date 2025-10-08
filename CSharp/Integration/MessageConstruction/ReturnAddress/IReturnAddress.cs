namespace Integration.MessageConstruction.ReturnAddress;

/// <summary>
/// Indicates where reply should be sent
/// </summary>
public interface IReturnAddress
{
    void Execute();
}
