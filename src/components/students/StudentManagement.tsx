import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { Student } from "../../types";
import { apiService } from "../../services/apiService";

interface StudentManagementProps {
  students: Student[];
  onStudentsChange: (students: Student[]) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onStudentsChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddStudent = () => {
    setIsAddingStudent(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
  };

  const handleDeleteStudent = (student: Student) => {
    setDeletingStudent(student);
  };

  const confirmDeleteStudent = async () => {
    if (!deletingStudent) return;

    setIsDeleting(true);
    try {
      const response = await apiService.deleteStudent?.(deletingStudent.id);
      if (response?.success) {
        onStudentsChange(students.filter((s) => s.id !== deletingStudent.id));
        setDeletingStudent(null);
      } else {
        alert(
          "Gagal menghapus data siswa: " +
            (response?.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Terjadi kesalahan saat menghapus data siswa");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteStudent = () => {
    setDeletingStudent(null);
  };

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "" || student.class === filterClass;
    const matchesStatus =
      filterStatus === "" || student.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const StudentForm: React.FC<{
    student?: Student;
    onSave: () => void;
    onCancel: () => void;
  }> = ({ student, onSave, onCancel }) => {
    const [formData, setFormData] = useState<
      Partial<Student & { password: string; confirmPassword: string }>
    >(
      student || {
        nisn: "",
        name: "",
        class: "",
        parentName: "",
        phone: "",
        email: "",
        status: "Belum Bayar",
        totalDebt: 0,
        password: "",
        confirmPassword: "",
      }
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
      // Validate required fields
      if (
        !formData.nisn ||
        !formData.name ||
        !formData.class ||
        !formData.parentName ||
        !formData.phone
      ) {
        alert("Mohon lengkapi semua field yang wajib diisi");
        return;
      }

      // Validate NISN format (10 digits)
      if (!/^\d{10}$/.test(formData.nisn || "")) {
        alert("NISN harus berupa 10 digit angka");
        return;
      }

      // Check for duplicate NISN (except when editing current student)
      const duplicateNISN = students.find(
        (s) => s.nisn === formData.nisn && s.id !== student?.id
      );
      if (duplicateNISN) {
        alert("NISN sudah terdaftar untuk siswa lain");
        return;
      }

      // For new students, validate password fields
      if (!student) {
        if (!formData.password || !formData.confirmPassword) {
          alert(
            "Password dan konfirmasi password harus diisi untuk siswa baru"
          );
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          alert("Password dan konfirmasi password tidak sama");
          return;
        }
        if (formData.password.length < 6) {
          alert("Password minimal 6 karakter");
          return;
        }
      }

      setIsSubmitting(true);
      try {
        if (student) {
          // Update existing student
          const response = await apiService.updateStudent?.({
            ...formData,
            id: student.id,
          });
          if (response?.success) {
            onStudentsChange(
              students.map((s) =>
                s.id === student.id
                  ? { ...(formData as Student), id: student.id }
                  : s
              )
            );
            onSave();
          } else {
            alert(
              "Gagal memperbarui data siswa: " +
                (response?.message || "Unknown error")
            );
          }
        } else {
          // Create new student with accounts
          const response = await apiService.createStudentWithAccounts?.(
            formData
          );
          if (response?.success) {
            const newStudent = response.data;
            onStudentsChange([...students, newStudent]);
            onSave();
          } else {
            alert(
              "Gagal membuat siswa baru: " +
                (response?.message || "Unknown error")
            );
          }
        }
      } catch (error) {
        console.error("Error saving student:", error);
        alert("Terjadi kesalahan saat menyimpan data siswa");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      let processedValue: string | number = value;

      if (name === "nisn") {
        // Only allow numeric input for NISN
        processedValue = value.replace(/[^0-9]/g, "");
      }

      setFormData({
        ...formData,
        [name]: processedValue,
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {student ? "Edit Data Siswa" : "Tambah Siswa Baru"}
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Masukkan nama lengkap siswa"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="nisn"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                NISN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nisn"
                name="nisn"
                placeholder="Masukkan 10 digit NISN"
                value={formData.nisn || ""}
                onChange={handleChange}
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Contoh: 1234567890 (10 digit)
              </p>
            </div>

            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                id="class"
                name="class"
                value={formData.class || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Kelas</option>
                <option value="X-A">X-A</option>
                <option value="X-B">X-B</option>
                <option value="XI-A">XI-A</option>
                <option value="XI-B">XI-B</option>
                <option value="XII-A">XII-A</option>
                <option value="XII-B">XII-B</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="parentName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Orang Tua <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="parentName"
                name="parentName"
                placeholder="Masukkan nama orang tua/wali"
                value={formData.parentName || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Contoh: 081234567890"
                value={formData.phone || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Contoh: orangtua@email.com"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Password fields - only for new students */}
            {!student && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Informasi Akun (Untuk Siswa & Orang Tua)
                  </h4>
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Masukkan password untuk akun siswa dan orang tua"
                    value={formData.password || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimal 6 karakter
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Ulangi password"
                    value={formData.confirmPassword || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Catatan:</strong> Sistem akan membuat 3 akun secara
                    otomatis:
                    <br />• Akun siswa dengan username: NISN (contoh:
                    1234567890)
                    <br />• Akun siswa dengan username: nama_siswa (contoh:
                    budi_santoso)
                    <br />• Akun orang tua dengan username: NISN_parent
                    <br />
                    Siswa dapat login dengan NISN atau nama (huruf kecil), semua
                    akun menggunakan password yang sama.
                  </p>
                </div>
              </>
            )}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Manajemen Data Siswa
        </h2>
        <button
          onClick={handleAddStudent}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Siswa</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama siswa atau orang tua..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            <option value="X-A">X-A</option>
            <option value="X-B">X-B</option>
            <option value="XI-A">XI-A</option>
            <option value="XI-B">XI-B</option>
            <option value="XII-A">XII-A</option>
            <option value="XII-B">XII-B</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="Lunas">Lunas</option>
            <option value="Belum Bayar">Belum Bayar</option>
            <option value="Tunggakan">Tunggakan</option>
          </select>
          <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Siswa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kelas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orang Tua
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tunggakan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {student.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      NISN: {student.nisn}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.class}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">
                      {student.parentName}
                    </div>
                    <div className="text-sm text-gray-500">{student.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === "Lunas"
                        ? "bg-green-100 text-green-800"
                        : student.status === "Tunggakan"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.totalDebt > 0
                    ? `Rp ${student.totalDebt.toLocaleString("id-ID")}`
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                      title="Edit data siswa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                      title="Kirim pesan WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Hapus data siswa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isAddingStudent && (
        <StudentForm
          onSave={() => setIsAddingStudent(false)}
          onCancel={() => setIsAddingStudent(false)}
        />
      )}
      {editingStudent && (
        <StudentForm
          student={editingStudent}
          onSave={() => setEditingStudent(null)}
          onCancel={() => setEditingStudent(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Konfirmasi Hapus Data
            </h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Apakah Anda yakin ingin menghapus data siswa berikut?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Nama:</span>
                    <span className="text-gray-900">
                      {deletingStudent.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">NISN:</span>
                    <span className="text-gray-900">
                      {deletingStudent.nisn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Kelas:</span>
                    <span className="text-gray-900">
                      {deletingStudent.class}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Peringatan:</strong> Tindakan ini akan menghapus:
                </p>
                <ul className="text-sm text-red-600 mt-2 space-y-1">
                  <li>• Data siswa secara permanen</li>
                  <li>• Akun siswa (username: {deletingStudent.nisn})</li>
                  <li>
                    • Akun siswa (username:{" "}
                    {deletingStudent.name
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, "_")
                      .replace(/_+/g, "_")
                      .replace(/^_|_$/g, "")}
                    )
                  </li>
                  <li>
                    • Akun orang tua (username: {deletingStudent.nisn}_parent)
                  </li>
                  <li>• Data tidak dapat dikembalikan</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteStudent}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteStudent}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Data</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
