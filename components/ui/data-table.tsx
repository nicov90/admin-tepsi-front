'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "./button"
import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "./input"
import { useWindowSize } from "@/hooks/useWindowSize"

interface DataTableProps<TData, TValue> {
  children?: React.ReactNode
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  filterByColumn: string
}

export function DataTable<TData, TValue>({
  children,
  columns,
  data,
  searchPlaceholder,
  filterByColumn,
}: DataTableProps<TData, TValue>) {
  const { width } = useWindowSize();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const targetRowCount = 10;

  const currentRowCount = table.getRowModel().rows?.length || 0;
  const emptyRowsCount = Math.max(targetRowCount - currentRowCount, 0);

  const emptyRows = Array.from({ length: emptyRowsCount }).map((_, index) => (
    <TableRow key={`empty-row-${index}`} className="text-center h-8 border-b-0">
      {columns.map((column) => (
        <TableCell key={`empty-cell-${index}-${column.header}`} className="h-full"></TableCell>
      ))}
    </TableRow>
  ));
  
  return (
    <>
      <div className="flex gap-x-3 w-full py-6">
        <div className="flex items-center w-full">
          {children}
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 top-[19px] transform -translate-y-1/2 z-10" size={16}/>
            <Input 
              type="text" 
              placeholder={searchPlaceholder ? searchPlaceholder : "Buscar..."} 
              className='relative pl-11 min-w-28 border-t-0 border-l-0 border-r-0 border-b rounded-none'
              value={(table.getColumn(filterByColumn)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(filterByColumn)?.setFilterValue(event.target.value)
            }
            ></Input>
          </div>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader style={{ backgroundColor: "rgb(243 244 246)" }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, i) => {
                  return (
                    <TableHead key={header.id} className="text-center text-blue-900 px-0 md:px-4" style={{ paddingLeft: i === 0 ? 25 : 0 }}>
                      {header.isPlaceholder ? null : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
          {currentRowCount > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="text-center border-b-2"
                >
                  {row.getVisibleCells().map((cell, i) => {
                    return <TableCell className="text-[14.5px] font-medium text-slate-800 py-2.5" key={cell.id} 
                      style={{ 
                        paddingLeft: i === 0 ? 20 : 0, 
                        // minWidth: (cell.column.id !== 'actions') ? 120 : 0,
                        // maxWidth: i === 0 ? 0 : 120
                        // borderRight: cell.column.id === 'existePersonal' ? "1px solid rgb(229, 231, 235)" : "none"
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                {width < 768 ? (
                  <div className="absolute w-full left-1/2 -translate-x-1/2 flex items-center justify-center border-b-[1px] py-[1.2rem]">
                    <p>Sin datos.</p>
                  </div>  
                ) : (
                  <TableCell colSpan={columns.length} className="h-16 text-center">
                    Sin datos.
                  </TableCell>
                )}
              </TableRow>
            )}
            {emptyRows}
          </TableBody>
        </Table>
        <div className="w-full flex items-center justify-end space-x-2 h-12 px-4" style={{ backgroundColor: "rgb(243 244 246)" }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </>
  )
}
