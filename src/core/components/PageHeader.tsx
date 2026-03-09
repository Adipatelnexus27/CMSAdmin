import { Box, Button, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  endAdornment?: ReactNode;
}

export function PageHeader({ title, subtitle, actionLabel, onAction, endAdornment }: PageHeaderProps) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2}>
      <Box>
        <Typography variant="h5">{title}</Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Stack direction="row" gap={1}>
        {endAdornment}
        {actionLabel ? (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}

