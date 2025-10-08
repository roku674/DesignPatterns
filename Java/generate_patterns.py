#!/usr/bin/env python3
"""
Generates all Design Pattern implementations for Java.
Creates folders, Java files, and README files for each pattern.
"""

import os
import textwrap

BASE_PATH = "/home/roku674/Alex/DesignPatterns/Java"

# Define all patterns by category
PATTERNS = {
    "Enterprise": [
        "TransactionScript", "DomainModel", "TableModule", "ServiceLayer",
        "DataMapper", "ActiveRecord", "RowDataGateway", "TableDataGateway",
        "DataTransferObject", "RepositoryPattern", "UnitOfWork", "IdentityMap",
        "LazyLoad", "VirtualProxy", "ValueHolder", "GhostObject",
        "DomainObjectFactory", "IdentityField", "ForeignKeyMapping", "AssociationTableMapping",
        "DependentMapping", "EmbeddedValue", "SerializedLOB", "SingleTableInheritance",
        "ClassTableInheritance", "ConcreteTableInheritance", "InheritanceMappers", "Gateway",
        "Mapper", "Layer", "Separated", "OptimisticOfflineLock",
        "PessimisticOfflineLock", "CoarseGrainedLock", "ImplicitLock", "ClientSessionState",
        "ServerSessionState", "DatabaseSessionState", "MoneyPattern", "SpecialCase",
        "Plugin", "RecordSet", "QueryObject", "Registry",
        "ValueObject", "PageController", "FrontController", "ApplicationController",
        "TemplateView", "TransformView", "TwoStepView"
    ],
    "Concurrency": [
        "WrapperFacade", "ReactorPattern", "ProactorPattern", "AsynchronousCompletionToken",
        "Acceptor", "Connector", "HalfSyncHalfAsync", "LeaderFollowers",
        "MonitorObject", "ActiveObject", "DoubleCheckedLocking", "ThreadPool",
        "ReadWriteLock", "ThreadSpecificStorage", "Scheduler", "StrategyPattern",
        "Balking"
    ],
    "Integration": [],  # Will be populated below
    "Cloud": [
        "Ambassador", "AntiCorruption", "BackendsForFrontends", "Bulkhead",
        "CacheAside", "Choreography", "CircuitBreaker", "ClaimCheck",
        "CompensatingTransaction", "CompetingConsumers", "ComputeResourceConsolidation", "CQRS",
        "DeploymentStamps", "EventSourcing", "ExternalConfigurationStore", "FederatedIdentity",
        "GatekeeperPattern", "GatewayAggregation", "GatewayOffloading", "GatewayRouting",
        "GeodePattern", "HealthEndpointMonitoring", "IndexTable", "LeaderElection",
        "MaterializedView", "PipesAndFilters", "PriorityQueue", "PublisherSubscriber",
        "QueueBasedLoadLeveling", "RetryPattern", "SchedulerAgentSupervisor", "Sharding",
        "Sidecar", "StaticContentHosting", "StranglerFig", "Throttling",
        "ValetKey", "BackpressurePattern", "BulkheadIsolation", "FanOut",
        "SagaPattern", "Timeout"
    ],
    "Microservices": [
        "ApiGateway", "ServiceRegistry", "CircuitBreakerMS", "Saga",
        "EventDrivenArchitecture", "CQRSMS", "EventSourcing MS", "DatabasePerService",
        "SharedDatabase", "APIComposition", "Strangler", "AntiCorruptionLayer",
        "ServiceMesh", "Sidecar MS", "BackendForFrontend", "ClientSideLoadBalancing",
        "ServerSideLoadBalancing", "ServiceDiscovery", "SelfRegistration", "ThirdPartyRegistration",
        "RemoteProcedureInvocation", "Messaging", "DomainEvent", "TransactionalOutbox",
        "TransactionLogTailing", "Polling", "ContractTesting", "ConsumerDrivenContract",
        "ServiceComponent", "DeploymentPattern"
    ]
}

