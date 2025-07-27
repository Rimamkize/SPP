import React from "react";
import { Users, Check, Calendar, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Student, Payment } from "../../types";
import DatabaseStatus from "../database/DatabaseStatus";

interface DashboardProps {
  students: Student[];
  payments: Payment[];
}

export const Dashboard: React.FC<DashboardProps> = ({ students, payments }) => {
  const { user } = useAuth();

  const totalStudents = students.length;
  const paidStudents = students.filter((s) => s.status === "Lunas").length;
  const unpaidStudents = students.filter(
    (s) => s.status === "Belum Bayar"
  ).length;
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
      {/* Database Status - Only visible to admin/staff */}
      {(user?.role === "admin" || user?.role === "staff") && <DatabaseStatus />}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Selamat Datang, {user?.fullName}!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Siswa</p>
                <p className="text-2xl font-bold text-blue-800">
                  {totalStudents}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Sudah Bayar
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {paidStudents}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">
                  Belum Bayar
                </p>
                <p className="text-2xl font-bold text-yellow-800">
                  {unpaidStudents}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Tunggakan</p>
                <p className="text-2xl font-bold text-red-800">
                  {overdueStudents}
                </p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ringkasan Keuangan
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Penerimaan:</span>
              <span className="font-semibold text-green-600">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Tunggakan:</span>
              <span className="font-semibold text-red-600">
                Rp {totalDebt.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-800 font-medium">
                Target Bulan Ini:
              </span>
              <span className="font-bold text-blue-600">Rp 15.000.000</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Informasi Akun
          </h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Nama:</span> {user?.fullName}
            </p>
            <p>
              <span className="font-medium">Username:</span> {user?.username}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p>
              <span className="font-medium">Role:</span>
              <span
                className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {user?.role === "admin" ? "Administrator" : "Staff TU"}
              </span>
            </p>
            <p>
              <span className="font-medium">Bergabung:</span> {user?.createdAt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
