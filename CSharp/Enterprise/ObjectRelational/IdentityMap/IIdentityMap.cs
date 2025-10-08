namespace Enterprise.ObjectRelational.IdentityMap;

/// <summary>
/// Ensures each object loaded only once by keeping map
/// </summary>
public interface IIdentityMap
{
    void Execute();
}
