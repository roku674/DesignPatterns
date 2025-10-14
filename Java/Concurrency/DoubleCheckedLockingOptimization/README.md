# Double-Checked Locking Optimization Pattern

## Intent
Optimize double-checked locking using initialization-on-demand holder idiom for better performance.

## Key Difference
Uses static inner class holder instead of volatile field, relying on JVM class initialization guarantees.

## Benefits
- No explicit synchronization needed
- Thread-safe by JVM guarantees
- Better performance
- Simpler implementation

## Advantages over Standard DCL
- No volatile keyword needed
- JVM handles thread safety
- Lazy initialization
- Better in practice
