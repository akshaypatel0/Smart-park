# Firestore Security Specification: Smart Parking Telemetry

## Data Invariants
1. The `/parking/{systemId}` document contains real-time status of the 3-bay parking lot.
2. Anyone (public viewers on GitHub Pages, drivers scanning QR code) can read (get) `/parking/{systemId}` in real-time to know which slot is empty or occupied.
3. Listing collections is restricted to prevent scraping; clients query specific system document by valid ID.
4. Writes (gateway updates) must strictly validate schema types, systemId bounds, gate enum, totalOccupied bounds (0-3), and totalSlots (3).
5. No arbitrary fields may be injected beyond the declared schema.
6. System ID must match alphanumeric pattern `^[a-zA-Z0-9_\\-]+$` up to 64 chars.

## The "Dirty Dozen" Threat Payloads
1. **Invalid systemId**: System ID with illegal symbols or excessive length (> 64 chars) -> Denied.
2. **Oversized slotsData**: Malicious payload attempting to write > 4KB string to `slotsData` -> Denied.
3. **Invalid Gate Enum**: Gate set to `"DESTROYED"` instead of `"OPEN"` or `"CLOSED"` -> Denied.
4. **Invalid totalOccupied Range**: `totalOccupied: -5` or `totalOccupied: 99` -> Denied.
5. **Ghost Fields Injection**: Adding malicious arbitrary fields `hackRole: "superadmin"` -> Denied.
6. **Type Mismatch on buzzerOn**: `buzzerOn: "yes"` (string instead of boolean) -> Denied.
7. **Type Mismatch on isHardwareConnected**: `isHardwareConnected: 1` -> Denied.
8. **Missing Required Fields**: Write without `slotsData` or `systemId` -> Denied.
9. **Invalid Source Enum**: `source: "malicious_bot"` -> Denied.
10. **Oversized statusMessage**: Exceeding 256 characters -> Denied.
11. **Negative gateAngle**: Out-of-range servo angle -> Denied.
12. **Blanket Query Scraping**: Attempting unbounded collection listing -> Denied.
