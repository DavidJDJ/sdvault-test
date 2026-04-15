import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IGeneralService } from "../../../general/data/interfaces/IGeneralService";
import { ISolicitudesBovedaService } from "../../../general/data/interfaces/ISolicitudesBovedaService";

export interface IDashboardSolicitudesProps {
  description: string;
  context: WebPartContext;
  spGeneralService: IGeneralService;
  spServicioSolicitudBoveda: ISolicitudesBovedaService;
}