using System;

namespace Integration.MessageConstruction.DocumentMessage;

/// <summary>
/// Implementation of DocumentMessage pattern.
/// Passes data between applications
/// </summary>
public class DocumentMessageImplementation : IDocumentMessage
{
    public void Execute()
    {
        Console.WriteLine("DocumentMessage pattern executing...");
    }
}
