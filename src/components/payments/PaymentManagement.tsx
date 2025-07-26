import React from "react";
import { Plus, Edit, Check } from "lucide-react";
import { Payment } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { canViewAllData, canModifyData } from "../../utils/accessControl";

interface PaymentManagementProps {
  payments: Payment[];
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  payments,
}) => {
  const { user } = useAuth();

  // Filter payments based on user role
  const getFilteredPayments = () => {
    if (!user) return [];

    if (canViewAllData(user.role)) {
      // Admin and staff can see all payments
      return payments;
    } else if (user.role === "siswa" || user.role === "orangtua") {
      // Students and parents can only see payments related to their student ID
      return payments.filter((payment) => payment.studentId === user.studentId);
    }

    return [];
  };

  const filteredPayments = getFilteredPayments();
  const canModify = user ? canModifyData(user.role) : false;
  const canViewAll = user ? canViewAllData(user.role) : false;
  const totalRevenue = filteredPayments
    .filter((p) => p.status === "Confirmed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const getTitleByRole = () => {
    if (!user) return "Manajemen Pembayaran";

    switch (user.role) {
      case "admin":
      case "staff":
        return "Manajemen Pembayaran";
      case "siswa":
        return "Pembayaran SPP Saya";
      case "orangtua":
        return "Pembayaran SPP Anak";
      default:
        return "Pembayaran";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{getTitleByRole()}</h2>
        {canModify && (
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700">
            <Plus className="h-4 w-4" />
            <span>Input Pembayaran</span>
          </button>
        )}
      </div>

      {/* Payment Summary - Only show for admin/staff */}
      {canViewAll && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Pembayaran Hari Ini
            </h3>
            <p className="text-2xl font-bold text-green-600">Rp 1.450.000</p>
            <p className="text-sm text-gray-500">3 transaksi</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {user?.role === "siswa" || user?.role === "orangtua"
                ? "Total Pembayaran"
                : "Pembayaran Bulan Ini"}
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-gray-500">
              {filteredPayments.filter((p) => p.status === "Confirmed").length}{" "}
              transaksi
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Pending Konfirmasi
            </h3>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredPayments.filter((p) => p.status === "Pending").length}
            </p>
            <p className="text-sm text-gray-500">pembayaran</p>
          </div>
        </div>
      )}

      {/* Student/Parent Summary */}
      {!canViewAll && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Total Pembayaran
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-gray-500">
              {filteredPayments.filter((p) => p.status === "Confirmed").length}{" "}
              transaksi berhasil
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Status Pembayaran
            </h3>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredPayments.filter((p) => p.status === "Pending").length}
            </p>
            <p className="text-sm text-gray-500">menunggu konfirmasi</p>
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {canViewAll ? "Pembayaran Terbaru" : "Riwayat Pembayaran"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                {canViewAll && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Siswa
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {canModify && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.date}
                    </td>
                    {canViewAll && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.studentName}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {payment.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    {canModify && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      canViewAll && canModify
                        ? 6
                        : canViewAll || canModify
                        ? 5
                        : 4
                    }
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Belum ada data pembayaran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
