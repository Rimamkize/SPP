import React, { useState } from "react";
import {
  MessageCircle,
  Send,
  Phone,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { Student } from "../../types";

interface NotificationManagementProps {
  students: Student[];
}

export const NotificationManagement: React.FC<NotificationManagementProps> = ({
  students,
}) => {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [message, setMessage] = useState(
    "Halo! Ini adalah pemberitahuan pembayaran SPP dari sekolah."
  );
  const [messageType, setMessageType] = useState<
    "payment_reminder" | "general" | "custom"
  >("payment_reminder");

  // Predefined message templates
  const messageTemplates = {
    payment_reminder:
      "Halo Bapak/Ibu {parentName}, kami informasikan bahwa pembayaran SPP atas nama {studentName} kelas {class} belum lunas. Mohon segera melakukan pembayaran. Terima kasih.",
    general:
      "Halo Bapak/Ibu {parentName}, ini adalah pemberitahuan umum dari sekolah terkait {studentName} kelas {class}.",
    custom: message,
  };

  // Filter students who haven't paid (for payment reminders)
  const unpaidStudents = students.filter(
    (student) =>
      student.status === "Belum Bayar" || student.status === "Tunggakan"
  );

  // Get students to show based on message type
  const getStudentsToShow = () => {
    if (messageType === "payment_reminder") {
      return unpaidStudents;
    }
    return students;
  };

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const studentsToShow = getStudentsToShow();
    if (selectedStudents.length === studentsToShow.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(studentsToShow.map((s) => s.id));
    }
  };

  const handleSendWhatsApp = (student: Student) => {
    let finalMessage = messageTemplates[messageType];

    // Replace placeholders with actual data
    finalMessage = finalMessage
      .replace(/{parentName}/g, student.parentName)
      .replace(/{studentName}/g, student.name)
      .replace(/{class}/g, student.class);

    const trimmedNumber = student.phone.replace(/\D/g, ""); // Remove non-digit characters
    const encodedMessage = encodeURIComponent(finalMessage);
    const waUrl = `https://wa.me/${trimmedNumber}?text=${encodedMessage}`;
    window.open(waUrl, "_blank");
  };

  const handleSendBulkWhatsApp = () => {
    const studentsToSend = getStudentsToShow().filter((student) =>
      selectedStudents.includes(student.id)
    );

    studentsToSend.forEach((student, index) => {
      // Add small delay between messages to avoid overwhelming the browser
      setTimeout(() => {
        handleSendWhatsApp(student);
      }, index * 1000);
    });
  };

  const handleMessageTypeChange = (
    type: "payment_reminder" | "general" | "custom"
  ) => {
    setMessageType(type);
    if (type !== "custom") {
      setMessage(messageTemplates[type]);
    }
    setSelectedStudents([]); // Reset selection when changing type
  };

  const studentsToDisplay = getStudentsToShow();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Notifikasi WhatsApp
        </h2>
        <div className="flex items-center space-x-2 text-gray-600">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">Kirim Pesan ke Orang Tua</span>
        </div>
      </div>

      {/* Feature Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Tentang Fitur Notifikasi
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Kirim pesan WhatsApp otomatis ke orang tua siswa</li>
              <li>
                • Template pesan tersedia untuk pengingat pembayaran dan
                pemberitahuan umum
              </li>
              <li>• Dapat mengirim pesan secara individual atau massal</li>
              <li>
                • Pesan akan dibuka di WhatsApp Web atau aplikasi WhatsApp
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Message Type Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Pilih Jenis Pesan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleMessageTypeChange("payment_reminder")}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              messageType === "payment_reminder"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium">Pengingat Pembayaran</span>
            </div>
            <p className="text-sm text-gray-600">
              Kirim pengingat untuk siswa yang belum bayar SPP
            </p>
          </button>

          <button
            onClick={() => handleMessageTypeChange("general")}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              messageType === "general"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Pemberitahuan Umum</span>
            </div>
            <p className="text-sm text-gray-600">
              Kirim pemberitahuan umum ke semua atau beberapa orang tua
            </p>
          </button>

          <button
            onClick={() => handleMessageTypeChange("custom")}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              messageType === "custom"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Send className="h-5 w-5 text-green-600" />
              <span className="font-medium">Pesan Kustom</span>
            </div>
            <p className="text-sm text-gray-600">
              Tulis pesan sendiri dengan template yang dapat disesuaikan
            </p>
          </button>
        </div>
      </div>

      {/* Message Template */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Template Pesan
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan yang akan dikirim:
            </label>
            <textarea
              value={
                messageType === "custom"
                  ? message
                  : messageTemplates[messageType]
              }
              onChange={(e) => {
                if (messageType === "custom") {
                  setMessage(e.target.value);
                }
              }}
              disabled={messageType !== "custom"}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                messageType !== "custom" ? "bg-gray-50" : ""
              }`}
              rows={4}
              placeholder="Tulis pesan Anda di sini..."
            />
            {messageType !== "custom" && (
              <p className="text-xs text-gray-500 mt-1">
                Variabel tersedia: {"{parentName}"}, {"{studentName}"},{" "}
                {"{class}"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Student Selection */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {messageType === "payment_reminder"
                ? "Siswa dengan Tunggakan"
                : "Pilih Siswa"}{" "}
              ({studentsToDisplay.length})
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedStudents.length === studentsToDisplay.length
                  ? "Batalkan Semua"
                  : "Pilih Semua"}
              </button>
              {selectedStudents.length > 0 && (
                <button
                  onClick={handleSendBulkWhatsApp}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                  <span>Kirim ke {selectedStudents.length} Orang Tua</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      selectedStudents.length === studentsToDisplay.length &&
                      studentsToDisplay.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Siswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orang Tua
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. WhatsApp
                </th>
                {messageType === "payment_reminder" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentsToDisplay.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.class}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.parentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {student.phone}
                      </span>
                    </div>
                  </td>
                  {messageType === "payment_reminder" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.status === "Tunggakan"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleSendWhatsApp(student)}
                      className="bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1 hover:bg-green-700"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>Kirim</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {studentsToDisplay.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {messageType === "payment_reminder"
                ? "Tidak ada siswa dengan tunggakan pembayaran"
                : "Tidak ada data siswa"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
