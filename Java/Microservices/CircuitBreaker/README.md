# Circuit Breaker Pattern

## Overview
Prevents cascading failures by failing fast when a service is unavailable.

## States
- **CLOSED**: Normal operation, requests pass through
- **OPEN**: Too many failures, requests fail immediately  
- **HALF_OPEN**: Testing if service recovered

## Problem
Service failures can cascade through the system, causing widespread outages.

## Solution
Monitor service health and trip circuit breaker when failure threshold exceeded.

## Running
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Microservices/CircuitBreaker
javac -d . *.java
java Microservices.CircuitBreaker.Main
```
