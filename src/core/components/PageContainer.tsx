import { Box, BoxProps } from "@mui/material";
import { PropsWithChildren } from "react";

export function PageContainer({ children, ...props }: PropsWithChildren<BoxProps>) {
  return (
    <Box {...props} sx={{ display: "grid", gap: 2, ...(props.sx || {}) }}>
      {children}
    </Box>
  );
}

