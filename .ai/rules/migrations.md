---
paths:
  - 'database/migrations/**'
---

# Migrations

## Use json(), not jsonb(), for dynamic field columns
The SRS specifies JSONB for categories.custom_field_definitions and transactions.dynamic_metadata, but this app runs on SQLite (DB_CONNECTION=sqlite), which has no jsonb type. Both columns use $table->json() with an 'array' cast on the model. Only switch to jsonb() if the project actually moves to PostgreSQL.
