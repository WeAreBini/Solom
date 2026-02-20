'use client';

/**
 * @ai-context Generic reusable paginated table component.
 * Accepts arbitrary ReactNode headers and rows; handles client-side pagination internally.
 * @ai-warning All props are ReactNode — pass pre-built JSX cells from the calling component.
 * @ai-related components/insider-senate/InsiderTradesTable.tsx, components/insider-senate/SenateTradesTable.tsx, components/13f/thirteen-f-filter.tsx
 */

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginatedTableProps {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  itemsPerPage?: number;
}

export function PaginatedTable({ headers, rows, itemsPerPage = 15 }: PaginatedTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));

  // @ai-mutates currentPage resets handled by parent via key prop if rows change
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return rows.slice(start, start + itemsPerPage);
  }, [rows, currentPage, itemsPerPage]);

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, i) => (
                <TableHead key={i}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length} className="h-24 text-center text-muted-foreground">
                  No data available.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} &mdash; {rows.length} total records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
