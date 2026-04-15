import { FiltroBuscador } from "./FiltroBuscador";
import { SolicitudBoveda } from "./SolicitudBoveda";

export class ResultadoBusquedaSolicitudes {
    public filtros: FiltroBuscador[];
    public Items: SolicitudBoveda[];
    public NextPageToken: string;

    constructor(){
      this.filtros = [];
      this.Items = [];
      this.NextPageToken = "";
    }
}