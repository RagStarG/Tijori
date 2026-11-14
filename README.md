# Tijori — System Diagrams

This folder contains the Data Flow Diagrams (DFD) and Entity Relationship Diagram (ERD)
for the Tijori escrow-platform demo.

## Documents

- [DFD.md](./DFD.md) — Context diagram (Level 0) and detailed Level 1 data flow.
- [ERD.md](./ERD.md) — Database entities, attributes, keys, and relationship.

## Scope and modelling notes

These diagrams are based on the repository's `README.md`, `CONTRACT.md`, and current
backend implementation (`backend/main.py`, `backend/db.py`, and `backend/ai.py`).

Tijori is documented as a hackathon/demo application. It does not process real payments
and its current role/name header mechanism is not production authentication.

The database currently defines two persistent entities: `deals` and `events`.
The seller, buyer, and admin are actors represented by request headers and deal/event
columns; they are not stored in a separate users table. The AI verdict is stored as JSONB
inside `deals.ai_verdict`, not as a separate table.
