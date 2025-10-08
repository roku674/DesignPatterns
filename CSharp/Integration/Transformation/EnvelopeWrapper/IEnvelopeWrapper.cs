namespace Integration.Transformation.EnvelopeWrapper;

/// <summary>
/// Wraps message with routing information
/// </summary>
public interface IEnvelopeWrapper
{
    void Execute();
}
