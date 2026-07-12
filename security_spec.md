# Security Specification

## 1. Data Invariants
- An Observation MUST have a valid ID, studentName, classId, category, title, date, and description.
- An Observation belongs to the student who created it (derived from `studentName`).
- Users can only read, update, or delete their own Observations.

## 2. "Dirty Dozen" Payloads (Test cases)
1. Missing ID
2. Missing studentName
3. Too long title (>200)
4. Too long description (>2000)
5. Invalid Category
6. Anonymous read
7. Update someone else's observation
8. Delete someone else's observation
9. Injection in ID field (if possible)
10. Malformed date
11. Ghost field injection
12. Email spoofing attempt

## 3. Test Runner
(Placeholder for firestore.rules.test.ts)
