// Test PDF Generation
// This file can be used to test PDF generation functionality
// Run this in browser console to test

import { generateMonthlyReportPDF } from "./pdfGenerator";
import { mockStudents, mockPayments } from "../data/mockData";

// Test data
const testData = {
  students: mockStudents,
  payments: mockPayments,
  period: "Januari 2025",
  reportType: "Rekap Pembayaran",
  selectedClass: "Semua Kelas",
};

// Test function
export const testPDFGeneration = () => {
  try {
    console.log("Testing PDF generation...");
    const filename = generateMonthlyReportPDF(testData);
    console.log("PDF generated successfully:", filename);
    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    return false;
  }
};

// You can call testPDFGeneration() in the browser console to test
