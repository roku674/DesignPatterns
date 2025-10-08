namespace FactoryMethod;

/// <summary>
/// Demonstrates the Factory Method pattern with a logistics/shipping example.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Factory Method Pattern Demo ===\n");

        // Client code works with an instance of a concrete creator
        Console.WriteLine("Client: Using Road Logistics");
        ClientCode(new RoadLogistics());
        Console.WriteLine();

        Console.WriteLine("Client: Using Sea Logistics");
        ClientCode(new SeaLogistics());
        Console.WriteLine();

        Console.WriteLine("Client: Using Air Logistics");
        ClientCode(new AirLogistics());
    }

    /// <summary>
    /// The client code works with an instance of a concrete creator through its base interface.
    /// As long as the client keeps working with the creator via the base interface,
    /// you can pass it any creator's subclass.
    /// </summary>
    public static void ClientCode(LogisticsCreator creator)
    {
        Console.WriteLine($"Client: I'm not aware of the creator's class, but it still works.\n{creator.PlanDelivery()}");
    }
}
