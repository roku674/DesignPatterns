namespace Cloud.CQRS;

/// <summary>
/// Segregates operations that read data from operations that update data
/// </summary>
public interface ICQRS
{
    void Execute();
}
