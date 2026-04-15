export class TiposDocumentoSolicitud {

  public Id: number;
  public SolicitarResguardo: boolean;
  public AplicaResguardo: boolean;
  public TipoDocumentoId: number;
  public TipoDocumentoTitle: string;
  public TipoDocumentoConsecutivo: number;
  public Expira: boolean;
  public DocumentoId?: number;
  public NombreDocumento?: string;
  public Url?: string;
  public FechaVencimiento?: string;
  public UltimaVersion?: boolean;
  public SucursalId?: number;
  public SucursalDescripcion?: string;
  public SucursalConsecutivo?: number;
  public CondicionDocumentoId?: number;
  public CondicionDocumentoDescripcion?: string;
  public RevisionDigital?: boolean;
  public RevisionFisico?: boolean;
  public EstatusRevisionId?: number;
  public EstatusRevisionDescripcion?: string;
  public DocumentoFisicoPrestado?: boolean;
  public HistorialComentarios?: string;
  public ComentariosResponsable?: string;
  public ComentariosAdministradorBoveda?: string;
  public SolicitarDocumentoOriginal: boolean;
  public FechaDevolucionDocumentoOriginal?: string;
  public DiasPrestamo?: number;
  public Renovar?: boolean;
  public EdicionComentariosResponsable?: boolean;
  public EdicionComentariosBoveda?: boolean;
  public Confidencial: boolean;

  constructor() {

    this.Id = 0;
    this.SolicitarResguardo = false;
    this.AplicaResguardo = true;
    this.TipoDocumentoId = 0;
    this.TipoDocumentoTitle = "";
    this.TipoDocumentoConsecutivo = 0;
    this.Expira = false;
    this.DocumentoId = 0;
    this.NombreDocumento = "";
    this.Url = "";
    this.FechaVencimiento = null;
    this.UltimaVersion = false;
    this.SucursalId = 0;
    this.SucursalDescripcion = "";
    this.SucursalConsecutivo = 0;
    this.CondicionDocumentoId = 0;
    this.CondicionDocumentoDescripcion = "";
    this.RevisionDigital = false;
    this.RevisionFisico = false;
    this.EstatusRevisionId = 0;
    this.EstatusRevisionDescripcion = "";
    this.DocumentoFisicoPrestado = false;
    this.HistorialComentarios = "";
    this.ComentariosResponsable = "";
    this.ComentariosAdministradorBoveda = "";
    this.SolicitarDocumentoOriginal = false;
    this.FechaDevolucionDocumentoOriginal = null;
    this.DiasPrestamo = 0;
    this.Renovar = true;
    this.EdicionComentariosResponsable = false;
    this.EdicionComentariosBoveda = false;
    this.Confidencial = false;
  }
}
