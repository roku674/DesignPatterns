# Chain of Responsibility Pattern

## Intent
The Chain of Responsibility pattern lets you pass requests along a chain of handlers. Each handler decides either to process the request or to pass it to the next handler in the chain.

## Problem
When you have multiple objects that can handle a request, but you don't know which one should handle it until runtime. Hard-coding all possible handlers into the request sender creates tight coupling.

## Solution
Create a chain of handler objects. Each handler has a reference to the next handler. When a request comes in, each handler either processes it or forwards it to the next handler.

## Real-World Analogy
Customer support system:
- Level 1 (Basic support) → Level 2 (Technical) → Level 3 (Expert) → Management

Each level tries to solve the problem. If they can't, they escalate to the next level.

## When to Use
- Multiple objects can handle a request, handler isn't known in advance
- Want to issue request without specifying receiver
- Set of handlers should be specified dynamically

## How to Run
```bash
node index.js
```
