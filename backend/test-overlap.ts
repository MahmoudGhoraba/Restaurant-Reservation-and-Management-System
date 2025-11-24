/**
 * Simple test to verify reservation overlap prevention
 * This script demonstrates how the system prevents overlapping reservations
 */

import TableService from "./src/application/services/table.service";

async function testOverlapPrevention() {
  console.log("🧪 Testing Reservation Overlap Prevention");
  console.log("=" .repeat(50));

  const testTableId = "507f1f77bcf86cd799439011"; // Example ObjectId
  const testDate = new Date("2024-12-01");
  const testTime1 = "19:00"; // 7:00 PM
  const testTime2 = "19:30"; // 7:30 PM (overlaps with first)
  const testTime3 = "21:00"; // 9:00 PM (no overlap)
  const duration = 90; // 1.5 hours

  try {
    // Test 1: Check availability for first reservation (should be available)
    console.log("\n📋 Test 1: Checking availability for first reservation");
    console.log(`Table: ${testTableId}, Date: ${testDate.toDateString()}, Time: ${testTime1}, Duration: ${duration} minutes`);
    
    const isAvailable1 = await TableService.checkTableAvailability(
      testTableId, 
      testDate, 
      testTime1, 
      duration
    );
    console.log(`✅ Result: ${isAvailable1 ? "AVAILABLE" : "NOT AVAILABLE"}`);

    // Test 2: Check availability for overlapping time (should conflict)
    console.log("\n📋 Test 2: Checking availability for overlapping reservation");
    console.log(`Table: ${testTableId}, Date: ${testDate.toDateString()}, Time: ${testTime2}, Duration: ${duration} minutes`);
    console.log(`Expected: This should CONFLICT with the first reservation (7:00 PM - 8:30 PM)`);
    
    const isAvailable2 = await TableService.checkTableAvailability(
      testTableId, 
      testDate, 
      testTime2, 
      duration
    );
    console.log(`${isAvailable2 ? "❌ ERROR: Should be NOT AVAILABLE" : "✅ Result: NOT AVAILABLE (correct)"}`);

    // Test 3: Check availability for non-overlapping time (should be available)
    console.log("\n📋 Test 3: Checking availability for non-overlapping reservation");
    console.log(`Table: ${testTableId}, Date: ${testDate.toDateString()}, Time: ${testTime3}, Duration: ${duration} minutes`);
    console.log(`Expected: This should be AVAILABLE (starts after first reservation ends)`);
    
    const isAvailable3 = await TableService.checkTableAvailability(
      testTableId, 
      testDate, 
      testTime3, 
      duration
    );
    console.log(`✅ Result: ${isAvailable3 ? "AVAILABLE (correct)" : "❌ ERROR: Should be AVAILABLE"}`);

    console.log("\n" + "=".repeat(50));
    console.log("🎯 Summary:");
    console.log(`   • First reservation (${testTime1}): ${isAvailable1 ? "✅ Available" : "❌ Not available"}`);
    console.log(`   • Overlapping time (${testTime2}): ${isAvailable2 ? "❌ Available (ERROR)" : "✅ Blocked (correct)"}`);
    console.log(`   • Non-overlapping (${testTime3}): ${isAvailable3 ? "✅ Available (correct)" : "❌ Blocked (ERROR)"}`);
    
    if (!isAvailable1) {
      console.log("\n⚠️  Note: If first reservation shows as 'Not available', there might be existing reservations in the database");
    }

  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Example of how to use the service in API endpoints
function exampleUsage() {
  console.log("\n📖 Example API Usage:");
  console.log(`
POST /api/reservations
{
  "table": "507f1f77bcf86cd799439011",
  "reservationDate": "2024-12-01",
  "reservationTime": "19:00",
  "duration": 90,
  "numberOfGuests": 4
}

Expected responses:
✅ Success: Reservation created if no conflicts
❌ Error 409: "Table is not available for the requested time slot" if overlap exists
  `);
}

// Run tests
if (require.main === module) {
  console.log("🚀 Starting overlap prevention tests...\n");
  testOverlapPrevention();
  exampleUsage();
}

export { testOverlapPrevention };