namespace Cloud.CompensatingTransaction;

/// <summary>
/// Undoes work performed by series of steps
/// </summary>
public interface ICompensatingTransaction
{
    void Execute();
}
