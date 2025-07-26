import React from "react";
import {
  LogOut,
  Home,
  Users,
  DollarSign,
  FileText,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  hasMenuPermission,
  ROLE_DISPLAY_NAMES,
} from "../../utils/accessControl";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "students", label: "Data Siswa", icon: Users },
    { id: "register", label: "Registrasi Pengguna", icon: UserPlus },
    { id: "payments", label: "Pembayaran", icon: DollarSign },
    { id: "reports", label: "Laporan", icon: FileText },
    { id: "notifications", label: "Notifikasi", icon: MessageCircle },
  ];

  // Filter navigation items based on user role
  const allowedNavItems = navItems.filter((item) =>
    user ? hasMenuPermission(item.id, user.role) : false
  );

  const getUserRoleDisplay = () => {
    return user ? ROLE_DISPLAY_NAMES[user.role] : "";
  };

  return (
    <>
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                SPP Payment System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-700">
                  Halo, {user?.fullName}
                </div>
                <div className="text-xs text-gray-500">
                  {getUserRoleDisplay()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {allowedNavItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === item.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
