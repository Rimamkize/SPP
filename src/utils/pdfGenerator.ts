import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Student, Payment } from "../types";

interface ReportData {
  students: Student[];
  payments: Payment[];
  reportType: string;
  selectedClass: string;
}

export const generateMonthlyReportPDF = (data: ReportData) => {
  const { students, payments, reportType, selectedClass } = data;

  // Generate current period dynamically
  const currentDate = new Date();
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const period = `${
    monthNames[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

  try {
    // Create new PDF document and setup autoTable
    const doc = new jsPDF() as any;

    // Use autoTable function directly instead of binding
    const createTable = (options: any) => {
      return autoTable(doc, options);
    };

    // Attach the wrapper function
    doc.autoTable = createTable;

    // Set up document formatting
    doc.setFont("helvetica");
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      "LAPORAN PEMBAYARAN SPP",
      doc.internal.pageSize.getWidth() / 2,
      20,
      { align: "center" }
    );
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("SMA NEGERI EXAMPLE", doc.internal.pageSize.getWidth() / 2, 30, {
      align: "center",
    });
    doc.text(
      "Jl. Pendidikan No. 123, Jakarta",
      doc.internal.pageSize.getWidth() / 2,
      38,
      { align: "center" }
    );
    doc.setLineWidth(0.5);
    doc.line(20, 45, doc.internal.pageSize.getWidth() - 20, 45);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DETAIL LAPORAN", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Periode: ${period}`, 20, 65);
    doc.text(`Jenis Laporan: ${reportType}`, 20, 72);
    doc.text(`Kelas: ${selectedClass}`, 20, 79);
    doc.text(
      `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`,
      20,
      86
    );

    // ...existing code for summary and tables...
    const filteredStudents =
      selectedClass === "Semua Kelas"
        ? students
        : students.filter((s: Student) => s.class === selectedClass);
    const confirmedPayments = payments.filter(
      (p: Payment) => p.status === "Confirmed"
    );
    const totalRevenue = confirmedPayments.reduce(
      (sum: number, p: Payment) => sum + p.amount,
      0
    );
    const paidStudents = filteredStudents.filter(
      (s: Student) => s.status === "Lunas"
    ).length;
    const overdueStudents = filteredStudents.filter(
      (s: Student) => s.status === "Tunggakan"
    ).length;
    const unpaidStudents = filteredStudents.filter(
      (s: Student) => s.status === "Belum Bayar"
    ).length;
    const totalDebt = filteredStudents.reduce(
      (sum: number, s: Student) => sum + s.totalDebt,
      0
    );

    doc.setFont("helvetica", "bold");
    doc.text("RINGKASAN KEUANGAN", 20, 100);
    const summaryData = [
      ["Total Siswa", filteredStudents.length.toString()],
      ["Siswa Lunas", paidStudents.toString()],
      ["Siswa Belum Bayar", unpaidStudents.toString()],
      ["Siswa Menunggak", overdueStudents.toString()],
      ["Total Penerimaan", `Rp ${totalRevenue.toLocaleString("id-ID")}`],
      ["Total Tunggakan", `Rp ${totalDebt.toLocaleString("id-ID")}`],
    ];
    doc.autoTable({
      startY: 105,
      head: [["Keterangan", "Jumlah"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60, halign: "right" },
      },
    });

    // ...existing code for class summary...
    const classSummary = new Map<
      string,
      {
        total: number;
        paid: number;
        unpaid: number;
        overdue: number;
        revenue: number;
      }
    >();
    filteredStudents.forEach((student: Student) => {
      if (!classSummary.has(student.class)) {
        classSummary.set(student.class, {
          total: 0,
          paid: 0,
          unpaid: 0,
          overdue: 0,
          revenue: 0,
        });
      }
      const classData = classSummary.get(student.class)!;
      classData.total++;
      if (student.status === "Lunas") classData.paid++;
      else if (student.status === "Belum Bayar") classData.unpaid++;
      else if (student.status === "Tunggakan") classData.overdue++;
      const studentPayments = payments.filter(
        (p: Payment) =>
          p.studentName === student.name && p.status === "Confirmed"
      );
      classData.revenue += studentPayments.reduce(
        (sum: number, p: Payment) => sum + p.amount,
        0
      );
    });
    const classTableData = Array.from(classSummary.entries()).map(
      ([className, data]) => [
        className,
        data.total.toString(),
        data.paid.toString(),
        data.unpaid.toString(),
        data.overdue.toString(),
        `Rp ${data.revenue.toLocaleString("id-ID")}`,
      ]
    );
    const startY1 = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 150;
    doc.autoTable({
      startY: startY1,
      head: [
        [
          "Kelas",
          "Total Siswa",
          "Lunas",
          "Belum Bayar",
          "Tunggakan",
          "Penerimaan",
        ],
      ],
      body: classTableData,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 45, halign: "right" },
      },
    });

    if (selectedClass !== "Semua Kelas" && filteredStudents.length <= 20) {
      const studentTableData = filteredStudents.map((student: Student) => [
        student.name,
        student.parentName,
        student.status,
        student.lastPayment || "-",
        `Rp ${student.totalDebt.toLocaleString("id-ID")}`,
      ]);
      const startY2 = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 200;
      doc.autoTable({
        startY: startY2,
        head: [
          [
            "Nama Siswa",
            "Nama Orang Tua",
            "Status",
            "Bayar Terakhir",
            "Tunggakan",
          ],
        ],
        body: studentTableData,
        theme: "grid",
        headStyles: { fillColor: [66, 139, 202] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 35, halign: "right" },
        },
      });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Laporan ini dibuat secara otomatis pada ${new Date().toLocaleString(
        "id-ID"
      )}`,
      doc.internal.pageSize.getWidth() / 2,
      pageHeight - 20,
      { align: "center" }
    );
    const currentY = doc.lastAutoTable
      ? doc.lastAutoTable.finalY + 30
      : pageHeight - 80;
    doc.setFontSize(10);
    doc.text("Mengetahui,", doc.internal.pageSize.getWidth() - 80, currentY);
    doc.text(
      "Kepala Sekolah",
      doc.internal.pageSize.getWidth() - 80,
      currentY + 7
    );
    doc.text(
      "Dibuat oleh,",
      doc.internal.pageSize.getWidth() - 80,
      currentY + 40
    );
    doc.text(
      "Staff Tata Usaha",
      doc.internal.pageSize.getWidth() - 80,
      currentY + 47
    );

    // Generate filename with safe formatting
    const dateStr = new Date().toISOString().split("T")[0];
    const classStr = selectedClass.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Laporan_SPP_${dateStr}_${classStr}.pdf`;

    doc.save(filename);
    return filename;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(
      `Failed to generate PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const generateOverdueReportPDF = (students: Student[]) => {
  // Generate current period dynamically
  const currentDate = new Date();
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const period = `${
    monthNames[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

  try {
    const doc = new jsPDF() as any;

    // Use autoTable function directly instead of binding
    const createTable = (options: any) => {
      return autoTable(doc, options);
    };

    // Attach the wrapper function
    doc.autoTable = createTable;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      "LAPORAN TUNGGAKAN SPP",
      doc.internal.pageSize.getWidth() / 2,
      20,
      {
        align: "center",
      }
    );

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("SMA NEGERI EXAMPLE", doc.internal.pageSize.getWidth() / 2, 30, {
      align: "center",
    });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 35, doc.internal.pageSize.getWidth() - 20, 35);

    // Report details
    doc.setFontSize(12);
    doc.text(`Periode: ${period}`, 20, 45);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 20, 52);

    // Overdue students data
    const overdueStudents = students.filter(
      (s: Student) => s.status === "Tunggakan" || s.totalDebt > 0
    );

    const tableData = overdueStudents.map((student: Student) => [
      student.name,
      student.class,
      student.parentName,
      student.phone,
      student.lastPayment || "-",
      `Rp ${student.totalDebt.toLocaleString("id-ID")}`,
    ]);

    // Check if autoTable is available
    if (typeof doc.autoTable !== "function") {
      throw new Error("jsPDF autoTable plugin not loaded");
    }

    doc.autoTable({
      startY: 60,
      head: [
        [
          "Nama Siswa",
          "Kelas",
          "Orang Tua",
          "No. HP",
          "Bayar Terakhir",
          "Tunggakan",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [220, 53, 69] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 20 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 35, halign: "right" },
      },
    });

    // Summary
    const totalOverdue = overdueStudents.reduce(
      (sum: number, s: Student) => sum + s.totalDebt,
      0
    );

    const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;

    doc.autoTable({
      startY: startY,
      head: [["Ringkasan Tunggakan", ""]],
      body: [
        ["Total Siswa Menunggak", overdueStudents.length.toString()],
        ["Total Nilai Tunggakan", `Rp ${totalOverdue.toLocaleString("id-ID")}`],
      ],
      theme: "grid",
      headStyles: { fillColor: [220, 53, 69] },
      styles: { fontSize: 10 },
    });

    // Generate filename with safe formatting
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `Laporan_Tunggakan_${dateStr}.pdf`;

    doc.save(filename);

    return filename;
  } catch (error) {
    console.error("Error generating overdue PDF:", error);
    throw new Error(
      `Failed to generate overdue PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
