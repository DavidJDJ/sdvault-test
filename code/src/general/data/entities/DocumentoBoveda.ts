import { addDays } from "../../helpers/HelperGeneral";
export class DocumentoBoveda {
    public Id: number;
    public FileName: string;
    public Url: string;
    public FechaVencimiento?: string;
    public UltimaVersion: boolean;
    public SucursalId: number;
    public SucursalDescripcion: string;
    public SucursalConsecutivo: number;
    public TipoDocumentoId: number;
    public TipoDocumentoDescripcion: string;
    public TipoDocumentoConsecutivo: number;
    public CondicionDocumentoId: number;
    public CondicionDocumentoDescripcion: string;
    public RevisionDigital : boolean;
    public RevisionFisico: boolean;
    public EstatusRevisionId: number;
    public EstatusRevisionDescripcion: string;
    public DocumentoFisicoPrestado: boolean;
    public DocumentoFisicoPrestadoAId?: number;
    public DocumentoFisicoPrestadoATitle?: string;
    public DocumentoFisicoPrestadoAEmail?: string;
    public SolicitudId: number
  
    constructor() {
      this.Id = 0;
      this.FileName = "";
      this.Url = "";
      this.FechaVencimiento = addDays(1, new Date()).toISOString();
      this.UltimaVersion = false;
      this.SucursalId = 0;
      this.SucursalDescripcion = "";
      this.SucursalConsecutivo = 0;
      this.TipoDocumentoId = 0;
      this.TipoDocumentoDescripcion = "";
      this.TipoDocumentoConsecutivo = 0;
      this.CondicionDocumentoId = 0;
      this.CondicionDocumentoDescripcion = "";
      this.RevisionDigital = false;
      this.RevisionFisico = false;
      this.EstatusRevisionId = 0;
      this.EstatusRevisionDescripcion= "";
      this.DocumentoFisicoPrestado = false;
      this.DocumentoFisicoPrestadoAId = 0;
      this.DocumentoFisicoPrestadoATitle = "";
      this.DocumentoFisicoPrestadoAEmail = "";
      this.SolicitudId = 0;
    }
  }