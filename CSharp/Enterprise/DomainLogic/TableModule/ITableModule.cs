namespace Enterprise.DomainLogic.TableModule;

/// <summary>
/// Organizes domain logic with one class per database table
/// </summary>
public interface ITableModule
{
    void Execute();
}
