import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Simple test to verify jsPDF autoTable plugin is working
export const testAutoTablePlugin = () => {
  console.log("Testing jsPDF autoTable plugin...");

  try {
    const doc = new jsPDF();

    // Use autoTable function directly instead of binding
    const createTable = (options: any) => {
      return autoTable(doc, options);
    };

    // Attach the wrapper function
    (doc as any).autoTable = createTable;

    console.log("jsPDF instance created:", doc);
    console.log("autoTable import type:", typeof autoTable);
    console.log("autoTable function available:", typeof (doc as any).autoTable);

    if (typeof (doc as any).autoTable === "function") {
      console.log("✅ autoTable plugin is properly loaded!");

      // Test basic autoTable functionality
      (doc as any).autoTable({
        head: [["Test Header"]],
        body: [["Test Data"]],
        startY: 20,
      });

      console.log("✅ autoTable function executed successfully!");
      return { success: true, message: "autoTable plugin working correctly" };
    } else {
      console.error("❌ autoTable function is not available");
      return { success: false, message: "autoTable function not found" };
    }
  } catch (error) {
    console.error("❌ Error testing autoTable plugin:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Make it available in browser console
if (typeof window !== "undefined") {
  (window as any).testAutoTablePlugin = testAutoTablePlugin;
}
