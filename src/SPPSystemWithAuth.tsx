import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginForm } from "./components/auth/LoginForm";
import { Navigation } from "./components/navigation/Navigation";
import { Dashboard } from "./components/dashboard/Dashboard";
import { StudentManagement } from "./components/students/StudentManagement";
import { PaymentManagement } from "./components/payments/PaymentManagement";
import { Reports } from "./components/reports/Reports";
import { NotificationManagement } from "./components/notifications/NotificationManagement";
import { apiService } from "./services/apiService";
import { hasMenuPermission, getAllowedMenus } from "./utils/accessControl";
import { Student, Payment } from "./types";

const SPPDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API (PostgreSQL or Mock)
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        // Load students and payments data
        const [studentsResult, paymentsResult] = await Promise.all([
          apiService.getStudents(),
          apiService.getPayments(),
        ]);

        if (studentsResult.success) {
          setStudents(studentsResult.data);
        }

        if (paymentsResult.success) {
          setPayments(paymentsResult.data);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Set default tab based on user role
  useEffect(() => {
    if (user) {
      const allowedMenus = getAllowedMenus(user.role);
      if (allowedMenus.length > 0) {
        // For siswa and orangtua, default to payments
        if (user.role === "siswa" || user.role === "orangtua") {
          setActiveTab("payments");
        } else {
          // For admin and staff, default to dashboard
          setActiveTab(
            allowedMenus.includes("dashboard") ? "dashboard" : allowedMenus[0]
          );
        }
      }
    }
  }, [user]);

  // Handle tab change with permission check
  const handleTabChange = (tab: string) => {
    if (user && hasMenuPermission(tab, user.role)) {
      setActiveTab(tab);
    }
  };

  // Handle student data changes and refresh from API
  const handleStudentsChange = async (updatedStudents: Student[]) => {
    setStudents(updatedStudents);

    // Optionally refresh data from API to ensure consistency
    try {
      const studentsResult = await apiService.getStudents();
      if (studentsResult.success) {
        setStudents(studentsResult.data);
      }
    } catch (err) {
      console.warn("Failed to refresh students data:", err);
      // Keep the local update if API call fails
    }
  };

  // Handle payment data changes and refresh from API
  const handlePaymentsChange = async (updatedPayments: Payment[]) => {
    setPayments(updatedPayments);

    // Optionally refresh data from API to ensure consistency
    try {
      const paymentsResult = await apiService.getPayments();
      if (paymentsResult.success) {
        setPayments(paymentsResult.data);
      }
    } catch (err) {
      console.warn("Failed to refresh payments data:", err);
      // Keep the local update if API call fails
    }
  };

  if (!isAuthenticated || !user) {
    return null; // This will be handled by AuthWrapper
  }

  const renderContent = () => {
    // Show loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
            <p className="text-sm text-gray-500">
              Mode: {apiService.getCurrentMode()}
            </p>
          </div>
        </div>
      );
    }

    // Show error state
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-red-800">
              Error Loading Data
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    // Check if user has permission for current tab
    if (!user || !hasMenuPermission(activeTab, user.role)) {
      return (
        <div className="text-center text-gray-500 mt-8">
          <h3 className="text-lg font-medium">Akses Ditolak</h3>
          <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard students={students} payments={payments} />;
      case "students":
        return (
          <StudentManagement
            students={students}
            onStudentsChange={handleStudentsChange}
          />
        );
      case "payments":
        return (
          <PaymentManagement
            payments={payments}
            onPaymentsChange={handlePaymentsChange}
          />
        );
      case "reports":
        return <Reports students={students} payments={payments} />;
      case "notifications":
        return <NotificationManagement students={students} />;
      default:
        // Redirect to first allowed menu
        const allowedMenus = getAllowedMenus(user.role);
        if (allowedMenus.length > 0 && activeTab !== allowedMenus[0]) {
          setActiveTab(allowedMenus[0]);
        }
        return <div className="text-center text-gray-500 mt-8">Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

const SPPSystemWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
};

const AuthWrapper: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <SPPDashboard />;
};

export default SPPSystemWithAuth;
