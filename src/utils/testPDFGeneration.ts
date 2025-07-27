import {
  generateMonthlyReportPDF,
  generateOverdueReportPDF,
} from "./pdfGenerator";
import { mockStudents, mockPayments } from "../data/mockData";
import { testAutoTablePlugin } from "./testAutoTable";

// Test data for PDF generation
const testReportData = {
  students: mockStudents,
  payments: mockPayments,
  reportType: "Laporan Bulanan",
  selectedClass: "XII IPA 1",
};

export const testPDFGeneration = () => {
  console.log("Testing PDF generation...");

  // First test autoTable plugin
  console.log("Step 1: Testing autoTable plugin...");
  const pluginTest = testAutoTablePlugin();
  if (!pluginTest.success) {
    return pluginTest;
  }

  try {
    // Test monthly report PDF
    console.log("Generating monthly report PDF...");
    const monthlyFilename = generateMonthlyReportPDF(testReportData);
    console.log("Monthly report generated successfully:", monthlyFilename);

    // Test overdue report PDF
    console.log("Generating overdue report PDF...");
    const overdueFilename = generateOverdueReportPDF(mockStudents);
    console.log("Overdue report generated successfully:", overdueFilename);

    return {
      success: true,
      monthlyFilename,
      overdueFilename,
    };
  } catch (error) {
    console.error("PDF generation test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// For browser console testing
if (typeof window !== "undefined") {
  (window as any).testPDFGeneration = testPDFGeneration;
  (window as any).testAutoTablePlugin = testAutoTablePlugin;
}