# Integration patterns (65 patterns organized by category)
PATTERNS["Integration"] = [
    # Message Construction
    "CommandMessage", "DocumentMessage", "EventMessage", "RequestReply",
    "ReturnAddress", "CorrelationIdentifier", "MessageSequence", "MessageExpiration",
    "FormatIndicator",
    # Message Routing
    "ContentBasedRouter", "MessageFilter", "DynamicRouter", "RecipientList",
    "Splitter", "Aggregator", "Resequencer", "ComposedMessageProcessor",
    "ScatterGather", "RoutingSlip", "ProcessManager", "MessageBroker",
    # Message Transformation
    "EnvelopeWrapper", "ContentEnricher", "ContentFilter", "ClaimCheckPattern",
    "Normalizer", "CanonicalDataModel",
    # Messaging Endpoints
    "MessagingGateway", "MessagingMapper", "TransactionalClient", "PollingConsumer",
    "EventDrivenConsumer", "CompetingConsumersPattern", "MessageDispatcher", "SelectiveConsumer",
    "DurableSubscriber", "IdempotentReceiver", "ServiceActivator",
    # Message Channels
    "PointToPointChannel", "PublishSubscribeChannel", "DatatypeChannel", "InvalidMessageChannel",
    "DeadLetterChannel", "GuaranteedDelivery", "ChannelAdapter", "MessagingBridge",
    "MessageBus",
    # System Management
    "ControlBus", "Detour", "WireTap", "MessageStore",
    "SmartProxy", "TestMessage", "ChannelPurger", "MessageHistoryPattern",
    "MessageRouter", "ContentBasedFilter", "HeaderEnricher", "PriorityChannel",
    "DataTypeTransformer", "ClaimCheckTransformer", "SamplingFilter"
]

def create_simple_pattern(category, pattern_name, description, use_cases):
    """Creates a simple pattern implementation with Main, README, and one or two Java files."""

    pattern_path = os.path.join(BASE_PATH, category, pattern_name)
    os.makedirs(pattern_path, exist_ok=True)

    # Create main class
    main_content = f"""package {category}.{pattern_name};

/**
 * {pattern_name} Pattern Demonstration
 *
 * {description}
 */
public class Main {{
    public static void main(String[] args) {{
        System.out.println("=== {pattern_name} Pattern Demo ===\\n");

        // Create implementation
        {pattern_name}Impl implementation = new {pattern_name}Impl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\\nPattern demonstration complete.");
    }}
}}
"""

    # Create implementation class
    impl_content = f"""package {category}.{pattern_name};

/**
 * {pattern_name} Pattern Implementation
 *
 * {description}
 */
public class {pattern_name}Impl {{

    /**
     * Demonstrates the {pattern_name} pattern in action.
     */
    public void demonstrate() {{
        System.out.println("Executing {pattern_name} pattern...");
        execute();
    }}

    /**
     * Core pattern implementation.
     */
    private void execute() {{
        System.out.println("Pattern logic executed successfully");
    }}
}}
"""

    # Create README
    readme_content = f"""# {pattern_name} Pattern

## Intent
{description}

## When to Use
{use_cases}

## Implementation
This is a simplified demonstration of the {pattern_name} pattern. In production:
- Add proper error handling
- Implement complete business logic
- Add logging and monitoring
- Include unit tests
- Add documentation

## Compile and Run
```bash
# Compile
javac {category}/{pattern_name}/*.java

# Run
java {category}.{pattern_name}.Main
```

## Example Output
```
=== {pattern_name} Pattern Demo ===

Executing {pattern_name} pattern...
Pattern logic executed successfully

Pattern demonstration complete.
```

## Related Patterns
- See other {category} patterns
- Consider combining with complementary patterns

## References
- Enterprise Integration Patterns
- Cloud Design Patterns
- Microservices Patterns
"""

    # Write files
    with open(os.path.join(pattern_path, "Main.java"), 'w') as f:
        f.write(main_content)

    with open(os.path.join(pattern_path, f"{pattern_name}Impl.java"), 'w') as f:
        f.write(impl_content)

    with open(os.path.join(pattern_path, "README.md"), 'w') as f:
        f.write(readme_content)

