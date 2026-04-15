export class Sucursal {
    public Id: number;
    public Title: string;
    public Consecutivo: string;
    public CiudadId: number;
    public CiudadDescripcion: string;
    public EstadoId?: number;
    public EstadoDescripcion?: string;
    public FormatoId: number;
    public FormatoDescripcion: string;

    constructor(){
        this.Id = 0;
        this.Title = "";
        this.Consecutivo = "";
        this.CiudadId = 0;
        this.CiudadDescripcion = "";
        this.EstadoId = 0;
        this.EstadoDescripcion = "";
        this.FormatoId = 0;
        this.FormatoDescripcion = "";
    }
}