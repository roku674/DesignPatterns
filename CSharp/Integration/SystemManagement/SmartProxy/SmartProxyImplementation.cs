using System;

namespace Integration.SystemManagement.SmartProxy;

/// <summary>
/// Implementation of SmartProxy pattern.
/// Tracks messages sent to requester
/// </summary>
public class SmartProxyImplementation : ISmartProxy
{
    public void Execute()
    {
        Console.WriteLine("SmartProxy pattern executing...");
    }
}
