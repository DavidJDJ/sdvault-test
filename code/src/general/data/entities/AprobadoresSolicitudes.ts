export class AprobadoresSolicitudes {
  public Id: number;
  public RolResponsableId: number;
  public RolResponsableTitle: string;
  public AutorizadorAreaId: number;
  public AutorizadorAreaTitle: string;
  public AutorizadorAreaEmail: string;
  public AutorizadorDireccionBovedaId: number;
  public AutorizadorDireccionBovedaTitle: string;
  public AutorizadorDireccionBovedaEmail: string;
  public AutorizadorAdministradorBovedaId: number;
  public AutorizadorAdministradorBovedaTitle: string;
  public AutorizadorAdministradorBovedaEmail: string;

  constructor() {
    this.Id = 0;
    this.RolResponsableId = 0;
    this.RolResponsableTitle = "";
    this.AutorizadorAreaId = 0;
    this.AutorizadorAreaTitle = "";
    this.AutorizadorAreaEmail = "";
    this.AutorizadorDireccionBovedaId = 0;
    this.AutorizadorDireccionBovedaTitle = "";
    this.AutorizadorDireccionBovedaEmail = "";
    this.AutorizadorAdministradorBovedaId = 0;
    this.AutorizadorAdministradorBovedaTitle = "";
    this.AutorizadorAdministradorBovedaEmail = "";
  }
}
