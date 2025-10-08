namespace Microservices.Observability.AuditLogging;

/// <summary>
/// Records user activity for audit trail
/// </summary>
public interface IAuditLogging
{
    void Execute();
}
