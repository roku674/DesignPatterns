namespace Enterprise.BasePatterns.Plugin;

/// <summary>
/// Links classes during configuration rather than compilation
/// </summary>
public interface IPlugin
{
    void Execute();
}
