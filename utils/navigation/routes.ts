import { RolesListaNombres } from "@/interfaces/roles";

const getRoutes = (rolesUsuarioActual?: RolesListaNombres[]) => [
  {
    href: `/inicio`,
    label: 'Inicio',
    hidden: false,
  },
  {
    href: `/roles`,
    label: 'Roles',
    hidden: false,
  },
];

export default getRoutes;