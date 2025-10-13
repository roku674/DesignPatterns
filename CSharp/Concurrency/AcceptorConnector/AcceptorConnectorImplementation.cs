using System;
using System.Collections.Generic;
using System.Threading;

namespace Concurrency.AcceptorConnector;

/// <summary>
/// Represents connection information for a client/server connection
/// </summary>
public class Connection
{
    public string ConnectionId { get; set; }
    public string RemoteAddress { get; set; }
    public int Port { get; set; }
    public DateTime EstablishedAt { get; set; }
    public ConnectionType Type { get; set; }

    public Connection(string id, string address, int port, ConnectionType type)
    {
        ConnectionId = id;
        RemoteAddress = address;
        Port = port;
        EstablishedAt = DateTime.Now;
        Type = type;
    }

    public override string ToString()
    {
        return $"[{Type}] Connection {ConnectionId} to {RemoteAddress}:{Port} established at {EstablishedAt:HH:mm:ss.fff}";
    }
}

/// <summary>
/// Type of connection (passive or active)
/// </summary>
public enum ConnectionType
{
    Passive,  // Server accepting connections
    Active    // Client initiating connections
}

/// <summary>
/// Abstract service handler that processes connections
/// </summary>
public interface IServiceHandler
{
    void HandleConnection(Connection connection);
    string ServiceName { get; }
}

/// <summary>
/// Concrete service handler for echo service
/// </summary>
public class EchoServiceHandler : IServiceHandler
{
    public string ServiceName => "Echo Service";

    public void HandleConnection(Connection connection)
    {
        Console.WriteLine($"[{ServiceName}] Handling connection: {connection.ConnectionId}");
        Console.WriteLine($"[{ServiceName}] Remote: {connection.RemoteAddress}:{connection.Port}");

        // Simulate echo service processing
        Thread.Sleep(100);
        Console.WriteLine($"[{ServiceName}] Echo: 'Hello from {connection.RemoteAddress}'");
        Console.WriteLine($"[{ServiceName}] Connection {connection.ConnectionId} processed successfully\n");
    }
}

/// <summary>
/// Concrete service handler for HTTP service
/// </summary>
public class HttpServiceHandler : IServiceHandler
{
    public string ServiceName => "HTTP Service";

    public void HandleConnection(Connection connection)
    {
        Console.WriteLine($"[{ServiceName}] Handling connection: {connection.ConnectionId}");
        Console.WriteLine($"[{ServiceName}] Remote: {connection.RemoteAddress}:{connection.Port}");

        // Simulate HTTP request processing
        Thread.Sleep(150);
        Console.WriteLine($"[{ServiceName}] GET /index.html HTTP/1.1");
        Console.WriteLine($"[{ServiceName}] Response: 200 OK");
        Console.WriteLine($"[{ServiceName}] Connection {connection.ConnectionId} processed successfully\n");
    }
}

/// <summary>
/// Concrete service handler for database service
/// </summary>
public class DatabaseServiceHandler : IServiceHandler
{
    public string ServiceName => "Database Service";

    public void HandleConnection(Connection connection)
    {
        Console.WriteLine($"[{ServiceName}] Handling connection: {connection.ConnectionId}");
        Console.WriteLine($"[{ServiceName}] Remote: {connection.RemoteAddress}:{connection.Port}");

        // Simulate database query processing
        Thread.Sleep(120);
        Console.WriteLine($"[{ServiceName}] Query: SELECT * FROM users WHERE id = 1");
        Console.WriteLine($"[{ServiceName}] Result: 1 row returned");
        Console.WriteLine($"[{ServiceName}] Connection {connection.ConnectionId} processed successfully\n");
    }
}

/// <summary>
/// Acceptor - Implements the passive connection initialization strategy
/// Listens for connection requests and creates service handlers when connections are established
/// </summary>
public class Acceptor
{
    private readonly string listenAddress;
    private readonly int listenPort;
    private readonly IServiceHandler serviceHandler;
    private readonly Queue<Connection> acceptedConnections;
    private int connectionCounter;

    public Acceptor(string address, int port, IServiceHandler handler)
    {
        listenAddress = address;
        listenPort = port;
        serviceHandler = handler;
        acceptedConnections = new Queue<Connection>();
        connectionCounter = 0;
    }

