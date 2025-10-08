# Table Module Pattern

## Intent
A single instance that handles the business logic for all rows in a database table or view. Organizes domain logic with one class per table.

## When to Use
- Table-oriented database design
- Business logic closely tied to database structure
- When using a Record Set architecture
- Applications with moderate complexity
- When you want better organization than Transaction Script

## Structure
- One module class per database table
- Methods operate on sets of records
- Works with Record Sets or Data Transfer Objects
- Business logic organized by table

## Example
- **AccountTableModule** - Handles all account operations
- **OrderTableModule** - Manages order processing

## Benefits
- Better organized than Transaction Script
- Easier to find code (organized by table)
- Can work with multiple rows efficiently
- Good middle ground between Transaction Script and Domain Model

## Drawbacks
- Less sophisticated than Domain Model
- Tied to database structure
- Difficult to model complex object relationships
- Not ideal for complex business logic

## Run
```bash
node index.js
```
