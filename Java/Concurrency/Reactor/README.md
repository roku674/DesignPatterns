# Reactor Pattern

## Intent
Demultiplex and dispatch events from multiple sources synchronously using event loop.

## Components
- **Reactor**: Event loop
- **Event Handlers**: Process events
- **Event Queue**: Buffers events
- **Dispatcher**: Routes events

## Benefits
- Single-threaded simplicity
- Event-driven architecture
- Efficient I/O
- Low overhead

## Difference from Proactor
- Reactor: Synchronous demultiplexing
- Proactor: Asynchronous completion
