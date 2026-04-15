export class TipoDocumentoRol {
    public Id: number;
    public TipoDocumentoId: number;
    public TipoDocumentoConsecutivo: number;
    public RolId: number;
    public RolDescripcion: string;

    constructor(){
        this.Id = 0;
        this.TipoDocumentoId = 0;
        this.TipoDocumentoConsecutivo = 0;
        this.RolId = 0;
        this.RolDescripcion = "";
    }
}