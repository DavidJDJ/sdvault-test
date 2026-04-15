import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { INotificacionesService } from "../interfaces/INotificacionesService";
import { Notificacion, TagNotificacion } from "../../data/entities";
import { AssignFrom } from "@pnp/core";
import { sitioDatosMaestros } from "../entities/Constantes";

import {
    TiposNotificacion,
    listaNotificaciones,
    listaPlantillaNotificaciones

} from "../entities/Constantes";

export class NotificacionesService implements INotificacionesService {
    private _sp: SPFI;
    private _spDM: SPFI;

    constructor(context?: WebPartContext) {
        const urlTenant = context.pageContext.web.absoluteUrl.split("sites")[0];
        this._sp = spfi().using(SPFx(context as any));
        this._spDM = spfi(`${urlTenant}/sites/${sitioDatosMaestros}`).using(
            AssignFrom(this._sp.web)
          );
    }

    public enviarNotificacion(destinatario: string, tipoNotificacion: TiposNotificacion, tagsCorreo: TagNotificacion[]): Promise<boolean> {
        return new Promise(resolve => {
            this.ObtenerPlantillaNotificacion(tipoNotificacion).then((plantilla) => {
                if (plantilla !== null) {
                    plantilla.CuerpoCorreo = this.reemplazarEtiquetas(plantilla.CuerpoCorreo, tagsCorreo);
                    plantilla.AsuntoCorreo = this.reemplazarEtiquetas(plantilla.AsuntoCorreo, tagsCorreo);
                    if(destinatario !== ""){
                        this.insertarNotificacion(plantilla, destinatario).then((result) => {
                            resolve(result);
                        }).catch((error)=>{
                            console.log("Error al mandar insertar notificación en lista Notificaciones", error);
                        });
                    }
                    else
                        console.log("No se encontro destinatario");
                } else {
                    console.log("Error no se encontro plantilla para el tipo de notificacion");
                    resolve(false);
                }
            }).catch(error => {
                console.log("Error enviarNotificacion", error);
                resolve(null);
            });
        });
    }

    private insertarNotificacion(notificacionData: Notificacion, destinatario: string): Promise<boolean> {
        return new Promise(resolve => {
            this._spDM.web.lists.getByTitle(listaNotificaciones).items
                .add({
                    AsuntoCorreo: notificacionData.AsuntoCorreo,
                    CuerpoCorreo: notificacionData.CuerpoCorreo,
                    Destinatario: destinatario
                })
                .then(() => {
                    resolve(true);
                })
                .catch(error => {
                    console.log("Error insertarNotificacion", error);
                    resolve(false);
                });
        });
    }

    private ObtenerPlantillaNotificacion(tipoNotificacion: TiposNotificacion): Promise<Notificacion> {
        return new Promise(resolve => {
            this._sp.web.lists.getByTitle(listaPlantillaNotificaciones).items
                .filter(`TipoNotificacionId eq '${tipoNotificacion}'`)
                .select("AsuntoCorreo", "CuerpoCorreo").top(1)().then(plantillas => {
                    let notificacionData: Notificacion = null;
                    if (plantillas.length > 0) {
                        notificacionData = {
                            AsuntoCorreo: plantillas[0].AsuntoCorreo,
                            CuerpoCorreo: plantillas[0].CuerpoCorreo
                        };
                    }
                    resolve(notificacionData);
                }).catch(error => {
                    console.log("Error ObtenerPlantillaNotificacion", error);
                    resolve(null);
                });
        });
    }

    private reemplazarEtiquetas(cuerpoCorreo: string, etiquetas: TagNotificacion[]):string {
        etiquetas.forEach(etiqueta => {
            cuerpoCorreo = cuerpoCorreo.replace(etiqueta.Key, etiqueta.Value);
        });
        return cuerpoCorreo;
    }
}
