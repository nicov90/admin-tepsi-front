import { getPersonalByEmail } from "@/database/dbPersonal";
import { IPersonal } from "@/interfaces/personal";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { NuevaCuentaFormSchemaRefined } from "./validations";

export const setearNombre = async(email: string, form: UseFormReturn<z.infer<typeof NuevaCuentaFormSchemaRefined>>) => {
    const persona: IPersonal = await getPersonalByEmail(email);
    if(persona){
      form.setValue('nombre', persona.nombre);
      form.setValue('apellido', persona.apellido);
    }
  }