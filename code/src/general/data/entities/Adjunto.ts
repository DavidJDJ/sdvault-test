export class Adjunto {
    public id: number;
    public url: string;
    public nombre: string;
    public fecha: Date;
    public solicitudId: number;
    public usuarioCreacion?: string;
  
    constructor() {
      this.id = 0;
      this.url = '';
      this.nombre = '';
      this.fecha = new Date();
      this.solicitudId = 0;
      this.usuarioCreacion="";
    }
  }