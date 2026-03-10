import { AppBar, Box, Button, Chip, Divider, Drawer, List, ListItemButton, ListItemText, Stack, Toolbar, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/store/authSlice";
import { logUserAction } from "../features/audit/services/auditTrailClient";
import { ADMIN_NAV_ITEMS, AdminNavItem } from "./adminNavItems";

const drawerWidth = 260;

function isNavItemActive(item: AdminNavItem, pathname: string): boolean {
  if (item.path === "/") {
    return pathname === "/";
  }

  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

export function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAppSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const previousPathRef = useRef<string | null>(null);

  const selectedNavPath = useMemo(() => {
    const active = ADMIN_NAV_ITEMS.find((item) => isNavItemActive(item, location.pathname));
    return active?.path;
  }, [location.pathname]);

  useEffect(() => {
    if (previousPathRef.current === location.pathname) {
      return;
    }

    previousPathRef.current = location.pathname;
    void logUserAction("Navigation", {
      description: `Navigated to ${location.pathname}`,
      entityName: "AdminPanel",
      requestPath: location.pathname
    });
  }, [location.pathname]);

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700}>
          Claim Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Admin Console
        </Typography>
      </Box>
      <Divider />
      <List sx={{ p: 1, flexGrow: 1 }}>
        {ADMIN_NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            selected={selectedNavPath === item.path}
            onClick={() => {
              void logUserAction("Navigation", {
                description: `Opened ${item.label}`,
                entityName: "AdminPanel",
                requestPath: item.path
              });
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{ borderRadius: 1, mb: 0.5 }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Signed in as
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>
          {auth.fullName ?? auth.email ?? "User"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` }
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 72 }}>
          <Button
            variant="outlined"
            size="small"
            sx={{ display: { xs: "inline-flex", md: "none" } }}
            onClick={() => setMobileOpen(true)}
          >
            Menu
          </Button>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {ADMIN_NAV_ITEMS.find((item) => item.path === selectedNavPath)?.label ?? "CMS Admin"}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {auth.roles.map((role) => (
                <Chip key={role} size="small" variant="outlined" label={role} />
              ))}
            </Stack>
          </Box>

          <Button
            variant="outlined"
            onClick={() => {
              void logUserAction("Logout", {
                description: "User initiated logout from admin console.",
                entityName: "Auth",
                requestPath: location.pathname
              });
              dispatch(logout());
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" }
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: 1,
              borderColor: "divider"
            }
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, pt: "72px" }}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
