using System;

namespace Microservices.Observability.AuditLogging;

/// <summary>
/// Implementation of AuditLogging pattern.
/// Records user activity for audit trail
/// </summary>
public class AuditLoggingImplementation : IAuditLogging
{
    public void Execute()
    {
        Console.WriteLine("AuditLogging pattern executing...");
    }
}
