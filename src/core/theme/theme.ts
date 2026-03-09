import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0047AB"
    },
    secondary: {
      main: "#00897B"
    },
    background: {
      default: "#F4F6FA",
      paper: "#FFFFFF"
    }
  },
  shape: {
    borderRadius: 10
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    h5: {
      fontWeight: 700
    },
    h6: {
      fontWeight: 700
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
        }
      }
    }
  }
});

