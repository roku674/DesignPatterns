using System;

namespace Cloud.ValetKey;

/// <summary>
/// Implementation of ValetKey pattern.
/// Uses token providing limited access to specific resource
/// </summary>
public class ValetKeyImplementation : IValetKey
{
    public void Execute()
    {
        Console.WriteLine("ValetKey pattern executing...");
    }
}
