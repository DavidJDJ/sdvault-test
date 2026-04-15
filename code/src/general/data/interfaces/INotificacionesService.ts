import { TiposNotificacion, TagNotificacion } from "../entities";

export interface INotificacionesService {
    //Crea un registro en la lista de notificaciones y procesa el vuerpo del correo y tags indicados
    enviarNotificacion(destinatario:string, tipoNotificacion: TiposNotificacion, tagsNotificacion: TagNotificacion[]):Promise<boolean>;
}