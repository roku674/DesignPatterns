namespace Integration.SystemManagement.Detour;

/// <summary>
/// Routes message through intermediate steps
/// </summary>
public interface IDetour
{
    void Execute();
}
