import React, { useState, useEffect } from "react";
import { Plus, Edit, CheckCircle, Search, AlertCircle } from "lucide-react";
import { Payment, Student } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { canViewAllData, canModifyData } from "../../utils/accessControl";
import { apiService } from "../../services/apiService";

interface PaymentManagementProps {
  payments: Payment[];
  onPaymentsChange: (payments: Payment[]) => void;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  payments,
  onPaymentsChange,
}) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState<Payment | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load students for the searchable dropdown
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await apiService.getStudents?.();
        if (response?.success && response?.data) {
          setStudents(response.data);
        }
      } catch (error) {
        console.error("Error loading students:", error);
      }
    };

    if (user && canModifyData(user.role)) {
      loadStudents();
    }
  }, [user]);

  // Filter payments based on user role
  const getFilteredPayments = () => {
    if (!user) return [];

    if (canViewAllData(user.role)) {
      return payments;
    } else if (user.role === "siswa" || user.role === "orangtua") {
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

  const handleAddPayment = () => {
    setIsAddingPayment(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
  };

  const handleConfirmPayment = (payment: Payment) => {
    setConfirmingPayment(payment);
  };

  const confirmPaymentStatus = async () => {
    if (!confirmingPayment) return;

    setIsSubmitting(true);
    try {
      const response = await apiService.updatePayment?.({
        ...confirmingPayment,
        status: "Confirmed",
      });

      if (response?.success) {
        onPaymentsChange(
          payments.map((p) =>
            p.id === confirmingPayment.id
              ? { ...confirmingPayment, status: "Confirmed" as const }
              : p
          )
        );
        setConfirmingPayment(null);
      } else {
        alert(
          "Gagal mengkonfirmasi pembayaran: " +
            (response?.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Terjadi kesalahan saat mengkonfirmasi pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Payment Form Component
  const PaymentForm: React.FC<{
    payment?: Payment;
    onSave: () => void;
    onCancel: () => void;
  }> = ({ payment, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Payment>>({
      studentId: payment?.studentId || 0,
      studentName: payment?.studentName || "",
      studentNisn: payment?.studentNisn || "",
      amount: payment?.amount || 0,
      date: payment?.date || new Date().toISOString().split("T")[0],
      method: payment?.method || "Transfer Bank",
      status: payment?.status || "Pending",
      description: payment?.description || "",
      period: payment?.period || "",
    });

    const [studentSearch, setStudentSearch] = useState(
      payment?.studentName || ""
    );
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [showStudentList, setShowStudentList] = useState(false);

    // Filter students based on search
    useEffect(() => {
      if (studentSearch.length > 0) {
        const filtered = students.filter(
          (student) =>
            student.nisn.includes(studentSearch) ||
            student.name.toLowerCase().includes(studentSearch.toLowerCase())
        );
        setFilteredStudents(filtered);
        setShowStudentList(true);
      } else {
        setFilteredStudents([]);
        setShowStudentList(false);
      }
    }, [studentSearch, students]);

    const selectStudent = (student: Student) => {
      setFormData({
        ...formData,
        studentId: student.id,
        studentName: student.name,
        studentNisn: student.nisn,
      });
      setStudentSearch(`${student.nisn} - ${student.name}`);
      setShowStudentList(false);
    };

    const handleSubmit = async () => {
      // Validation for new payments
      if (!payment) {
        if (
          !formData.studentId ||
          !formData.amount ||
          !formData.date ||
          !formData.period
        ) {
          alert("Mohon lengkapi semua field yang wajib diisi");
          return;
        }

        if (formData.amount <= 0) {
          alert("Jumlah pembayaran harus lebih dari 0");
          return;
        }
      }

      // For edit mode, only validate method field
      if (payment && !formData.method) {
        alert("Mohon pilih metode pembayaran");
        return;
      }

      setIsSubmitting(true);
      try {
        if (payment) {
          // Update existing payment (only method field)
          const response = await apiService.updatePayment?.({
            ...payment, // Keep original data
            method: formData.method, // Only update method
          });
          if (response?.success) {
            onPaymentsChange(
              payments.map((p) =>
                p.id === payment.id
                  ? { ...p, method: formData.method || "Transfer Bank" }
                  : p
              )
            );
            onSave();
          } else {
            alert(
              "Gagal memperbarui metode pembayaran: " +
                (response?.message || "Unknown error")
            );
          }
        } else {
          // Create new payment
          const response = await apiService.createPayment?.(formData);
          if (response?.success) {
            onPaymentsChange([...payments, response.data]);
            onSave();
          } else {
            alert(
              "Gagal membuat pembayaran baru: " +
                (response?.message || "Unknown error")
            );
          }
        }
      } catch (error) {
        console.error("Error saving payment:", error);
        alert("Terjadi kesalahan saat menyimpan pembayaran");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      let processedValue: string | number = value;

      if (name === "amount") {
        const numericValue = value.replace(/[^0-9]/g, "");
        processedValue = numericValue === "" ? 0 : parseInt(numericValue) || 0;
      }

      setFormData({
        ...formData,
        [name]: processedValue,
      });
    };

    const formatCurrency = (value: number | string): string => {
      if (!value || value === 0) return "";
      const numValue = typeof value === "string" ? parseInt(value) || 0 : value;
      return new Intl.NumberFormat("id-ID").format(numValue);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {payment ? "Edit Metode Pembayaran" : "Input Pembayaran Baru"}
          </h3>

          <div className="space-y-4">
            {/* Student Selection - Read Only in Edit Mode */}
            <div className="relative">
              <label
                htmlFor="studentSearch"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pilih Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="studentSearch"
                placeholder="Ketik NISN atau nama siswa..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!payment} // Disable in edit mode
                readOnly={!!payment}
              />

              {showStudentList && filteredStudents.length > 0 && !payment && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => selectStudent(student)}
                    >
                      <div className="text-sm font-medium">
                        {student.nisn} - {student.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.class}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amount - Read Only in Edit Mode */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Jumlah Pembayaran <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  placeholder="0"
                  value={formatCurrency(formData.amount || 0)}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  required
                  disabled={!!payment} // Disable in edit mode
                  readOnly={!!payment}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Contoh: 500,000</p>
            </div>

            {/* Period - Read Only in Edit Mode */}
            <div>
              <label
                htmlFor="period"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Periode Pembayaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="period"
                name="period"
                placeholder="Contoh: November 2024"
                value={formData.period || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                required
                disabled={!!payment} // Disable in edit mode
                readOnly={!!payment}
              />
            </div>

            {/* Date - Read Only in Edit Mode */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tanggal Pembayaran <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                required
                disabled={!!payment} // Disable in edit mode
                readOnly={!!payment}
              />
            </div>

            {/* Method - Only Editable Field */}
            <div>
              <label
                htmlFor="method"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Metode Pembayaran <span className="text-red-500">*</span>
              </label>
              <select
                id="method"
                name="method"
                value={formData.method || "Transfer Bank"}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Cash">Cash</option>
                <option value="E-Wallet">E-Wallet</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
              </select>
            </div>

            {/* Status - Only show in create mode, read-only in edit mode */}
            {!payment && (
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || "Pending"}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                </select>
              </div>
            )}

            {/* Show current status in edit mode */}
            {payment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Saat Ini
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      formData.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {formData.status === "Confirmed"
                      ? "Terkonfirmasi"
                      : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Gunakan tombol konfirmasi di tabel untuk mengubah status
                </p>
              </div>
            )}

            {/* Description - Read Only in Edit Mode */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Keterangan
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Keterangan tambahan (opsional)"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                disabled={!!payment} // Disable in edit mode
                readOnly={!!payment}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? payment
                  ? "Memperbarui..."
                  : "Menyimpan..."
                : payment
                ? "Perbarui Metode"
                : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{getTitleByRole()}</h2>
        {canModify && (
          <button
            onClick={handleAddPayment}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>Input Pembayaran</span>
          </button>
        )}
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {canViewAll ? "Pembayaran Hari Ini" : "Total Pembayaran"}
          </h3>
          <p className="text-2xl font-bold text-green-600">
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
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Total Transaksi
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {filteredPayments.length}
          </p>
          <p className="text-sm text-gray-500">pembayaran</p>
        </div>
      </div>

      {/* Search and Filter */}
      {canViewAll && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama siswa atau NISN..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {canViewAll ? "Daftar Pembayaran" : "Riwayat Pembayaran"}
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
                  Periode
                </th>
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
                filteredPayments
                  .filter((payment) => {
                    if (!searchTerm) return true;
                    return (
                      payment.studentName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      payment.studentNisn.includes(searchTerm)
                    );
                  })
                  .map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.date).toLocaleDateString("id-ID")}
                      </td>
                      {canViewAll && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.studentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              NISN: {payment.studentNisn}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.period}
                      </td>
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
                          {payment.status === "Confirmed"
                            ? "Terkonfirmasi"
                            : "Pending"}
                        </span>
                      </td>
                      {canModify && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditPayment(payment)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                              title="Edit metode pembayaran"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit Metode
                            </button>
                            {payment.status === "Pending" && (
                              <button
                                onClick={() => handleConfirmPayment(payment)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                                title="Konfirmasi pembayaran"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Konfirmasi
                              </button>
                            )}
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
                        ? 7
                        : canViewAll || canModify
                        ? 6
                        : 5
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

      {/* Modals */}
      {isAddingPayment && (
        <PaymentForm
          onSave={() => setIsAddingPayment(false)}
          onCancel={() => setIsAddingPayment(false)}
        />
      )}

      {editingPayment && (
        <PaymentForm
          payment={editingPayment}
          onSave={() => setEditingPayment(null)}
          onCancel={() => setEditingPayment(null)}
        />
      )}

      {/* Confirmation Modal */}
      {confirmingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Konfirmasi Pembayaran
              </h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Apakah anda akan mengkonfirmasi pembayaran atas nama{" "}
                <strong>{confirmingPayment.studentName}</strong>?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-sm">
                  <div>
                    <strong>Jumlah:</strong> Rp{" "}
                    {confirmingPayment.amount.toLocaleString("id-ID")}
                  </div>
                  <div>
                    <strong>Periode:</strong> {confirmingPayment.period}
                  </div>
                  <div>
                    <strong>Metode:</strong> {confirmingPayment.method}
                  </div>
                  <div>
                    <strong>Tanggal:</strong>{" "}
                    {new Date(confirmingPayment.date).toLocaleDateString(
                      "id-ID"
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmingPayment(null)}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={confirmPaymentStatus}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Mengkonfirmasi..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
