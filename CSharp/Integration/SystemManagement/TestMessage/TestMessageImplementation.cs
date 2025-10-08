using System;

namespace Integration.SystemManagement.TestMessage;

/// <summary>
/// Implementation of TestMessage pattern.
/// Ensures health of processing
/// </summary>
public class TestMessageImplementation : ITestMessage
{
    public void Execute()
    {
        Console.WriteLine("TestMessage pattern executing...");
    }
}
