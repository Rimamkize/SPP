import React, { useState } from "react";
import { BarChart3, PieChart, FileText, Download } from "lucide-react";
import { Student, Payment } from "../../types";
import {
  generateMonthlyReportPDF,
  generateOverdueReportPDF,
} from "../../utils/pdfGenerator";

interface ReportsProps {
  students: Student[];
  payments: Payment[];
}

export const Reports: React.FC<ReportsProps> = ({ students, payments }) => {
  const [selectedClass, setSelectedClass] = useState("Semua Kelas");
  const [selectedReportType, setSelectedReportType] =
    useState("Rekap Pembayaran");
  const [isGenerating, setIsGenerating] = useState(false);

  const totalStudents = students.length;
  const paidStudents = students.filter((s) => s.status === "Lunas").length;
  const overdueStudents = students.filter(
    (s) => s.status === "Tunggakan"
  ).length;
  const totalRevenue = payments
    .filter((p) => p.status === "Confirmed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalDebt = students.reduce(
    (sum, student) => sum + student.totalDebt,
    0
  );

  const getFilteredData = () => {
    const filteredStudents =
      selectedClass === "Semua Kelas"
        ? students
        : students.filter((s) => s.class === selectedClass);

    // Group by class
    const classSummary = new Map();

    filteredStudents.forEach((student) => {
      if (!classSummary.has(student.class)) {
        classSummary.set(student.class, {
          total: 0,
          paid: 0,
          unpaid: 0,
          overdue: 0,
          revenue: 0,
        });
      }

      const classData = classSummary.get(student.class);
      classData.total++;

      if (student.status === "Lunas") classData.paid++;
      else if (student.status === "Belum Bayar") classData.unpaid++;
      else if (student.status === "Tunggakan") classData.overdue++;

      // Calculate revenue for this class
      const studentPayments = payments.filter(
        (p) => p.studentName === student.name && p.status === "Confirmed"
      );
      classData.revenue += studentPayments.reduce(
        (sum, p) => sum + p.amount,
        0
      );
    });

    return Array.from(classSummary.entries()).map(([className, data]) => ({
      class: className,
      ...data,
    }));
  };

  const filteredData = getFilteredData();

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      let filename = "";

      if (selectedReportType === "Daftar Tunggakan") {
        filename = generateOverdueReportPDF(students);
      } else {
        filename = generateMonthlyReportPDF({
          students,
          payments,
          reportType: selectedReportType,
          selectedClass,
        });
      }

      // Log success message
      console.log(`PDF berhasil dibuat: ${filename}`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      console.error("Terjadi kesalahan saat membuat PDF. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Laporan Keuangan</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <BarChart3 className="h-8 w-8 text-blue-600 mb-4" />
          <h3 className="font-semibold text-gray-800 mb-2">Laporan Harian</h3>
          <p className="text-sm text-gray-600 mb-4">Penerimaan SPP hari ini</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Penerimaan:</span>
              <span className="font-medium">Rp 1.450.000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Jumlah Transaksi:</span>
              <span className="font-medium">3</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <PieChart className="h-8 w-8 text-green-600 mb-4" />
          <h3 className="font-semibold text-gray-800 mb-2">Laporan Bulanan</h3>
          <p className="text-sm text-gray-600 mb-4">
            Rekap pembayaran per bulan
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Penerimaan:</span>
              <span className="font-medium">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Siswa Lunas:</span>
              <span className="font-medium">
                {paidStudents} dari {totalStudents}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <FileText className="h-8 w-8 text-purple-600 mb-4" />
          <h3 className="font-semibold text-gray-800 mb-2">
            Laporan Tunggakan
          </h3>
          <p className="text-sm text-gray-600 mb-4">Daftar siswa menunggak</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Siswa Menunggak:</span>
              <span className="font-medium text-red-600">
                {overdueStudents}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Tunggakan:</span>
              <span className="font-medium text-red-600">
                Rp {totalDebt.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Generate Laporan
          </h3>
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              isGenerating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            <Download className="h-4 w-4" />
            <span>{isGenerating ? "Membuat PDF..." : "Export PDF"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Semua Kelas</option>
              <option>X-A</option>
              <option>X-B</option>
              <option>XI-A</option>
              <option>XI-B</option>
              <option>XII-A</option>
              <option>XII-B</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Laporan
            </label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Rekap Pembayaran</option>
              <option>Daftar Tunggakan</option>
              <option>Analisis Keuangan</option>
            </select>
          </div>
        </div>

        {/* Sample Report Data */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-800 mb-4">
            Preview Data Laporan
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Kelas</th>
                  <th className="px-4 py-2 text-left">Total Siswa</th>
                  <th className="px-4 py-2 text-left">Sudah Bayar</th>
                  <th className="px-4 py-2 text-left">Belum Bayar</th>
                  <th className="px-4 py-2 text-left">Tunggakan</th>
                  <th className="px-4 py-2 text-left">Total Penerimaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((classData) => (
                  <tr key={classData.class}>
                    <td className="px-4 py-2">{classData.class}</td>
                    <td className="px-4 py-2">{classData.total}</td>
                    <td className="px-4 py-2 text-green-600">
                      {classData.paid}
                    </td>
                    <td className="px-4 py-2 text-yellow-600">
                      {classData.unpaid}
                    </td>
                    <td className="px-4 py-2 text-red-600">
                      {classData.overdue}
                    </td>
                    <td className="px-4 py-2">
                      Rp {classData.revenue.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
