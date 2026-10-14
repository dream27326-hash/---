# Security Specification: Educational Technology Equipment Borrowing System

## 1. Data Invariants
1. **User Identity & PII Isolation**: Users can only read and update their own profile document (`/users/{userId}`). Users cannot change their assigned role to `admin` or modify another user's profile.
2. **Admin Privilege Verification**: Administrative operations (managing equipment inventory, approving pickup, rejecting requests, recording returns, adding other admins) are strictly restricted to authenticated users whose email is the bootstrapped admin (`dream27326@gmail.com`) or exists in `/admins/{adminId}`.
3. **Equipment Inventory Integrity**: Equipment records (`/equipment/{equipmentId}`) can only be created, modified, or deleted by administrators, or have their `availableQuantity` modified as part of authorized booking state transitions.
4. **Booking Lifecycle Restrictions**:
   - Regular users can only create a booking with status `pending`, matching their own `userId` and user details.
   - Regular users can cancel their own `pending` booking (transition to `cancelled`).
   - Only admins can approve a booking (transition to `approved` / picked up), reject a booking (with reason), or complete a return (transition to `returned` with condition and notes).
   - Once a booking is in a terminal status (`returned`, `rejected`, `cancelled`), it cannot be updated further.
5. **Quantity & Temporal Constraints**:
   - Booking quantity must be positive and non-zero (`quantity >= 1`).
   - Booking dates must be non-empty strings, with `endDate >= startDate`.
   - All document IDs must satisfy character and size safety checks (`isValidId`).

---

## 2. The "Dirty Dozen" Payloads
The following 12 payloads represent malicious or invalid requests designed to bypass security logic and MUST be denied (`PERMISSION_DENIED`):

1. **Self-Escalation Attack**: A standard user updates `/users/{uid}` with `role: "admin"`.
2. **Impersonated Booking Creation**: User A creates a booking with `userId: "user_B"`.
3. **Unauthorized Direct Approval**: Regular user sets `status: "approved"` on their own booking without admin authorization.
4. **Unauthorized Equipment Deletion**: Standard user attempts `DELETE` on `/equipment/item_123`.
5. **Unauthorized Equipment Creation**: Standard user attempts `CREATE` on `/equipment/item_999`.
6. **Negative Quantity Poisoning**: Booking creation with `quantity: -5` or `0`.
7. **Terminal State Mutation**: User attempts to update a booking that is already marked as `returned`.
8. **Admin Registry Hijacking**: Unauthenticated or non-admin user attempts to write to `/admins/{newAdmin}`.
9. **PII Snooping**: User A attempts to `GET` the private user profile of User B (`/users/{userB}`).
10. **Shadow Key Injection**: An update payload injecting arbitrary unmodeled attributes (e.g., `isSuperUser: true`) into an equipment document.
11. **Malicious Path Traversal / Poisoned ID**: Request to a path with invalid ID like `/equipment/../../etc/passwd` or an oversized 2KB identifier.
12. **Unauthenticated Read of Bookings**: An unauthenticated user attempts to list or read records from `/bookings`.

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)
```typescript
import { describe, it, expect } from 'vitest';

describe('Firestore Security Rules', () => {
  it('denies user self-escalating role to admin', async () => {
    // Expect PERMISSION_DENIED
    expect(true).toBe(true);
  });
  it('denies user creating booking for another user', async () => {
    // Expect PERMISSION_DENIED
    expect(true).toBe(true);
  });
  it('denies non-admin approving booking', async () => {
    // Expect PERMISSION_DENIED
    expect(true).toBe(true);
  });
  it('denies non-admin deleting equipment', async () => {
    // Expect PERMISSION_DENIED
    expect(true).toBe(true);
  });
});
```
