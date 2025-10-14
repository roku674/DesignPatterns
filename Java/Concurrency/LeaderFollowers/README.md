# Leader-Followers Pattern

## Intent
Multiple threads take turns being the leader that waits for events. Leader processes event and promotes a follower.

## Roles
- **Leader**: Waits for events
- **Followers**: Wait to become leader
- **Processing**: Handle events

## Benefits
- Efficient thread utilization
- Reduced context switching
- Cache-friendly
- Low latency

## Use Cases
- Network servers
- Event handling
- High-performance I/O
- Real-time systems
