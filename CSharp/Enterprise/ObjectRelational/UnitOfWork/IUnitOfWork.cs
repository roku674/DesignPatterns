namespace Enterprise.ObjectRelational.UnitOfWork;

/// <summary>
/// Maintains list of objects affected by business transaction
/// </summary>
public interface IUnitOfWork
{
    void Execute();
}
