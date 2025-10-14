# Base Patterns

## Overview
Base patterns provide common infrastructure and foundational elements used across multiple enterprise application patterns. These patterns solve recurring problems related to object identity, value representation, service location, and system integration.

## Patterns Included

### 1. Layer Supertype
**Purpose**: Base class providing common features for all objects in a layer

**When to Use**:
- When multiple classes in a layer need common functionality
- To enforce consistency across domain objects
- For audit fields (created/modified timestamps, IDs)

**Example**: `DomainObject` base class with ID and timestamp fields

### 2. Registry
**Purpose**: Well-known object that other objects can use to find common services

**When to Use**:
- When you need global access to services
- To avoid passing dependencies through multiple layers
- For service location and dependency injection

**Example**: `ApplicationRegistry` for locating database connections and configurations

### 3. Value Object
**Purpose**: Small immutable object representing a simple value

**When to Use**:
- When you need objects compared by value, not identity
- For conceptual wholes (address, date range, money)
- To ensure immutability and thread safety

**Example**: `Address` class with street, city, state, zip code

### 4. Money Pattern
**Purpose**: Represents monetary values with currency

**When to Use**:
- When dealing with financial calculations
- To avoid floating-point precision errors
- To enforce currency consistency in operations

**Example**: `Money` class using BigDecimal with Currency enum

### 5. Special Case
**Purpose**: Provides special behavior for null/missing/special cases

**When to Use**:
- To avoid null checks throughout code
- When certain objects need special behavior
- To implement Null Object pattern

**Example**: `UnknownCustomerAccount`, `BlockedCustomerAccount`

### 6. Plugin
**Purpose**: Links classes during configuration rather than compilation

**When to Use**:
- When you need runtime flexibility
- To support different implementations
- For strategy pattern with external configuration

**Example**: `TaxCalculatorFactory` with region-specific calculators

### 7. Gateway
**Purpose**: Encapsulates access to external system or resource

**When to Use**:
- When integrating with external services
- To simplify complex external APIs
- For testability with mock implementations

**Example**: `EmailGateway` wrapping SMTP operations

## Key Benefits
- **Consistency**: Common behavior across related objects
- **Reusability**: Shared infrastructure reduces duplication
- **Testability**: Easy to mock and stub external systems
- **Maintainability**: Changes to common behavior in one place
- **Type Safety**: Compile-time checking with proper types

## Real-World Usage
- **E-commerce**: Money pattern for prices, Registry for payment processors
- **Banking**: Value Objects for account numbers, Special Case for closed accounts
- **ERP Systems**: Layer Supertype for all entities, Gateway for external integrations
- **SaaS Applications**: Plugin for multi-tenant customization

## Related Patterns
- **Domain Model**: Uses Layer Supertype and Value Objects
- **Data Mapper**: Uses Registry to find mappers
- **Service Layer**: Uses Gateway for external services
- **Repository**: Returns Value Objects and Domain Objects

## References
- Martin Fowler's "Patterns of Enterprise Application Architecture"
- Eric Evans' "Domain-Driven Design"
