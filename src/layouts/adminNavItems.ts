export interface AdminNavItem {
  label: string;
  path: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", path: "/" },
  { label: "Claims", path: "/claims" },
  { label: "Investigations", path: "/investigations" },
  { label: "Fraud Review", path: "/fraud-review" },
  { label: "Settlement Processing", path: "/settlements" },
  { label: "Reports", path: "/reports" },
  { label: "User Management", path: "/users" },
  { label: "System Configuration", path: "/system-configuration" }
];
