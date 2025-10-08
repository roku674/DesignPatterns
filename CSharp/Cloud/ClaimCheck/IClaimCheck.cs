namespace Cloud.ClaimCheck;

/// <summary>
/// Splits large message into claim check and payload
/// </summary>
public interface IClaimCheck
{
    void Execute();
}
