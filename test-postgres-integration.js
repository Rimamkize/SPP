import { apiService } from "./src/services/apiService.ts";

console.log("🔍 Testing PostgreSQL Integration...\n");

// Test 1: Check current mode
console.log(`📋 Current Mode: ${apiService.getCurrentMode()}`);

// Test 2: Test connection
console.log("🔌 Testing database connection...");
apiService
  .testConnection()
  .then((connected) => {
    console.log(`✅ Connection Status: ${connected ? "Connected" : "Failed"}`);

    if (connected) {
      // Test 3: Try to get students data
      console.log("📊 Testing data retrieval...");
      return apiService.getStudents();
    }
  })
  .then((result) => {
    if (result) {
      console.log(
        `✅ Students Data: Found ${result.data?.length || 0} students`
      );
      console.log(`✅ PostgreSQL integration is working! 🎉`);
    }
  })
  .catch((error) => {
    console.error("❌ Error:", error.message || error);
  })
  .finally(() => {
    process.exit(0);
  });
