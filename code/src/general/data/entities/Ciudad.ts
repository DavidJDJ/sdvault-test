export class Ciudad {
    public Id: number;
    public Title: string;
    public EstadoId: number;
    public EstadoDescripcion: string;

    constructor(){
        this.Id = 0;
        this.Title = "";
        this.EstadoId = 0;
        this.EstadoDescripcion = "";
    }
}