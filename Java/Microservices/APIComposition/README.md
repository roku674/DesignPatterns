# API Composition Pattern

## Overview
The API Composition pattern aggregates data from multiple microservices to serve a single client request.

## Problem
Data is distributed across multiple services. Single client request needs data from multiple sources.

## Solution
API Composer orchestrates calls to multiple services and aggregates responses into unified format.

## Components
- API Composer: Orchestrates service calls
- Service Clients: Communicate with microservices
- Response Aggregator: Combines responses
- Fallback Handler: Provides resilience

## Benefits
- Reduced client complexity
- Lower network latency with parallel calls
- Separation of concerns

## Use Cases
- E-commerce product pages
- User dashboards
- Order summaries

## Running
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Microservices/APIComposition
javac -d . *.java
java Microservices.APIComposition.Main
```
