import { Rol } from "./Rol";

export class Usuario {
    public Id: number;
    public Nombre: string;
    public Email?: string;
    public Grupos?: string[];
    public Rol?:Rol;
    public SucursalId?: number;
    public SucursalNombre?: string;
    public DireccionArea? : Usuario;

    constructor(){
        this.Id = 0;
        this.Nombre = '';
        this.Email = '';
        this.Grupos = [];
        this.Rol = new Rol();
        this.SucursalId = 0;
        this.SucursalNombre = '';
        this.DireccionArea = { Id: 0, Nombre:"", Email: "" };
    }
}