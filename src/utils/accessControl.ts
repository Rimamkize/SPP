import { UserRole } from "../types";

export interface MenuPermission {
  id: string;
  roles: UserRole[];
}

// Define menu permissions for each role
export const MENU_PERMISSIONS: MenuPermission[] = [
  { id: "dashboard", roles: ["admin", "staff"] },
  { id: "students", roles: ["admin", "staff"] },
  { id: "payments", roles: ["admin", "staff", "siswa", "orangtua"] },
  { id: "reports", roles: ["admin", "staff"] },
  { id: "notifications", roles: ["admin", "staff"] },
];

// Check if user has permission to access a menu
export const hasMenuPermission = (
  menuId: string,
  userRole: UserRole
): boolean => {
  const menuPermission = MENU_PERMISSIONS.find((menu) => menu.id === menuId);
  return menuPermission ? menuPermission.roles.includes(userRole) : false;
};

// Get allowed menus for a user role
export const getAllowedMenus = (userRole: UserRole): string[] => {
  return MENU_PERMISSIONS.filter((menu) => menu.roles.includes(userRole)).map(
    (menu) => menu.id
  );
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: "Administrator",
  staff: "Staff Tata Usaha",
  siswa: "Siswa",
  orangtua: "Orang Tua",
};

// Check if user can view all data or only their own
export const canViewAllData = (userRole: UserRole): boolean => {
  return ["admin", "staff"].includes(userRole);
};

// Check if user can modify data
export const canModifyData = (userRole: UserRole): boolean => {
  return ["admin", "staff"].includes(userRole);
};
