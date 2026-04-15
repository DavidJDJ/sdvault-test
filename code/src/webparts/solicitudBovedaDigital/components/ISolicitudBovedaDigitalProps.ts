import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IGeneralService } from "../../../general/data/interfaces/IGeneralService";
import { INotificacionesService } from "../../../general/data/interfaces/INotificacionesService";
import { ISolicitudesBovedaService } from "../../../general/data/interfaces/ISolicitudesBovedaService";
export interface ISolicitudBovedaDigitalProps {
  description: string;
  context: WebPartContext;
  spGeneralService: IGeneralService;
  spSolicitudBovedaService: ISolicitudesBovedaService;
  spNotificacionesService: INotificacionesService;
}
