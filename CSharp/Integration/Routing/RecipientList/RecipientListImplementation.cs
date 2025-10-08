using System;

namespace Integration.Routing.RecipientList;

/// <summary>
/// Implementation of RecipientList pattern.
/// Routes message to list of recipients
/// </summary>
public class RecipientListImplementation : IRecipientList
{
    public void Execute()
    {
        Console.WriteLine("RecipientList pattern executing...");
    }
}
