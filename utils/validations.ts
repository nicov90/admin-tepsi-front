import * as Yup from "yup";
import { z } from "zod";

export const isValidEmail = (email: string): boolean => {
  const match = String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

  return !!match;
};

export const isEmail = (email: string): string | undefined => {
  return isValidEmail(email) ? undefined : "El correo no parece ser válido";
};

export const userSchema = Yup.object({
  nombre: Yup.string().required("Requerido").matches(/^.{3,}\s.{3,}$/),
  password: Yup.string().min(4, "La contraseña debe tener al menos 4 caracteres").max(16, "La contraseña debe tener menos de 16 caracteres"),
  email: Yup.string().required("Requerido").email("Debe ser un correo válido"),
  roles: Yup.array().min(1, "Requerido").required("Requerido"),
})

export const NuevaCuentaFormSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre es requerido' }).regex(/^\S+\s+\S+$/, { message: 'Debe escribir nombre y apellido' }),
  email: z.string().email({ message: 'Ingrese un email válido' }).refine(email => email.endsWith('@tepsi.com.ar'), {
    message: 'El email debe ser de dominio tepsi.com.ar'
  }),
  password: z.string().optional(),
  roles: z.array(z.string()).min(1, { message: 'Debe seleccionar al menos un rol' }),
  mostrarInputPassword: z.boolean(), // Añadir este campo al esquema
}).superRefine((data, ctx) => {
  if (data.mostrarInputPassword && (!data.password || data.password.length < 4)) {
    ctx.addIssue({
      code: "custom",
      message: "La contraseña debe tener al menos 4 caracteres",
      path: ["password"], // Indica en qué campo ocurrió el error
    });
  }
});