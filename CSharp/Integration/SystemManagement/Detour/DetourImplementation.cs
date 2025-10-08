using System;

namespace Integration.SystemManagement.Detour;

/// <summary>
/// Implementation of Detour pattern.
/// Routes message through intermediate steps
/// </summary>
public class DetourImplementation : IDetour
{
    public void Execute()
    {
        Console.WriteLine("Detour pattern executing...");
    }
}
