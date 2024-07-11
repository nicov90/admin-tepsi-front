import { RendicionesFirmas } from "@prisma/client";

interface RendicionPersonal {
  Nombre: string;
  Apellido: string;
  NombreCompleto: string;
}

export interface Rendicion {
  IdRendicion: string;
  Usuario: string;
  Estado: string;
  MotivoRechazo: string;
  Proyecto: string;
  FechaCarga: string;
  personal: RendicionPersonal;
  rendicionesTickets: { Importe: number, Detalle: string, Archivo: string }[];
  rendicionesSupervisor: { IdUsuario: string }[];
  rendicionesFirmas: RendicionesFirmas[];
  Importe: number;
  SubEstado: string;
}