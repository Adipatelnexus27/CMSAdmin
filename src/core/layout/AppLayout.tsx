import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from "@mui/material";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { navigationItems } from "@/core/layout/NavigationConfig";
import { useAuthContext } from "@/core/auth/AuthContext";
import { env } from "@/core/config/env";

const drawerWidth = 280;

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthContext();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen((prev) => !prev)} sx={{ mr: 2 }}>
            <MenuRoundedIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {env.appName}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.displayName}
          </Typography>
          <IconButton color="inherit" onClick={() => void logout()}>
            <LogoutRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", pt: 8 }
        }}
      >
        <List sx={{ px: 1 }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={() => setOpen(false)}
              sx={{
                mb: 0.5,
                borderRadius: 1,
                "&.active": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": { color: "inherit" }
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, pt: 10, px: { xs: 2, md: 3 }, pb: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
