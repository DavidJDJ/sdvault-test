export class TipoDocumento {
    public Id: number;
    public Title: string;
    public Consecutivo: number;
    public RolId?: number;
    public RolDescripcion?: string;
    public TipoTramiteId?: number;
    public TipoTramiteDescripcion?: string;
    public Expira:boolean;
    public Confidencial: boolean;

    constructor(){
        this.Id = 0;
        this.Title = "";
        this.Consecutivo = 0;
        this.RolId = 0;
        this.RolDescripcion = "";
        this.TipoTramiteId = 0;
        this.TipoTramiteDescripcion = "";
        this.Expira = false;
        this.Confidencial = false;
    }
}