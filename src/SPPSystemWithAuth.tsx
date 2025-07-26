import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginForm } from "./components/auth/LoginForm";
import { Navigation } from "./components/navigation/Navigation";
import { Dashboard } from "./components/dashboard/Dashboard";
import { StudentManagement } from "./components/students/StudentManagement";
import { PaymentManagement } from "./components/payments/PaymentManagement";
import { Reports } from "./components/reports/Reports";
import { UserRegistration } from "./components/registration";
import { mockStudents, mockPayments } from "./data/mockData";
import { hasMenuPermission, getAllowedMenus } from "./utils/accessControl";

const SPPDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("");
  const [students, setStudents] = useState(mockStudents);

  // Set default tab based on user role
  React.useEffect(() => {
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

  if (!isAuthenticated || !user) {
    return null; // This will be handled by AuthWrapper
  }

  const renderContent = () => {
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
        return <Dashboard students={students} payments={mockPayments} />;
      case "students":
        return (
          <StudentManagement
            students={students}
            onStudentsChange={setStudents}
          />
        );
      case "register":
        return <UserRegistration />;
      case "payments":
        return <PaymentManagement payments={mockPayments} />;
      case "reports":
        return <Reports students={students} payments={mockPayments} />;
      case "notifications":
        return (
          <div className="text-center text-gray-500 mt-8">
            Notifikasi WhatsApp - Coming Soon
          </div>
        );
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