    /// <summary>
    /// Accept an incoming connection (passive initialization)
    /// </summary>
    public Connection Accept()
    {
        Console.WriteLine($"[Acceptor] Listening on {listenAddress}:{listenPort}");
        Console.WriteLine($"[Acceptor] Waiting for incoming connections...");

        // Simulate accepting a connection
        Thread.Sleep(50);

        connectionCounter++;
        Connection connection = new Connection(
            $"ACC-{connectionCounter:D3}",
            $"192.168.1.{100 + connectionCounter}",
            listenPort,
            ConnectionType.Passive
        );

        acceptedConnections.Enqueue(connection);
        Console.WriteLine($"[Acceptor] Connection accepted: {connection.ConnectionId} from {connection.RemoteAddress}");

        return connection;
    }

    /// <summary>
    /// Activate service handler for the accepted connection
    /// </summary>
    public void ActivateServiceHandler(Connection connection)
    {
        Console.WriteLine($"[Acceptor] Activating service handler for {connection.ConnectionId}");
        serviceHandler.HandleConnection(connection);
    }

    public int AcceptedConnectionCount => acceptedConnections.Count;
    public string ServiceName => serviceHandler.ServiceName;
}

/// <summary>
/// Connector - Implements the active connection initialization strategy
/// Actively initiates connections to remote services and creates service handlers
/// </summary>
public class Connector
{
    private readonly IServiceHandler serviceHandler;
    private readonly Queue<Connection> establishedConnections;
    private int connectionCounter;

    public Connector(IServiceHandler handler)
    {
        serviceHandler = handler;
        establishedConnections = new Queue<Connection>();
        connectionCounter = 0;
    }

    /// <summary>
    /// Connect to a remote service (active initialization)
    /// </summary>
    public Connection Connect(string remoteAddress, int remotePort)
    {
        Console.WriteLine($"[Connector] Initiating connection to {remoteAddress}:{remotePort}");

        // Simulate connection establishment
        Thread.Sleep(75);

        connectionCounter++;
        Connection connection = new Connection(
            $"CONN-{connectionCounter:D3}",
            remoteAddress,
            remotePort,
            ConnectionType.Active
        );

        establishedConnections.Enqueue(connection);
        Console.WriteLine($"[Connector] Connection established: {connection.ConnectionId} to {connection.RemoteAddress}");

        return connection;
    }

    /// <summary>
    /// Activate service handler for the established connection
    /// </summary>
    public void ActivateServiceHandler(Connection connection)
    {
        Console.WriteLine($"[Connector] Activating service handler for {connection.ConnectionId}");
        serviceHandler.HandleConnection(connection);
    }

    /// <summary>
    /// Complete connection - combines connection establishment and handler activation
    /// </summary>
    public void CompleteConnection(string remoteAddress, int remotePort)
    {
        Connection connection = Connect(remoteAddress, remotePort);
        ActivateServiceHandler(connection);
    }

    public int EstablishedConnectionCount => establishedConnections.Count;
    public string ServiceName => serviceHandler.ServiceName;
}

/// <summary>
/// Concrete implementation of AcceptorConnector pattern.
/// Decouples connection establishment from service processing
///
/// Key Benefits:
/// 1. Separates connection establishment from service handling
/// 2. Supports both passive (server) and active (client) initialization
/// 3. Allows service handlers to be reused across different connection types
/// 4. Makes it easier to add new connection strategies
/// 5. Enhances portability and maintainability
/// </summary>
public class AcceptorConnectorImplementation : IAcceptorConnector
{
    public void Execute()
    {
        Console.WriteLine("=== AcceptorConnector Pattern Implementation ===");
        Console.WriteLine("\nThe AcceptorConnector pattern decouples connection establishment");
        Console.WriteLine("from service processing using two strategies:");
        Console.WriteLine("1. Acceptor - Passive connection initialization (server-side)");
        Console.WriteLine("2. Connector - Active connection initialization (client-side)");
        Console.WriteLine("\nKey Components:");
        Console.WriteLine("- Connection: Represents an established connection");
        Console.WriteLine("- ServiceHandler: Processes connections independently");
        Console.WriteLine("- Acceptor: Listens for and accepts incoming connections");
        Console.WriteLine("- Connector: Initiates outgoing connections");

        Console.WriteLine("\n--- Demonstration 1: Passive Initialization (Acceptor) ---\n");
        DemonstrateAcceptor();

        Console.WriteLine("\n--- Demonstration 2: Active Initialization (Connector) ---\n");
        DemonstrateConnector();

        Console.WriteLine("\n--- Demonstration 3: Mixed Client-Server Scenario ---\n");
        DemonstrateMixedScenario();

        Console.WriteLine("\n=== AcceptorConnector Pattern Demonstration Complete ===");
        Console.WriteLine("\nKey Observations:");
        Console.WriteLine("- Connection establishment is decoupled from service processing");
        Console.WriteLine("- Acceptor handles passive (server-side) connections");
        Console.WriteLine("- Connector handles active (client-side) connections");
        Console.WriteLine("- Service handlers are reusable across different connection types");
        Console.WriteLine("- Pattern enhances flexibility and maintainability");
    }