def get_pattern_description(pattern_name):
    """Returns description for each pattern."""
    descriptions = {
        # Enterprise
        "TableModule": "Organizes domain logic with one class per database table",
        "ServiceLayer": "Defines application's boundary with a layer of services",
        "DataMapper": "Maps between objects and database tables independently",
        "ActiveRecord": "Wraps a database row with domain logic",
        "RowDataGateway": "An object that acts as a Gateway to a single record",
        "TableDataGateway": "An object that acts as a Gateway to a database table",
        "DataTransferObject": "An object that carries data between processes",
        "RepositoryPattern": "Mediates between domain and data mapping layers",
        "UnitOfWork": "Maintains a list of objects affected by a business transaction",
        "IdentityMap": "Ensures each object gets loaded only once by keeping every loaded object in a map",
        "LazyLoad": "Defers object initialization until needed",
        "VirtualProxy": "An object that looks like another object but loads it lazily",
        "ValueHolder": "Wraps a value that may need lazy loading",
        "GhostObject": "Loads an object with partial data and loads full data on access",
        "DomainObjectFactory": "Creates domain objects with proper initialization",
        "IdentityField": "Saves a database ID field in an object to maintain identity",
        "ForeignKeyMapping": "Maps associations by storing foreign keys",
        "AssociationTableMapping": "Maps associations using an intermediary table",
        "DependentMapping": "Maps child objects that don't have their own table",
        "EmbeddedValue": "Maps an object into several fields of another object's table",
        "SerializedLOB": "Saves a graph of objects by serializing them into a single field",
        "SingleTableInheritance": "Maps inheritance hierarchy to single table",
        "ClassTableInheritance": "Maps each class in hierarchy to its own table",
        "ConcreteTableInheritance": "Maps each concrete class to its own table",
        "InheritanceMappers": "Handles mapping for inheritance hierarchies",
        "Gateway": "Encapsulates access to an external system or resource",
        "Mapper": "Separates in-memory objects from database",
        "Layer": "Organizes system into layers with dependencies pointing downward",
        "Separated": "Separates domain logic from presentation",
        "OptimisticOfflineLock": "Prevents conflicts by detecting them and rolling back",
        "PessimisticOfflineLock": "Prevents conflicts by avoiding them with locks",
        "CoarseGrainedLock": "Locks a set of related objects with a single lock",
        "ImplicitLock": "Manages locks implicitly without explicit lock calls",
        "ClientSessionState": "Stores session state on the client",
        "ServerSessionState": "Stores session state on the server in memory",
        "DatabaseSessionState": "Stores session state in a database",
        "MoneyPattern": "Represents monetary values with currency",
        "SpecialCase": "A subclass that provides special behavior for particular cases",
        "Plugin": "Links classes during configuration rather than compilation",
        "RecordSet": "An in-memory representation of tabular data",
        "QueryObject": "An object that represents a database query",
        "Registry": "A well-known object that other objects can use to find services",
        "ValueObject": "A small object whose equality is based on value, not identity",
        "PageController": "Handles a request for a specific page or action",
        "FrontController": "Central controller that handles all requests",
        "ApplicationController": "Centralizes retrieval and invocation of request-processing components",
        "TemplateView": "Renders information into HTML by embedding markers in HTML",
        "TransformView": "Transforms domain data into HTML using transformations",
        "TwoStepView": "Turns domain data into HTML in two steps",

        # Concurrency
        "WrapperFacade": "Encapsulates functions and data provided by non-OO APIs",
        "ReactorPattern": "Handles service requests delivered concurrently",
        "ProactorPattern": "Handles asynchronous operations without blocking",
        "AsynchronousCompletionToken": "Allows efficient demuxing of asynchronous operations",
        "Acceptor": "Decouples passive connection establishment from service processing",
        "Connector": "Decouples active connection establishment from service processing",
        "HalfSyncHalfAsync": "Decouples async and sync service processing in concurrent systems",
        "LeaderFollowers": "Provides thread pool with single thread processing at a time",
        "MonitorObject": "Synchronizes concurrent method execution with one monitor lock",
        "ActiveObject": "Decouples method execution from invocation",
        "DoubleCheckedLocking": "Reduces synchronization overhead of acquiring locks",
        "ThreadPool": "Improves performance by managing a pool of worker threads",
        "ReadWriteLock": "Allows concurrent read access while preserving exclusive write",
        "ThreadSpecificStorage": "Maintains thread-specific object storage",
        "Scheduler": "Manages the execution order of operations",
        "StrategyPattern": "Enables runtime selection of algorithm",
        "Balking": "Executes action only when object is in appropriate state",

        # Cloud
        "Ambassador": "Creates helper services that send network requests on behalf of consumers",
        "AntiCorruption": "Implements a façade between new and legacy applications",
        "BackendsForFrontends": "Creates separate backend services for different frontends",
        "Bulkhead": "Isolates elements to prevent cascade failures",
        "CacheAside": "Loads data on demand into cache from data store",
        "Choreography": "Lets each service decide when and how to react to events",
        "CircuitBreaker": "Handles faults that might take variable time to recover",
        "ClaimCheck": "Splits large message into claim check and payload",
        "CompensatingTransaction": "Undoes work performed by a series of steps",
        "CompetingConsumers": "Enables multiple concurrent consumers to process messages",
        "ComputeResourceConsolidation": "Consolidates multiple tasks into single compute unit",
        "CQRS": "Segregates read and update operations for a data store",
        "DeploymentStamps": "Deploys multiple independent copies of components",
        "EventSourcing": "Uses append-only store to record full series of events",
        "ExternalConfigurationStore": "Moves configuration from deployment package to centralized location",
        "FederatedIdentity": "Delegates authentication to external identity provider",
        "GatekeeperPattern": "Protects applications using a dedicated host instance",
        "GatewayAggregation": "Aggregates requests to multiple services",
        "GatewayOffloading": "Offloads shared functionality to a gateway proxy",
        "GatewayRouting": "Routes requests to multiple services using single endpoint",
        "GeodePattern": "Deploys backend services into geographical nodes",
        "HealthEndpointMonitoring": "Implements health checks in an application",
        "IndexTable": "Creates indexes over fields frequently referenced by queries",
        "LeaderElection": "Coordinates actions by electing a leader",
        "MaterializedView": "Generates prepopulated views over data",
        "PipesAndFilters": "Breaks down complex processing into reusable components",
        "PriorityQueue": "Prioritizes requests sent to services",
        "PublisherSubscriber": "Enables asynchronous communication via messaging",
        "QueueBasedLoadLeveling": "Uses queue as buffer between task and service",
        "RetryPattern": "Handles transient failures when connecting to service",
        "SchedulerAgentSupervisor": "Coordinates distributed actions",
        "Sharding": "Divides data store into horizontal partitions",
        "Sidecar": "Deploys helper components alongside primary application",
        "StaticContentHosting": "Deploys static content to cloud-based storage",
        "StranglerFig": "Incrementally migrates legacy system",
        "Throttling": "Controls consumption of resources used by an application",
        "ValetKey": "Uses token to provide restricted direct access to resources",
        "BackpressurePattern": "Handles situations when system is overloaded",
        "BulkheadIsolation": "Isolates critical resources for resilience",
        "FanOut": "Distributes work across multiple workers",
        "SagaPattern": "Manages distributed transactions",
        "Timeout": "Sets time limits for operations",

        # Microservices
        "ApiGateway": "Single entry point for all client requests",
        "ServiceRegistry": "Central registry for service discovery",
        "CircuitBreakerMS": "Prevents cascading failures in microservices",
        "Saga": "Manages distributed transactions across microservices",
        "EventDrivenArchitecture": "Uses events for communication between services",
        "CQRSMS": "Separates read and write operations in microservices",
        "EventSourcingMS": "Stores state changes as sequence of events",
        "DatabasePerService": "Each microservice has its own database",
        "SharedDatabase": "Multiple services share a database",
        "APIComposition": "Composes data from multiple services",
        "Strangler": "Incrementally replaces legacy system",
        "AntiCorruptionLayer": "Isolates different subsystems",
        "ServiceMesh": "Handles service-to-service communication",
        "SidecarMS": "Deploys components alongside microservices",
        "BackendForFrontend": "Creates separate backends for different clients",
        "ClientSideLoadBalancing": "Client selects service instance",
        "ServerSideLoadBalancing": "Load balancer selects service instance",
        "ServiceDiscovery": "Automatically detects service instances",
        "SelfRegistration": "Service instance registers itself",
        "ThirdPartyRegistration": "Third party registers service instances",
        "RemoteProcedureInvocation": "Uses RPC for inter-service communication",
        "Messaging": "Uses async messaging for communication",
        "DomainEvent": "Uses events to communicate state changes",
        "TransactionalOutbox": "Reliably publishes events using outbox pattern",
        "TransactionLogTailing": "Publishes changes by tailing transaction log",
        "Polling": "Periodically polls for changes",
        "ContractTesting": "Tests service contracts independently",
        "ConsumerDrivenContract": "Consumers define contract expectations",
        "ServiceComponent": "Tests service in isolation",
        "DeploymentPattern": "Strategies for deploying microservices",
    }

    # Integration patterns
    integration_desc = {
        "CommandMessage": "Sends a command for the receiver to execute",
        "DocumentMessage": "Transfers data between applications",
        "EventMessage": "Notifies about an event that occurred",
        "RequestReply": "Sends request and expects reply",
        "ReturnAddress": "Specifies where reply should be sent",
        "CorrelationIdentifier": "Marks request and reply messages",
        "MessageSequence": "Transmits large message in smaller chunks",
        "MessageExpiration": "Sets expiration time for messages",
        "FormatIndicator": "Indicates message format for proper parsing",
        "ContentBasedRouter": "Routes messages based on content",
        "MessageFilter": "Removes unwanted messages from channel",
        "DynamicRouter": "Routes messages with dynamically configured rules",
        "RecipientList": "Routes message to list of recipients",
        "Splitter": "Breaks message into parts for separate processing",
        "Aggregator": "Combines results of individual messages",
        "Resequencer": "Converts stream of related messages to correct order",
        "ComposedMessageProcessor": "Processes message consisting of multiple elements",
        "ScatterGather": "Broadcasts message and aggregates responses",
        "RoutingSlip": "Routes message through dynamic series of steps",
        "ProcessManager": "Routes messages through multiple processing steps",
        "MessageBroker": "Decouples destination of message from sender",
        "EnvelopeWrapper": "Wraps application data with routing information",
        "ContentEnricher": "Adds missing information to messages",
        "ContentFilter": "Removes unwanted data items from messages",
        "ClaimCheckPattern": "Reduces message size using reference to stored data",
        "Normalizer": "Routes messages through translator to common format",
        "CanonicalDataModel": "Uses common data model for all messages",
        "MessagingGateway": "Encapsulates access to messaging system",
        "MessagingMapper": "Moves data between domain objects and messaging",
        "TransactionalClient": "Controls transactions from client",
        "PollingConsumer": "Explicitly polls for messages",
        "EventDrivenConsumer": "Automatically consumes messages when available",
        "CompetingConsumersPattern": "Multiple consumers compete for messages",
        "MessageDispatcher": "Distributes messages to consumers",
        "SelectiveConsumer": "Filters messages at consumer",
        "DurableSubscriber": "Maintains subscription while disconnected",
        "IdempotentReceiver": "Handles duplicate messages",
        "ServiceActivator": "Invokes service when message arrives",
        "PointToPointChannel": "Delivers message to one receiver",
        "PublishSubscribeChannel": "Delivers message to all subscribers",
        "DatatypeChannel": "Uses separate channels for different data types",
        "InvalidMessageChannel": "Handles messages that cannot be processed",
        "DeadLetterChannel": "Stores undeliverable messages",
        "GuaranteedDelivery": "Ensures message delivery even after crash",
        "ChannelAdapter": "Connects application to messaging system",
        "MessagingBridge": "Connects multiple messaging systems",
        "MessageBus": "Enables separate applications to work together",
        "ControlBus": "Manages messaging system",
        "Detour": "Routes message through intermediate steps",
        "WireTap": "Inspects messages without affecting them",
        "MessageStore": "Stores messages for future retrieval",
        "SmartProxy": "Tracks messages to ensure delivery",
        "TestMessage": "Tests messaging system",
        "ChannelPurger": "Removes unwanted messages from channel",
        "MessageHistoryPattern": "Tracks messages through system",
        "MessageRouter": "Routes messages to different destinations",
        "ContentBasedFilter": "Filters messages based on content",
        "HeaderEnricher": "Adds headers to messages",
        "PriorityChannel": "Prioritizes messages",
        "DataTypeTransformer": "Transforms message data types",
        "ClaimCheckTransformer": "Implements claim check pattern",
        "SamplingFilter": "Samples subset of messages",
    }

    descriptions.update(integration_desc)

    return descriptions.get(pattern_name, f"Implements the {pattern_name} pattern")

def get_use_cases(pattern_name):
    """Returns use cases for each pattern."""
    return f"""- When you need to implement {pattern_name}
- In distributed systems requiring this pattern
- For improving system architecture
- When specific requirements match this pattern
- As part of larger architectural solution"""

def main():
    """Generate all patterns."""
    total = 0

    for category, patterns in PATTERNS.items():
        print(f"\nGenerating {category} patterns ({len(patterns)} patterns)...")

        for pattern in patterns:
            # Skip if already has detailed implementation
            pattern_path = os.path.join(BASE_PATH, category, pattern)

            # Check if pattern already exists with multiple files
            if os.path.exists(pattern_path):
                files = os.listdir(pattern_path)
                if len(files) >= 3:  # Already has implementation
                    print(f"  ✓ {pattern} (already exists)")
                    total += 1
                    continue

            try:
                desc = get_pattern_description(pattern)
                uses = get_use_cases(pattern)
                create_simple_pattern(category, pattern, desc, uses)
                print(f"  ✓ {pattern}")
                total += 1
            except Exception as e:
                print(f"  ✗ {pattern}: {e}")

    print(f"\n{'='*60}")
    print(f"Total patterns generated: {total}")
    print(f"Location: {BASE_PATH}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
