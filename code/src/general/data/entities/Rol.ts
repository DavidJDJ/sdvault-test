export class Rol {
    public Id: number;
    public Title: string;
    public SeguimientoSolicitudesResguardo: boolean;
    public SolicitarPrestamoDocumentos: boolean;

    constructor(){
        this.Id = 0;
        this.Title = "";
        this.SeguimientoSolicitudesResguardo = false;
        this.SolicitarPrestamoDocumentos = false;
    }
}