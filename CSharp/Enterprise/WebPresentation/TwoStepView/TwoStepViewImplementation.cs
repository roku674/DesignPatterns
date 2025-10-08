using System;

namespace Enterprise.WebPresentation.TwoStepView;

/// <summary>
/// Concrete implementation of TwoStepView pattern.
/// Turns domain data to logical presentation then HTML
/// </summary>
public class TwoStepViewImplementation : ITwoStepView
{
    public void Execute()
    {
        Console.WriteLine("TwoStepView pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
