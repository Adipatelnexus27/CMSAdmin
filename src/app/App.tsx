import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store";
import { AppRoutes } from "../routes/AppRoutes";
import { appTheme } from "../theme/theme";

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
