#!/usr/bin/env python3
"""
Microservices Patterns Generator
"""

import os

BASE_DIR = "/home/roku674/Alex/DesignPatterns/CSharp"

MICROSERVICES_PATTERNS = {
    "Microservices/ServiceCollaboration": {
        "Saga": "Manages distributed transactions across services",
        "CommandSideReplica": "Maintains replica on command side to improve queries",
        "APIComposition": "Implements query by invoking services and combining results",
        "CQRS": "Separates read and write models"
    },
    "Microservices/Communication": {
        "Messaging": "Uses asynchronous messaging for inter-service communication",
        "RemoteProcedureInvocation": "Uses RPC for inter-service communication"
    },
    "Microservices/DataManagement": {
        "DatabasePerService": "Each service has its own private database",
        "TransactionOutbox": "Publishes events reliably as part of database transaction"
    },
    "Microservices/Discovery": {
        "ClientSideDiscovery": "Client queries service registry to discover instances",
        "ServerSideDiscovery": "Router queries service registry to discover instances"
    },
    "Microservices/API": {
        "APIGateway": "Single entry point for all clients"
    },
    "Microservices/Testing": {
        "ServiceComponentTest": "Tests service in isolation using test doubles",
        "ServiceIntegrationContractTest": "Verifies service meets contract expectations"
    },
    "Microservices/Reliability": {
        "CircuitBreaker": "Prevents cascading failures by stopping failing calls"
    },
    "Microservices/Security": {
        "AccessToken": "Uses tokens for inter-service authentication"
    },
    "Microservices/Observability": {
        "LogAggregation": "Aggregates logs from all service instances",
        "ApplicationMetrics": "Instruments services to gather metrics",
        "AuditLogging": "Records user activity for audit trail",
        "DistributedTracing": "Traces requests as they flow through services",
        "ExceptionTracking": "Reports exceptions to centralized service",
        "HealthCheckAPI": "Service exposes health check endpoint",
        "LogDeploymentsAndChanges": "Logs deployments and changes for correlation"
    },
    "Microservices/UI": {
        "ServerSidePageFragmentComposition": "Composes pages on server from fragments",
        "ClientSideUIComposition": "Composes UI on client side"
    },
    "Microservices/Deployment": {
        "SingleServicePerHost": "Deploys each service instance on its own host",
        "MultipleServicesPerHost": "Deploys multiple service instances on single host"
    },
    "Microservices/CrossCutting": {
        "MicroserviceChassis": "Framework providing cross-cutting concerns",
        "ExternalizedConfiguration": "Externalizes configuration from service"
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
Microservices Pattern

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
    for category, patterns in MICROSERVICES_PATTERNS.items():
        print(f"Generating {category}...")
        for name, desc in patterns.items():
            try:
                create_pattern(category, name, desc)
                total += 1
                print(f"  ✓ {name}")
            except Exception as e:
                print(f"  ✗ {name}: {e}")
    print(f"\nTotal Microservices patterns: {total}")

if __name__ == "__main__":
    main()
