'use client'
import "dayjs/locale/es";
import { ColumnDef } from "@tanstack/react-table"

import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import { Rol } from "@/interfaces/roles";
import TableItemDropdown from "./tableItemDropdown";
import UsuariosRolModal from "../roles/usuariosRolModal";

const getChevronIcon = (column: any) => {
  if (column.getIsSorted() === "asc") {
    return <ChevronUp className="ml-2 h-4 w-4"/>
  }else{
    return <ChevronDown className="ml-2 h-4 w-4"/>
  }
}
 
export const RolesColumns: ColumnDef<Rol>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       className="size-[17px] border-gray-400 align-middle"
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       className="size-[17px] border-gray-400 align-middle"
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "Name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Nombre
          {getChevronIcon(column)}
        </Button>
      )
    },
    cell: ({ row }) => {
      const value: string = row.getValue("Name") || '';
      const modulo: string = row.getValue("Modulo") || '';
      return <div className={`${modulo === 'GENERAL' ? 'font-bold' : ''}`}>{value}</div>
    }
  },
  {
    accessorKey: "Modulo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Modulo
          {getChevronIcon(column)}
        </Button>
      )
    },
    cell: ({ row }) => {
      const value: string = row.getValue("Modulo") || '';
      return <div className={`${value === 'GENERAL' ? 'font-bold' : ''}`}>{value}</div>
    },
  },
  {
    accessorKey: "Descripcion",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Descripción
          {getChevronIcon(column)}
        </Button>
      )
    },
    cell: ({ row }) => {
      const value: string = row.getValue("Descripcion") || '';
      if(!value) {
        return <div className="text-gray-400 font-normal">Sin descripción</div>
      }
      return (
        <div className="overflow-y-auto">
          <textarea 
            cols={65} 
            rows={Math.ceil(value.length / 65)}
            className="resize-none text-center outline-none" 
            readOnly
            value={value}
          />
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-center items-center gap-2">
          <UsuariosRolModal row={row}/>
          <TableItemDropdown row={row} nombreTabla='roles'/>
        </div>
      )
    },
  },
]