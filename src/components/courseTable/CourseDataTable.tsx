"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { FilterBar } from "./FilterBar";
import ViewColumnsDropdown from "./ViewColumnsDropdown";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  lastFetched?: Date;
  activeCourse: string;
}

export function CourseDataTable<TData, TValue>({
  columns,
  data,
  lastFetched,
  activeCourse,
}: DataTableProps<TData, TValue>) {
  const {
    columnFilters,
    setColumnFilters,
    selectedRows,
    setSelectedRows,
    columnVisibility,
    setColumnVisibility,
  } = useGlobalStore(
    useShallow((state) => ({
      columnFilters: state.columnFilters,
      setColumnFilters: state.setColumnFilters,
      selectedRows: state.selectedRows,
      setSelectedRows: state.setSelectedRows,
      columnVisibility: state.columnVisibility,
      setColumnVisibility: state.setColumnVisibility,
    }))
  );

  const rowSelection = selectedRows[activeCourse] || {};
  const columnFiltersValue = columnFilters[activeCourse] || [];

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: (updater) => {
      const newRowSelectionValue =
        updater instanceof Function ? updater(rowSelection) : updater;
      setSelectedRows(activeCourse, newRowSelectionValue);
    },
    onColumnFiltersChange: (updater) => {
      const newColumnFiltersValue =
        updater instanceof Function ? updater(columnFiltersValue) : updater;
      setColumnFilters(activeCourse, newColumnFiltersValue);
    },
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: (updater) => {
      const newColumnVisibilityValue =
        updater instanceof Function ? updater(columnVisibility) : updater;
      setColumnVisibility(newColumnVisibilityValue);
    },
    state: {
      columnFilters: columnFiltersValue,
      rowSelection,
      sorting,
      columnVisibility,
    },
  });

  return (
    <div className="flex shrink grow flex-col gap-4 min-w-0 min-h-0">
      <div className="flex flex-row justify-between">
        <FilterBar table={table} />
        <ViewColumnsDropdown table={table} />
      </div>
      <ScrollArea className="rounded-md border ">
        <Table className="overflow-x-auto">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={header.column.columnDef.meta?.headerClassName}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <div className="text-sm text-muted-foreground">
        {`${Object.keys(rowSelection).length} out of ${
          data.length
        } rows selected. ${
          lastFetched
            ? `Last Fetched: ${new Date(lastFetched).toLocaleString()}`
            : ""
        }`}
      </div>
    </div>
  );
}
