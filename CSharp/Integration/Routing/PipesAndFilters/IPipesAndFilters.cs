namespace Integration.Routing.PipesAndFilters;

/// <summary>
/// Divides large processing task into sequence
/// </summary>
public interface IPipesAndFilters
{
    void Execute();
}
