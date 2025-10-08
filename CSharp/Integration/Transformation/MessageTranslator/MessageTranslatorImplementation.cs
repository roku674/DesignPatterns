using System;

namespace Integration.Transformation.MessageTranslator;

/// <summary>
/// Implementation of MessageTranslator pattern.
/// Translates message formats
/// </summary>
public class MessageTranslatorImplementation : IMessageTranslator
{
    public void Execute()
    {
        Console.WriteLine("MessageTranslator pattern executing...");
    }
}
