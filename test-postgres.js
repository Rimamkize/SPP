// Simple test to verify PostgreSQL setup
import { apiService } from "./src/services/apiService.js";

console.log("🧪 Testing PostgreSQL Integration...\n");

async function testIntegration() {
  try {
    console.log("Current mode:", apiService.getCurrentMode());

    const isConnected = await apiService.testConnection();
    console.log("Connection test:", isConnected ? "✅ Success" : "❌ Failed");

    if (isConnected && apiService.getCurrentMode() === "PostgreSQL") {
      console.log("\n🎉 PostgreSQL integration is working!");
      console.log("Next steps:");
      console.log("1. Update your database credentials in .env");
      console.log("2. Run: npm run migrate");
      console.log("3. Set USE_POSTGRES=true in .env");
    } else if (apiService.getCurrentMode() === "Mock") {
      console.log("\n📝 Currently using Mock data mode");
      console.log("To enable PostgreSQL:");
      console.log("1. Set USE_POSTGRES=true in .env");
      console.log("2. Configure database credentials");
      console.log("3. Run: npm run migrate");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testIntegration();
