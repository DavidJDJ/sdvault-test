import { ISiteUserInfo } from "@pnp/sp/site-users/types";
import { Usuario } from "../entities/Usuario";

export interface IGeneralService {
    //Obtiene la información del usuario actual
    obtenerDatosUsuario(): Promise<Usuario>;
    //Obtiene el detalle los usuarios del grupo especificado
    obtenerUsuariosGrupoSP(grupo: string): Promise<ISiteUserInfo[]>;
    //Obtiene registros de lista ConfiguracionRecurrencia
    obtenerConfiguracionRecurrencia():Promise<any>;
}