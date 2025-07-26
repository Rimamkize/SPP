import React from "react";
import { BarChart3, PieChart, FileText, Download } from "lucide-react";
import { Student, Payment } from "../../types";

interface ReportsProps {
  students: Student[];
  payments: Payment[];
}

export const Reports: React.FC<ReportsProps> = ({ students, payments }) => {
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
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Januari 2025</option>
              <option>Februari 2025</option>
              <option>Maret 2025</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelas
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                <tr>
                  <td className="px-4 py-2">X-A</td>
                  <td className="px-4 py-2">2</td>
                  <td className="px-4 py-2 text-green-600">1</td>
                  <td className="px-4 py-2 text-yellow-600">0</td>
                  <td className="px-4 py-2 text-red-600">1</td>
                  <td className="px-4 py-2">Rp 500.000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">XI-B</td>
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2 text-green-600">0</td>
                  <td className="px-4 py-2 text-yellow-600">0</td>
                  <td className="px-4 py-2 text-red-600">1</td>
                  <td className="px-4 py-2">Rp 500.000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">XII-A</td>
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2 text-green-600">0</td>
                  <td className="px-4 py-2 text-yellow-600">1</td>
                  <td className="px-4 py-2 text-red-600">0</td>
                  <td className="px-4 py-2">Rp 0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
