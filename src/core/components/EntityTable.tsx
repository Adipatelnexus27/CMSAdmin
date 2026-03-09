import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface EntityTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyText?: string;
}

export function EntityTable<T>({ columns, rows, rowKey, emptyText = "No records found." }: EntityTableProps<T>) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key}>{column.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow hover key={rowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={`${rowKey(row)}-${column.key}`}>
                    {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Typography variant="body2" color="text.secondary">
                  {emptyText}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

