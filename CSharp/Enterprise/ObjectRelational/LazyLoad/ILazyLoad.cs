namespace Enterprise.ObjectRelational.LazyLoad;

/// <summary>
/// Object that doesn't contain all data but knows how to get it
/// </summary>
public interface ILazyLoad
{
    void Execute();
}
