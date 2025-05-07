'use client'
import { ColumnDef } from "@tanstack/react-table";
import "dayjs/locale/es";

import { ArrowUpDown, ChevronDown, ChevronUp, TriangleAlert } from "lucide-react";
 
import { Button } from "@/components/ui/button";
import { IUsuario } from "@/interfaces/usuarios";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import TableItemDropdown from "./tableItemDropdown";

const getChevronIcon = (column: any) => {
  if (column.getIsSorted() === "asc") {
    return <ChevronUp className="ml-2 h-4 w-4"/>
  }else{
    return <ChevronDown className="ml-2 h-4 w-4"/>
  }
}
 
export const UsuarioColumns: ColumnDef<IUsuario>[] = [
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
    accessorKey: "existePersonal",
    header: ({ column }) => {
      return null;
    },
    cell: ({ row }) => {
      const existePersonal = row.original.existePersonal;
      return (
        <div className="flex justify-center items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="" style={{ visibility: !existePersonal ? 'visible' : 'hidden' }}>
                <TriangleAlert className="h-5 w-5" color="rgb(245 70 40)" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm text-gray-500">Este usuario no tiene personal asignado</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    size: 110,
  },
  {
    accessorKey: "nombre",
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
    cell: ({ row }: any) => {
      const existePersonal = row.original.existePersonal;
      return (
        <div>
          {row.getValue("nombre").toUpperCase()}
        </div>
        // <div className="flex justify-center items-center -ml-10">
        //   {/* <TooltipProvider>
        //     <Tooltip>
        //       <TooltipTrigger className="mr-5" style={{ visibility: !existePersonal ? 'visible' : 'hidden' }}>
        //         <TriangleAlert className="h-5 w-5" color="rgb(245 70 40)" />
        //       </TooltipTrigger>
        //       <TooltipContent>
        //         <p className="text-sm text-gray-500">Este usuario no tiene personal asignado</p>
        //       </TooltipContent>
        //     </Tooltip>
        //   </TooltipProvider> */}
        //   <p>{row.getValue("nombre").toUpperCase()}</p>
        // </div>
      )
    }
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          {getChevronIcon(column)}
        </Button>
      )
    },
  },
  // {
  //   accessorKey: "roles",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //         Roles
  //         {getChevronIcon(column)}
  //       </Button>
  //     )
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <TableItemDropdown row={row} nombreTabla="usuarios"/>
      )
    },
  },
]