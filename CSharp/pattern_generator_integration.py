#!/usr/bin/env python3
"""
Enterprise Integration Patterns Generator
"""

import os

BASE_DIR = "/home/roku674/Alex/DesignPatterns/CSharp"

INTEGRATION_PATTERNS = {
    "Integration/MessageConstruction": {
        "Message": "Basic unit of data transmitted",
        "CommandMessage": "Invokes procedure in receiver",
        "DocumentMessage": "Passes data between applications",
        "EventMessage": "Notifies changes to receivers",
        "RequestReply": "Enables two-way communication",
        "ReturnAddress": "Indicates where reply should be sent",
        "CorrelationIdentifier": "Matches request with reply",
        "MessageSequence": "Transmits large data as sequence",
        "MessageExpiration": "Prevents stale messages",
        "FormatIndicator": "Indicates message format"
    },
    "Integration/Routing": {
        "PipesAndFilters": "Divides large processing task into sequence",
        "MessageRouter": "Routes message to different consumers",
        "ContentBasedRouter": "Routes based on message content",
        "MessageFilter": "Filters unwanted messages",
        "DynamicRouter": "Routes with dynamic rules",
        "RecipientList": "Routes message to list of recipients",
        "Splitter": "Breaks message into parts",
        "Aggregator": "Combines related messages",
        "Resequencer": "Restores correct message order",
        "ComposedMessageProcessor": "Maintains overall flow",
        "ScatterGather": "Broadcasts and aggregates replies",
        "RoutingSlip": "Routes message through steps",
        "ProcessManager": "Routes process flow",
        "MessageBroker": "Decouples sender from receiver"
    },
    "Integration/Transformation": {
        "MessageTranslator": "Translates message formats",
        "EnvelopeWrapper": "Wraps message with routing information",
        "ContentEnricher": "Adds necessary data to message",
        "ContentFilter": "Removes unwanted data",
        "ClaimCheck": "Reduces message size using reference",
        "Normalizer": "Routes variants to canonical form",
        "CanonicalDataModel": "Minimizes dependencies using common format"
    },
    "Integration/Endpoints": {
        "MessageEndpoint": "Connects application to channel",
        "MessagingGateway": "Encapsulates messaging system",
        "MessagingMapper": "Maps domain objects to messages",
        "TransactionalClient": "Makes messaging transactional",
        "PollingConsumer": "Consumer polls for messages",
        "EventDrivenConsumer": "Invoked automatically when message arrives",
        "CompetingConsumers": "Multiple consumers compete for messages",
        "MessageDispatcher": "Distributes work to performers",
        "SelectiveConsumer": "Filters messages it receives",
        "DurableSubscriber": "Receives messages even when disconnected",
        "IdempotentReceiver": "Handles duplicate messages",
        "ServiceActivator": "Connects service to messaging system"
    },
    "Integration/Channels": {
        "MessageChannel": "Connects applications via messaging",
        "PointToPointChannel": "Single receiver consumes message",
        "PublishSubscribeChannel": "Delivers copy to each subscriber",
        "DatatypeChannel": "Uses separate channel per data type",
        "InvalidMessageChannel": "Handles messages that can't be processed",
        "DeadLetterChannel": "Handles undeliverable messages",
        "GuaranteedDelivery": "Ensures message delivery",
        "ChannelAdapter": "Connects application to channel",
        "MessagingBridge": "Connects messaging systems",
        "MessageBus": "Enables separate applications to work together"
    },
    "Integration/SystemManagement": {
        "ControlBus": "Manages and monitors messaging system",
        "Detour": "Routes message through intermediate steps",
        "WireTap": "Inspects messages on channel",
        "MessageHistory": "Lists components message traveled through",
        "MessageStore": "Stores messages for later retrieval",
        "SmartProxy": "Tracks messages sent to requester",
        "TestMessage": "Ensures health of processing",
        "ChannelPurger": "Removes unwanted messages"
    }
}

def create_pattern(category, name, description):
    """Create a pattern implementation"""
    pattern_dir = os.path.join(BASE_DIR, category, name)
    os.makedirs(pattern_dir, exist_ok=True)
    namespace = f"{category.replace('/', '.')}.{name}"

    # Interface
    with open(os.path.join(pattern_dir, f"I{name}.cs"), 'w') as f:
        f.write(f"""namespace {namespace};

/// <summary>
/// {description}
/// </summary>
public interface I{name}
{{
    void Execute();
}}
""")

    # Implementation
    with open(os.path.join(pattern_dir, f"{name}Implementation.cs"), 'w') as f:
        f.write(f"""using System;

namespace {namespace};

/// <summary>
/// Implementation of {name} pattern.
/// {description}
/// </summary>
public class {name}Implementation : I{name}
{{
    public void Execute()
    {{
        Console.WriteLine("{name} pattern executing...");
    }}
}}
""")

    # Program
    with open(os.path.join(pattern_dir, "Program.cs"), 'w') as f:
        f.write(f"""using System;

namespace {namespace};

public class Program
{{
    public static void Main(string[] args)
    {{
        Console.WriteLine("=== {name} Pattern Demo ===\\n");
        I{name} pattern = new {name}Implementation();
        pattern.Execute();
        Console.WriteLine("\\n=== Demo Complete ===");
    }}
}}
""")

    # README
    with open(os.path.join(pattern_dir, "README.md"), 'w') as f:
        f.write(f"""# {name} Pattern

## Intent
{description}

## Category
Enterprise Integration Pattern

## How to Run
```bash
cd {pattern_dir}
dotnet run
```
""")

    # Project file
    with open(os.path.join(pattern_dir, f"{name}.csproj"), 'w') as f:
        f.write(f"""<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <RootNamespace>{namespace}</RootNamespace>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
""")

def main():
    total = 0
    for category, patterns in INTEGRATION_PATTERNS.items():
        print(f"Generating {category}...")
        for name, desc in patterns.items():
            try:
                create_pattern(category, name, desc)
                total += 1
                print(f"  ✓ {name}")
            except Exception as e:
                print(f"  ✗ {name}: {e}")
    print(f"\nTotal Integration patterns: {total}")

if __name__ == "__main__":
    main()
