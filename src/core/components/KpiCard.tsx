import { Card, CardContent, Typography } from "@mui/material";

interface KpiCardProps {
  label: string;
  value: string;
}

export function KpiCard({ label, value }: KpiCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  );
}