    /// <summary>
    /// Demonstrates the Acceptor pattern for passive connection initialization
    /// </summary>
    private void DemonstrateAcceptor()
    {
        Console.WriteLine("Creating Acceptor for Echo Service on port 8080...");
        Acceptor echoAcceptor = new Acceptor("0.0.0.0", 8080, new EchoServiceHandler());

        Console.WriteLine($"Service: {echoAcceptor.ServiceName}\n");

        // Simulate multiple clients connecting to the server
        Console.WriteLine("Simulating 3 client connections...\n");

        for (int i = 0; i < 3; i++)
        {
            Connection connection = echoAcceptor.Accept();
            Console.WriteLine(connection);
            echoAcceptor.ActivateServiceHandler(connection);
        }

        Console.WriteLine($"Total connections accepted: {echoAcceptor.AcceptedConnectionCount}");
    }

    /// <summary>
    /// Demonstrates the Connector pattern for active connection initialization
    /// </summary>
    private void DemonstrateConnector()
    {
        Console.WriteLine("Creating Connector for HTTP Service...");
        Connector httpConnector = new Connector(new HttpServiceHandler());

        Console.WriteLine($"Service: {httpConnector.ServiceName}\n");

        // Simulate client connecting to multiple servers
        Console.WriteLine("Simulating connections to 3 HTTP servers...\n");

        string[] servers =
        {
            "web1.example.com",
            "web2.example.com",
            "web3.example.com"
        };

        foreach (string server in servers)
        {
            httpConnector.CompleteConnection(server, 80);
        }

        Console.WriteLine($"Total connections established: {httpConnector.EstablishedConnectionCount}");
    }

    /// <summary>
    /// Demonstrates both Acceptor and Connector in a realistic client-server scenario
    /// </summary>
    private void DemonstrateMixedScenario()
    {
        Console.WriteLine("Setting up database server (Acceptor) and clients (Connectors)...\n");

        // Server side - Acceptor for database service
        Acceptor dbAcceptor = new Acceptor("0.0.0.0", 5432, new DatabaseServiceHandler());
        Console.WriteLine($"[Server] {dbAcceptor.ServiceName} started on port 5432\n");

        // Client side - Connectors for database clients
        Connector dbConnector1 = new Connector(new DatabaseServiceHandler());
        Connector dbConnector2 = new Connector(new DatabaseServiceHandler());

        Console.WriteLine("[Client 1] Application server connecting to database...");
        Connection clientConn1 = dbConnector1.Connect("db.example.com", 5432);
        Console.WriteLine(clientConn1);

        Console.WriteLine("\n[Client 2] Web server connecting to database...");
        Connection clientConn2 = dbConnector2.Connect("db.example.com", 5432);
        Console.WriteLine(clientConn2);

        Console.WriteLine("\n[Server] Accepting connections from clients...\n");

        // Server accepts the connections
        Connection serverConn1 = dbAcceptor.Accept();
        Console.WriteLine(serverConn1);

        Connection serverConn2 = dbAcceptor.Accept();
        Console.WriteLine(serverConn2);

        Console.WriteLine("\n[Server] Processing client requests...\n");

        // Server processes the connections
        dbAcceptor.ActivateServiceHandler(serverConn1);
        dbAcceptor.ActivateServiceHandler(serverConn2);

        Console.WriteLine($"[Server] Total connections accepted: {dbAcceptor.AcceptedConnectionCount}");
        Console.WriteLine($"[Client 1] Total connections established: {dbConnector1.EstablishedConnectionCount}");
        Console.WriteLine($"[Client 2] Total connections established: {dbConnector2.EstablishedConnectionCount}");
    }
}
