using System;

namespace Enterprise.DataSource.ActiveRecord;

/// <summary>
/// Demonstrates the ActiveRecord pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ActiveRecord Pattern Demo ===\n");

        IActiveRecord pattern = new ActiveRecordImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
