export interface IPersonal{
  IdPersonal: number, 
  Legajo: string, 
  Nombre: string, 
  Apellido: string,
  Sector: string,
  MailEmpresa: string,
  Documento: string,
  Empresa: IEmpresa
}

interface IEmpresa {
  NombreEmpresa: string
  Codigo: string
  RazonSocial: string
  Cuit: string
  Domicilio: string
  Localidad: string
  CP: string
  Provincia: string
}