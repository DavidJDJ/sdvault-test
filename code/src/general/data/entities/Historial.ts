export class Historial {
    public Id: number;
    public SolicitudId: number;
    public FolioSolicitud: string;
    public Estatus: string;
    public TipoMovimiento: string;
    public FechaEntrada: string;
    public FechaSalida: string;
    public Rol: string;
    public Comentarios: string;
    public Responsable: string;
  
    constructor() {
      this.Id = 0;
      this.SolicitudId = 0;
      this.FolioSolicitud = '';
      this.Estatus = '';
      this.TipoMovimiento = '';
      this.FechaEntrada = '';
      this.FechaSalida = '';
      this.Rol = '';
      this.Comentarios = '';
      this.Responsable = ''
    }
  }