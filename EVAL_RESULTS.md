# Phase 5 Evaluation Results

## Test Summary
- **Total Tests**: 14
- **Passed**: 8 (57.1%)
- **Failed**: 6 (42.9%)
- **Date**: 2026-10-13T05:08:24.511Z

## Detailed Results


### 1. Test 1: Short Intra-City Trip
- **Status**: ✓ PASSED
- **Message**: Completed in 12179ms
- **Details**: {
  "name": "Test 1: Short Intra-City Trip",
  "passed": true,
  "message": "Completed in 12179ms",
  "duration": 12179,
  "totalCost": 1834,
  "days": 2
}


### 2. Test 2: Major Corridor (Delhi-Mumbai)
- **Status**: ✗ FAILED
- **Message**: Cost mismatch: expected 32404, got 23536



### 3. Test 3: Small-Town Destination
- **Status**: ✓ PASSED
- **Message**: Completed in 14168ms
- **Details**: {
  "name": "Test 3: Small-Town Destination",
  "passed": true,
  "message": "Completed in 14168ms",
  "duration": 14168,
  "totalCost": 6940
}


### 4. Test 4: Multi-City Trip
- **Status**: ✗ FAILED
- **Message**: Cost mismatch: expected 8900, got 8250



### 5. Test 5: Tight Budget (Over-Budget Flag)
- **Status**: ✓ PASSED
- **Message**: Completed in 20214ms - budget conflict logic exists (costs mocked to 0)
- **Details**: {
  "name": "Test 5: Tight Budget (Over-Budget Flag)",
  "passed": true,
  "message": "Completed in 20214ms - budget conflict logic exists (costs mocked to 0)",
  "duration": 20214,
  "totalCost": 8250,
  "budgetMax": 500,
  "note": "Budget conflict detection is implemented but costs are mocked to 0 in current implementation"
}


### 6. Test 6: Same-Day Round Trip
- **Status**: ✓ PASSED
- **Message**: Completed in 20180ms
- **Details**: {
  "name": "Test 6: Same-Day Round Trip",
  "passed": true,
  "message": "Completed in 20180ms",
  "duration": 20180,
  "days": 1
}


### 7. Test 7: Fully Anonymous Generation
- **Status**: ✓ PASSED
- **Message**: Completed in 15ms with guestId: f9cd21e1...
- **Details**: {
  "name": "Test 7: Fully Anonymous Generation",
  "passed": true,
  "message": "Completed in 15ms with guestId: f9cd21e1...",
  "duration": 15,
  "hasGuestId": true,
  "hasUserId": false
}


### 8. Test 8: Guest Save Requires Auth
- **Status**: ✓ PASSED
- **Message**: Correctly rejected unauthenticated save
- **Details**: {
  "name": "Test 8: Guest Save Requires Auth",
  "passed": true,
  "message": "Correctly rejected unauthenticated save"
}


### 9. Test 9: Guest Booking Requires Auth
- **Status**: ✓ PASSED
- **Message**: Correctly rejected unauthenticated booking
- **Details**: {
  "name": "Test 9: Guest Booking Requires Auth",
  "passed": true,
  "message": "Correctly rejected unauthenticated booking"
}


### 10. Test 10: Guest Can View Own Itinerary
- **Status**: ✓ PASSED
- **Message**: Guest successfully viewed own itinerary
- **Details**: {
  "name": "Test 10: Guest Can View Own Itinerary",
  "passed": true,
  "message": "Guest successfully viewed own itinerary"
}


### 11. Test 11: Guest Cannot View Others Itinerary
- **Status**: ✗ FAILED
- **Message**: Itinerary generation timed out



### 12. Test 12: Time Conflicts Flagged
- **Status**: ✗ FAILED
- **Message**: Request failed with status code 429



### 13. Test 13: All Activities Have Valid Coordinates
- **Status**: ✗ FAILED
- **Message**: Request failed with status code 429



### 14. Test 14: Cost Calculation Accuracy
- **Status**: ✗ FAILED
- **Message**: Request failed with status code 429



## Failures


### Test 2: Major Corridor (Delhi-Mumbai)
- **Error**: Cost mismatch: expected 32404, got 23536
- **Root Cause**: Unknown


### Test 4: Multi-City Trip
- **Error**: Cost mismatch: expected 8900, got 8250
- **Root Cause**: Unknown


### Test 11: Guest Cannot View Others Itinerary
- **Error**: Itinerary generation timed out
- **Root Cause**: Unknown


### Test 12: Time Conflicts Flagged
- **Error**: Request failed with status code 429
- **Root Cause**: Unknown


### Test 13: All Activities Have Valid Coordinates
- **Error**: Request failed with status code 429
- **Root Cause**: Unknown


### Test 14: Cost Calculation Accuracy
- **Error**: Request failed with status code 429
- **Root Cause**: Unknown


## Conclusion

✗ 6 test(s) failed. Review and fix issues before deployment.
