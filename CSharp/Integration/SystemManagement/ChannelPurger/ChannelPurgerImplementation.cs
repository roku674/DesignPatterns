using System;

namespace Integration.SystemManagement.ChannelPurger;

/// <summary>
/// Implementation of ChannelPurger pattern.
/// Removes unwanted messages
/// </summary>
public class ChannelPurgerImplementation : IChannelPurger
{
    public void Execute()
    {
        Console.WriteLine("ChannelPurger pattern executing...");
    }
}
