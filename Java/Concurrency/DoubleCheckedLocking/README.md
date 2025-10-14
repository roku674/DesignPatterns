# Double-Checked Locking Pattern

## Intent
Reduce the overhead of acquiring a lock by first testing the locking criterion without actually acquiring the lock, and only acquiring the lock if the check indicates locking is required.

## Problem
Lazy initialization of singletons requires synchronization to be thread-safe, but synchronizing every getInstance() call is expensive.

## Solution
Check if initialization is required twice: once without locking (fast path) and once with locking (slow path). Use volatile to ensure visibility.

## Key Points
- volatile keyword prevents instruction reordering
- First check avoids synchronization overhead
- Second check ensures thread safety
- Only synchronizes during initialization

## Use Cases
- Lazy singleton initialization
- Resource initialization
- Cache initialization
