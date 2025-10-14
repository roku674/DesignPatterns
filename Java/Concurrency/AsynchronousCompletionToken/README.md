# Asynchronous Completion Token Pattern

## Intent
Associate asynchronous operation results with their initiating context by passing a completion token.

## Problem
When multiple asynchronous operations are in flight, need to match results with original requests.

## Solution
Pass a token with each async request that is returned with the result, allowing proper context association.

## Benefits
- Maintains request context
- Enables result correlation
- Supports concurrent operations
- Flexible callback handling
