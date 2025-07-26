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

  const handleAddStudent = () => {
    setIsAddingStudent(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
  };

  const handleDeleteStudent = (studentId: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
      onStudentsChange(students.filter((s) => s.id !== studentId));
    }
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
    const [formData, setFormData] = useState<Partial<Student>>(
      student || {
        name: "",
        class: "",
        parentName: "",
        phone: "",
        email: "",
        sppAmount: 0,
        status: "Belum Bayar",
        totalDebt: 0,
      }
    );

    const handleSubmit = () => {
      // Validate required fields
      if (
        !formData.name ||
        !formData.class ||
        !formData.parentName ||
        !formData.phone ||
        !formData.sppAmount
      ) {
        alert("Mohon lengkapi semua field yang wajib diisi");
        return;
      }

      if (student) {
        onStudentsChange(
          students.map((s) =>
            s.id === student.id
              ? { ...(formData as Student), id: student.id }
              : s
          )
        );
      } else {
        onStudentsChange([
          ...students,
          {
            ...(formData as Student),
            id: Date.now(),
            lastPayment: "-",
          },
        ]);
      }
      onSave();
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      let processedValue: string | number = value;

      if (name === "sppAmount") {
        // Remove any non-digit characters and convert to number
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

            <div>
              <label
                htmlFor="sppAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Jumlah SPP (IDR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  id="sppAmount"
                  name="sppAmount"
                  placeholder="0"
                  value={formatCurrency(formData.sppAmount || 0)}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Contoh: 500,000</p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Simpan
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
                SPP
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
                      ID: {student.id}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp {student.sppAmount.toLocaleString("id-ID")}
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
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="text-red-600 hover:text-red-900"
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
    </div>
  );
};
