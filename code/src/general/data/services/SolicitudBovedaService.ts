import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ISolicitudesBovedaService } from "../interfaces/ISolicitudesBovedaService";
import {
  listaControlContadores,
  ResultadoBusquedaSolicitudes,
  SolicitudBoveda,
  Sucursal,
  FiltroBuscador,
  listaSolicitudes,
  listaSucursales,
  listaHistorialSolicitudes,
  listaCiudades,
  sitioDatosMaestros,
  Historial,
  comparadorBoleano,
  listaTiposSolicitud,
  ContadorTipoSolicitud,
  bibliotecaBoveda,
  Rol,
  TipoDocumento,
  listaRoles,
  listaTiposDocumento,
  TiposSolicitud,
  listaTiposDocumentoSolicitudes,
  listaTiposDocumentoRol,
  TipoDocumentoRol,
  DocumentoBoveda,
  TiposDocumentoSolicitud,
  AttachmentData,
  listaCondicionesDocumento,
  listaControlEliminacionDocumentos,
  listaEstatusRevisionDocumento,
  listaFlujoEstatusSolicitudes,
  listaAprobadores,
  EstatusSolicitudes,
  listaAsuetos,
} from "../entities";
import { CamlQueryGenerator } from "../../helpers/HelperGeneral";
import { IDropdownOption } from "@fluentui/react";
import { AssignFrom } from "@pnp/core";
import * as moment from "moment";
import { AprobadoresSolicitudes } from "../entities/AprobadoresSolicitudes";

export class SolicitudBovedaService implements ISolicitudesBovedaService {
  private _sp: SPFI;
  private _spDM: SPFI;

  constructor(context?: WebPartContext) {
    const urlTenant = context.pageContext.web.absoluteUrl.split("sites")[0];
    this._sp = spfi().using(SPFx(context as any));
    this._spDM = spfi(`${urlTenant}/sites/${sitioDatosMaestros}`).using(
      AssignFrom(this._sp.web)
    );
  }

  public buscarSolicitudes(
    filtros: FiltroBuscador[],
    nextPageToken?: string
  ): Promise<ResultadoBusquedaSolicitudes> {
    const result = new ResultadoBusquedaSolicitudes();
    const resultadoData: SolicitudBoveda[] = [];
    const viewColumns = [
      "ID",
      "Title",
      "TipoSolicitudld",
      "TipoSolicitudDescripcion",
      "RolSolicitanteld",
      "RolSolicitanteDescripcion",
      "Responsable",
      "RolResponsableld",
      "RolResponsableDescripcion",
      "FechaCompromiso",
      "EstatusSolicitudld",
      "EstatusSolicitudDescripcion",
      "SucursalId",
      "SucursalDescripcion",
      "Comentarios",
      "Created",
    ];
    const camlQuery = CamlQueryGenerator(viewColumns, filtros);
    return new Promise<ResultadoBusquedaSolicitudes>(
      (resolve, reject): void => {
        this.ObtenerPaginados(camlQuery, nextPageToken)
          .then((pagedResponse) => {
            if (pagedResponse.Row && pagedResponse.Row.length) {
              (pagedResponse.Row as any[]).forEach((item) => {
                resultadoData.push({
                  Id: Number(item.ID),
                  Folio: item.Title,
                  TipoSolicitudId: item.TipoSolicitudId,
                  TipoSolicitudDescripcion: item.TipoSolicitudDescripcion,
                  Creado: moment(item["Created."], moment.ISO_8601).format("DD/MM/YYYY hh:mm a"),
                  NumeroSucursal: item.NumeroSucursal,
                  SucursalId: item.SucursalId,
                  SucursalDescripcion: item.SucursalDescripcion,
                  CiudadId: item.CiudadId,
                  CiudadDescripcion: item.CiudadDescripcion,
                  EstadoId: item.EstadoId,
                  EstadoDescripcion: item.EstadoDescripcion,
                  FormatoSucursalId: item.FormatoSucursalId,
                  FormatoSucursalDescripcion: item.FormatoSucursalDescripcion,
                  RolSolicitante: item.RolSolicitante,
                  RolSolicitanteDescripcion: item.RolSolicitanteDescripcion,
                  Responsable:
                    item.Responsable === "" ? "" : item.Responsable[0].title,
                  RolResponsableId: item.RolResponsableId,
                  RolResponsableDescripcion: item.RolResponsableDescripcion,
                  FechaCompromiso: item["FechaCompromiso."] === "" ? "" : moment(item["FechaCompromiso."], moment.ISO_8601).format("DD/MM/YYYY hh:mm a") ,
                  EstatusId: item.EstatusSolicitudId,
                  EstatusDescripcion: item.EstatusSolicitudDescripcion,
                  Comentarios: item.Comentarios,
                } as unknown as SolicitudBoveda);
              });
            }
            nextPageToken =
              pagedResponse.NextHref && pagedResponse.NextHref.length
                ? pagedResponse.NextHref.split("?")[1]
                : null;
            result.Items = resultadoData;
            result.NextPageToken = nextPageToken;
            result.filtros = filtros;
            resolve(result);
          })
          .catch((error) => {
            console.log(
              "Error al obtener paginados en funcion buscarSolicitudes",
              error
            );
          });
      }
    );
  }

  private ObtenerPaginados(
    camlQuery: string,
    pageToken?: string
  ): Promise<any> {
    return this._sp.web.lists
      .getByTitle(listaSolicitudes)
      .renderListDataAsStream({
        ViewXml: camlQuery,
        Paging: pageToken,
      });
  }

  public obtenerTiposSolicitud(): Promise<IDropdownOption[]> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaTiposSolicitud)
        .items.select("ID", "Title")
        .filter(`Activo eq ${comparadorBoleano.verdadero}`)
        .top(5000)()
        .then((items: any) => {
          const resultado = items.map((item: any) => {
            const tipos: IDropdownOption = {
              key: item.ID,
              text: item.Title,
            };
            return tipos;
          });
          resolve(resultado);
        })
        .catch((error: any) => {
          console.log("Error: obtenerTiposSolicitud ", error);
          resolve(null);
        });
    });
  }

  public obtenerHistorialSolicitud(solicitudId: number): Promise<Historial[]> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaHistorialSolicitudes)
        .items.select(
          "ID",
          "SolicitudId",
          "FolioSolicitud",
          "Estatus",
          "TipoMovimiento",
          "FechaEntrada",
          "FechaSalida",
          "Rol",
          "Comentarios",
          "Responsable"
        )
        .filter(`SolicitudId eq ${solicitudId}`)
        .orderBy("ID", false)
        .top(5000)()
        .then((items) => {
          const historialArray = items.map((item) => {
            console.log(item);
            const historial: Historial = {
              Id: item.ID,
              SolicitudId: item.SolicitudId,
              FolioSolicitud: item.FolioSolicitud,
              Estatus: item.Estatus,
              TipoMovimiento: item.TipoMovimiento,
              FechaEntrada:
                item.FechaEntrada === null
                  ? new Date().toISOString()
                  : item.FechaEntrada,
              FechaSalida:
                item.FechaSalida === null
                  ? new Date().toISOString()
                  : item.FechaSalida,
              Rol: item.Rol,
              Comentarios: item.Comentarios,
              Responsable: item.Responsable,
            };
            return historial;
          });
          resolve(historialArray);
        })
        .catch((error) => {
          console.log("Error obtenerHistorialSolicitud", error);
          resolve(null);
        });
    });
  }
  public obtenerContador(anio: number): Promise<ContadorTipoSolicitud> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaControlContadores)
        .items.select("ID", "Anio", "UltimoConsecutivoUtilizado")
        .filter(`Anio eq ${anio}`)
        .top(1)()
        .then((contadores) => {
          let contadorResult: ContadorTipoSolicitud = null;
          if (contadores.length > 0) {
            contadorResult = {
              IdContadorFolio: contadores[0].ID,
              ContadorFolios: contadores[0].UltimoConsecutivoUtilizado + 1,
            };
          }
          resolve(contadorResult);
        })
        .catch((error) => {
          console.log("Error obtenerContador", error);
          resolve(null);
        });
    });
  }

  public obtenerDetalleSolicitud(
    solicitudId: number
  ): Promise<SolicitudBoveda> {
    return new Promise<SolicitudBoveda>((resolve, reject): void => {
      this._sp.web.lists
        .getByTitle(listaSolicitudes)
        .items.getById(solicitudId)
        .select(
          "ID",
          "Title",
          "TipoSolicitudId",
          "TipoSolicitudDescripcion",
          "RolSolicitanteId",
          "RolSolicitanteDescripcion",
          "Responsable/Id",
          "Responsable/Title",
          "Responsable/EMail",
          "RolResponsableId",
          "RolResponsableDescripcion",
          "FechaCompromiso",
          "EstatusSolicitudId",
          "EstatusSolicitudDescripcion",
          "NumeroSucursal",
          "SucursalId",
          "SucursalDescripcion",
          "EstadoId",
          "EstadoDescripcion",
          "CiudadId",
          "CiudadDescripcion",
          "FormatoId",
          "FormatoDescripcion",
          "Comentarios",
          "Author/Id",
          "Author/Title",
          "Author/EMail",
          "Created",
          "Asignado/Id",
          "Asignado/Title",
          "Asignado/EMail",
          "HistorialComentariosArea",
          "HistorialComentariosDireccion"
        )
        .expand("Responsable", "Author", "Asignado")()
        .then((item) => {
          const solicitud: SolicitudBoveda = new SolicitudBoveda();
          solicitud.Id = item.Id;
          solicitud.Folio = item.Title;
          solicitud.TipoSolicitudId = item.TipoSolicitudId;
          solicitud.TipoSolicitudDescripcion = item.TipoSolicitudDescripcion;
          solicitud.RolSolicitanteId = item.RolSolicitanteId;
          solicitud.RolSolicitanteDescripcion = item.RolSolicitanteDescripcion;
          solicitud.ResponsableId =
            typeof item.Responsable !== "undefined"
              ? item.Responsable.Id
              : null;
          solicitud.ResponsableTitle =
            typeof item.Responsable !== "undefined"
              ? item.Responsable.Title
              : null;
          solicitud.ResponsableEmail =
            typeof item.Responsable !== "undefined"
              ? item.Responsable.EMail
              : null;
          solicitud.RolResponsableId = item.RolResponsableId;
          solicitud.RolResponsableDescripcion = item.RolResponsableDescripcion;
          solicitud.FechaCompromiso =
            item.FechaCompromiso === null
              ? new Date().toISOString()
              : item.FechaCompromiso;
          solicitud.EstatusId = item.EstatusSolicitudId;
          solicitud.EstatusDescripcion = item.EstatusSolicitudDescripcion;
          solicitud.NumeroSucursal = item.NumeroSucursal;
          solicitud.SucursalId = item.SucursalId;
          solicitud.SucursalDescripcion = item.SucursalDescripcion;
          solicitud.EstadoId = item.EstadoId;
          solicitud.EstadoDescripcion = item.EstadoDescripcion;
          solicitud.CiudadId = item.CiudadId;
          solicitud.CiudadDescripcion = item.CiudadDescripcion;
          solicitud.FormatoSucursalId = item.FormatoId;
          solicitud.FormatoSucursalDescripcion = item.FormatoDescripcion;
          solicitud.Comentarios = item.Comentarios;
          solicitud.SolicitanteId = item.Author.Id;
          solicitud.SolicitanteTitle = item.Author.Title;
          solicitud.SolicitanteEmail = item.Author.EMail;
          solicitud.FechaCreacion = item.Created;
          solicitud.AsignadoId =
            typeof item.Asignado !== "undefined"
              ? item.Asignado.Id
              : null;
          solicitud.AsignadoTitle =
            typeof item.Asignado !== "undefined"
              ? item.Asignado.Title
              : null;
          solicitud.AsignadoEmail =
            typeof item.Asignado !== "undefined"
              ? item.Asignado.EMail
              : null;
          solicitud.HistorialComentariosArea = item.HistorialComentariosArea;
          solicitud.HistorialComentariosDireccion = item.HistorialComentariosDireccion;

          const consultasAdicionales = [];

          consultasAdicionales.push(
            this.obtenerTiposDocumentoSolicitud(solicitud)
          );
          if (solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id ||
            solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
            const filtroDocsSolicitud = `SolicitudId eq ${solicitud.Id} and DocumentoCargadoAplicativo eq ${comparadorBoleano.verdadero}`;
            consultasAdicionales.push(
              this.obtenerDocumentosPorFiltro(filtroDocsSolicitud)
            );
          } else if (solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id) {
            let filtro = "";
            if (solicitud.EstatusId === EstatusSolicitudes.Aprobada.id)
              filtro = `TipoDocumentoConsecutivo ne null and UltimaVersion eq ${comparadorBoleano.verdadero} and SucursalId eq ${solicitud.SucursalId} and DocumentoFisicoPrestado eq ${comparadorBoleano.verdadero} and DocumentoCargadoAplicativo eq ${comparadorBoleano.verdadero}`;
            else
              filtro = `TipoDocumentoConsecutivo ne null and UltimaVersion eq ${comparadorBoleano.verdadero} and SucursalId eq ${solicitud.SucursalId} and DocumentoFisicoPrestado eq ${comparadorBoleano.falso} and DocumentoCargadoAplicativo eq ${comparadorBoleano.verdadero}`;
            consultasAdicionales.push(
              this.obtenerDocumentosPorFiltro(filtro)
            );
          }

          Promise.all(consultasAdicionales)
            .then((values) => {
              const tiposDocumentoSolicitud: TiposDocumentoSolicitud[] =
                values[0] as TiposDocumentoSolicitud[];
              const adjuntosSolicitud: DocumentoBoveda[] = typeof values[1] !== "undefined" ?
                values[1] as DocumentoBoveda[] : [];

              tiposDocumentoSolicitud.forEach((element) => {
                const adjunto = adjuntosSolicitud.find(
                  (x) =>
                    x.TipoDocumentoConsecutivo ===
                    element.TipoDocumentoConsecutivo
                );

                if (adjunto) {
                  element.DocumentoId = adjunto.Id;
                  element.NombreDocumento = adjunto.FileName;
                  element.Url = adjunto.Url;
                  element.FechaVencimiento = adjunto.FechaVencimiento;
                  element.UltimaVersion = adjunto.UltimaVersion;
                  element.SucursalId = adjunto.SucursalId;
                  element.SucursalDescripcion = adjunto.SucursalDescripcion;
                  element.SucursalConsecutivo = adjunto.SucursalConsecutivo;
                  element.CondicionDocumentoId = adjunto.CondicionDocumentoId;
                  element.CondicionDocumentoDescripcion =
                    adjunto.CondicionDocumentoDescripcion;
                  element.RevisionDigital = adjunto.RevisionDigital;
                  element.RevisionFisico = adjunto.RevisionFisico;
                  element.DocumentoFisicoPrestado =
                    adjunto.DocumentoFisicoPrestado;
                } else {
                  element.DocumentoId = 0;
                  element.NombreDocumento = "";
                  element.Url = "";
                  element.FechaVencimiento = null;
                  element.UltimaVersion = false;
                  element.SucursalId = 0;
                  element.SucursalDescripcion = "";
                  element.SucursalConsecutivo = 0;
                  element.CondicionDocumentoId = 0;
                  element.CondicionDocumentoDescripcion = "";
                  element.RevisionDigital = false;
                  element.RevisionFisico = false;
                  element.DocumentoFisicoPrestado = false;
                }
              });
              solicitud.Archivos = new AttachmentData();
              solicitud.Archivos.Files = adjuntosSolicitud;
              solicitud.TiposDocumentoSolicitud = [...tiposDocumentoSolicitud];
              resolve(solicitud);
            })
            .catch((error) => {
              console.log(
                "Error al obtener los tipos de documento relacionados a una solicitud. ",
                error
              );
            });
        })
        .catch((error) => {
          console.log(
            `Error obteniendo detalle de solicitud, ${solicitudId}`,
            error
          );
          resolve(null);
        });
    });
  }
  public obtenerSucursales(): Promise<any[]> {
    return new Promise((resolve) => {
      this._spDM.web.lists
        .getByTitle(listaSucursales)
        .items.select(
          "ID",
          "Title",
          "Consecutivo",
          "Ciudad/Id",
          "Ciudad/Title",
          "Formato/Title",
          "Formato/Id"
        )
        .expand("Ciudad", "Formato")
        .orderBy("Consecutivo", true)
        .filter(`Activo eq ${comparadorBoleano.verdadero}`)
        .top(5000)()
        .then((items) => {
          const Array = items.map((item) => {
            const sucursal = new Sucursal();
            sucursal.Id = item.ID;
            sucursal.Title = item.Title;
            sucursal.Consecutivo = item.Consecutivo as string;
            sucursal.CiudadId = item.Ciudad.Id;
            sucursal.CiudadDescripcion = item.Ciudad.Title;
            sucursal.FormatoId = item.Formato.Id;
            sucursal.FormatoDescripcion = item.Formato.Title;
            sucursal.EstadoId = 0;
            sucursal.EstadoDescripcion = "";

            return sucursal;
          });
          resolve(Array);
        })
        .catch((error) => {
          console.log("Error obtenerListadoSucursales", error);
          resolve(null);
        });
    });
  }

  public obtenerRoles(): Promise<any[]> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaRoles)
        .items.select(
          "ID",
          "Title",
          "SeguimientoSolicitudesResguardo",
          "SolicitarPrestamoDocumentos",
          "Activo"
        )
        .orderBy("Title", true)
        .filter(`Activo eq ${comparadorBoleano.verdadero}`)
        .top(5000)()
        .then((items) => {
          const Array = items.map((item) => {
            const rol = new Rol();
            rol.Id = item.ID;
            rol.Title = item.Title;
            rol.SeguimientoSolicitudesResguardo =
              item.SeguimientoSolicitudesResguardo;
            rol.SolicitarPrestamoDocumentos = item.SolicitarPrestamoDocumentos ? true : false;
            return rol;
          });
          resolve(Array);
        })
        .catch((error) => {
          console.log("Error obtenerRoles", error);
          resolve(null);
        });
    });
  }

  public obtenerTiposDocumento(): Promise<TipoDocumento[]> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaTiposDocumento)
        .items.select(
          "ID",
          "Title",
          "Consecutivo",
          "TipoTramite/Id",
          "TipoTramite/Title",
          "Expira",
          "Confidencial"
        )
        .expand("TipoTramite")
        .orderBy("Consecutivo", true)
        .filter(`Activo eq ${comparadorBoleano.verdadero}`)
        .top(5000)()
        .then((items) => {
          const Array: TipoDocumento[] = items.map((item) => {
            const tipoDocumento: TipoDocumento = {
              Id: item.ID,
              Title: item.Title,
              Consecutivo: item.Consecutivo,
              TipoTramiteId: item.TipoTramite ? item.TipoTramite.Id : null,
              TipoTramiteDescripcion: item.TipoTramite ? item.TipoTramite.Title : "",
              Expira: item.Expira,
              Confidencial: item.Confidencial
            };
            return tipoDocumento;
          });
          resolve(Array);
        })
        .catch((error) => {
          console.log("Error obtenerTiposDocumentoBoveda", error);
          resolve(null);
        });
    });
  }

  public obtenerTiposDocumentoRol(): Promise<TipoDocumentoRol[]> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaTiposDocumentoRol)
        .items.select(
          "ID",
          "TipoDocumento/Id",
          "TipoDocumento/Consecutivo",
          "Rol/Id",
          "Rol/Title"
        )
        .expand("TipoDocumento", "Rol")
        .orderBy("TipoDocumento/Consecutivo", true)
        .filter(`Activo eq ${comparadorBoleano.verdadero}`)
        .top(5000)()
        .then((items) => {
          const Array: TipoDocumentoRol[] = items.map((item) => {
            const tipoDocumentoRol: TipoDocumentoRol = {
              Id: item.ID,
              TipoDocumentoId: item.TipoDocumento.Id,
              TipoDocumentoConsecutivo: item.TipoDocumento.Consecutivo,
              RolId: item.Rol.Id,
              RolDescripcion: item.Rol.Title,
            };
            return tipoDocumentoRol;
          });
          resolve(Array);
        })
        .catch((error) => {
          console.log("Error obtenerTiposDocumentoRol", error);
          resolve(null);
        });
    });
  }

  public obtenerCiudades(): Promise<any[]> {
    return new Promise((resolve) => {
      this._spDM.web.lists
        .getByTitle(listaCiudades)
        .items.select("ID", "Title", "Estado/Id", "Estado/Title")
        .expand("Estado")
        .orderBy("Title", true)
        .top(5000)()
        .then((items) => {
          const Array = items.map((item) => {
            const ciudad = {
              Id: item.ID,
              Title: item.Title,
              EstadoId: item.Estado.Id,
              EstadoDescripcion: item.Estado.Title,
            };
            return ciudad;
          });
          resolve(Array);
        })
        .catch((error) => {
          console.log("Error obtenerCiudades", error);
          resolve(null);
        });
    });
  }
  public actualizarContador(contador: ContadorTipoSolicitud): Promise<boolean> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaControlContadores)
        .items.getById(contador.IdContadorFolio)
        .update({
          UltimoConsecutivoUtilizado: contador.ContadorFolios,
        })
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          console.log("Error actualizarContador", error);
          resolve(false);
        });
    });
  }
  public actualizarSolicitudBoveda(solData: SolicitudBoveda): Promise<number> {
    return new Promise<number>((resolve): void => {
      const listaSolicitudesBoveda =
        this._sp.web.lists.getByTitle(listaSolicitudes);
      let spItemUpdateDefinition;
      const nombreCarpetaSucursal: string = `${solData.NumeroSucursal} - ${solData.SucursalDescripcion}`;

      if (
        solData.TipoSolicitudId === TiposSolicitud.Resguardo.id ||
        solData.TipoSolicitudId === TiposSolicitud.Renovacion.id
      ) {
        spItemUpdateDefinition = {
          Title: solData.Folio,
          TipoSolicitudId: solData.TipoSolicitudId,
          TipoSolicitudDescripcion: solData.TipoSolicitudDescripcion,
          RolSolicitanteId: solData.RolSolicitanteId,
          RolSolicitanteDescripcion: solData.RolSolicitanteDescripcion,
          ResponsableId: solData.ResponsableId,
          RolResponsableId: solData.RolResponsableId,
          RolResponsableDescripcion: solData.RolResponsableDescripcion,
          FechaCompromiso: solData.FechaCompromiso
            ? solData.FechaCompromiso
            : null,
          EstatusSolicitudId: solData.EstatusId,
          EstatusSolicitudDescripcion: solData.EstatusDescripcion,
          NumeroSucursal: solData.NumeroSucursal.toString(),
          SucursalId: solData.SucursalId,
          SucursalDescripcion: solData.SucursalDescripcion,
          EstadoId: solData.EstadoId,
          EstadoDescripcion: solData.EstadoDescripcion,
          CiudadId: solData.CiudadId,
          CiudadDescripcion: solData.CiudadDescripcion,
          FormatoId: solData.FormatoSucursalId,
          FormatoDescripcion: solData.FormatoSucursalDescripcion,
          Comentarios: solData.Comentarios
        };
      }
      else if (solData.TipoSolicitudId === TiposSolicitud.Prestamo.id) {
        spItemUpdateDefinition = {
          Title: solData.Folio,
          TipoSolicitudId: solData.TipoSolicitudId,
          TipoSolicitudDescripcion: solData.TipoSolicitudDescripcion,
          RolSolicitanteId: solData.RolSolicitanteId,
          RolSolicitanteDescripcion: solData.RolSolicitanteDescripcion,
          ResponsableId: solData.ResponsableId,
          RolResponsableId: solData.RolResponsableId,
          RolResponsableDescripcion: solData.RolResponsableDescripcion,
          FechaCompromiso: solData.FechaCompromiso
            ? solData.FechaCompromiso
            : null,
          EstatusSolicitudId: solData.EstatusId,
          EstatusSolicitudDescripcion: solData.EstatusDescripcion,
          NumeroSucursal: solData.NumeroSucursal.toString(),
          SucursalId: solData.SucursalId,
          SucursalDescripcion: solData.SucursalDescripcion,
          EstadoId: solData.EstadoId,
          EstadoDescripcion: solData.EstadoDescripcion,
          CiudadId: solData.CiudadId,
          CiudadDescripcion: solData.CiudadDescripcion,
          FormatoId: solData.FormatoSucursalId,
          FormatoDescripcion: solData.FormatoSucursalDescripcion,
          Comentarios: solData.Comentarios,
          AsignadoId: solData.AsignadoId
        };
      }

      if (solData.Id > 0) {
        listaSolicitudesBoveda.items
          .getById(solData.Id)
          .update(spItemUpdateDefinition)
          .then(() => {
            const promises = [];
            promises.push(
              this.actualizarTiposDocumentoSolicitud(
                solData.Id,
                solData.TiposDocumentoSolicitud
              )
            );
            promises.push(this.actualizarAdjuntos(solData));

            Promise.all(promises)
              .then((result) => {
                resolve(solData.Id);
              })
              .catch((error) => {
                console.log(
                  "Error al actualizar tipos de documento solicitud y adjuntos ",
                  error
                );
                resolve(null);
              });
          })
          .catch((error) => {
            console.log("Error al editar la solicitud de Boveda.", error);
            resolve(0);
          });
      } else {
        listaSolicitudesBoveda.items
          .add(spItemUpdateDefinition)
          .then((result) => {
            result
              .item()
              .then((nuevoItem) => {
                solData.Id = nuevoItem.Id;

                const promises: any[] = [];
                promises.push(
                  this.actualizarTiposDocumentoSolicitud(
                    solData.Id,
                    solData.TiposDocumentoSolicitud
                  )
                );
                promises.push(
                  this.crearCarpetaDocumentosSucursal(nombreCarpetaSucursal)
                );

                Promise.all(promises)
                  .then((result) => {
                    resolve(solData.Id);
                  })
                  .catch((error) => {
                    console.log(
                      "Error al crear tipos documento solicitud y carpeta en biblioteca boveda ",
                      error
                    );
                    resolve(0);
                  });
              })
              .catch((error) => {
                console.log("Error al obtener nuevo item generado", error);
              });
          })
          .catch((error) => {
            console.log("Error al crear nueva solicitud boveda", error);
            resolve(0);
          });
      }
    });
  }

  private obtenerTiposDocumentoSolicitud(
    solicitud: SolicitudBoveda
  ): Promise<TiposDocumentoSolicitud[]> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaTiposDocumentoSolicitudes)
        .items.select(
          "ID",
          "TipoDocumento/Id",
          "TipoDocumento/Title",
          "TipoDocumento/Consecutivo",
          "TipoDocumento/ExpiraValorTexto",
          "TipoDocumento/ConfidencialValorTexto",
          "SolicitarResguardo",
          "AplicaResguardo",
          "ComentariosResponsable",
          "ComentariosAdministradorBoveda",
          "HistorialComentarios",
          "SolicitarDocumentoOriginal",
          "FechaDevolucionDocumentoOriginal",
          "EstatusRevisionId",
          "EstatusRevisionDescripcion",
          "DiasPrestamo"
        )
        .expand("TipoDocumento")
        .orderBy("TipoDocumento/Consecutivo", true)
        .filter(`Solicitud eq ${solicitud.Id}`)
        .top(5000)()
        .then((items) => {
          const tiposDocumentoSolicitud: TiposDocumentoSolicitud[] = items.map(
            (item) => {
              const tipoDocumentoSolicitud: TiposDocumentoSolicitud = {
                Id: item.Id,
                SolicitarResguardo: item.SolicitarResguardo,
                AplicaResguardo: item.AplicaResguardo,
                TipoDocumentoId: item.TipoDocumento.Id,
                TipoDocumentoTitle: item.TipoDocumento.Title,
                TipoDocumentoConsecutivo: item.TipoDocumento.Consecutivo,
                Expira:
                  item.TipoDocumento.ExpiraValorTexto === "True" ? true : false,
                ComentariosResponsable: item.ComentariosResponsable,
                ComentariosAdministradorBoveda:
                  item.ComentariosAdministradorBoveda,
                HistorialComentarios: item.HistorialComentarios,
                SolicitarDocumentoOriginal: item.SolicitarDocumentoOriginal,
                FechaDevolucionDocumentoOriginal:
                  item.FechaDevolucionDocumentoOriginal,
                EstatusRevisionId: item.EstatusRevisionId,
                EstatusRevisionDescripcion: item.EstatusRevisionDescripcion,
                DiasPrestamo: item.DiasPrestamo,
                Confidencial: item.TipoDocumento.ConfidencialValorTexto === "True" ? true : false
              };
              return tipoDocumentoSolicitud;
            }
          );
          resolve(tiposDocumentoSolicitud);
        })
        .catch((error) => {
          console.log("Error obtenerTiposDocumentoSolicitud", error);
          resolve(null);
        });
    });
  }
  public insertarHistoricoSolicitud(registro: Historial): Promise<number> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaHistorialSolicitudes)
        .items.add({
          SolicitudId: registro.SolicitudId,
          FolioSolicitud: registro.FolioSolicitud,
          FechaEntrada: registro.FechaEntrada,
          FechaSalida: registro.FechaSalida,
          Responsable: registro.Responsable,
          Estatus: registro.Estatus,
          Rol: registro.Rol,
          TipoMovimiento: registro.TipoMovimiento,
          Comentarios: registro.Comentarios,
        })
        .then((result) => {
          resolve(result.data.ID);
        })
        .catch((error) => {
          console.log("Error insertarHistoricoSolicitud", error);
          resolve(null);
        });
    });
  }

  public actualizarAdjuntos(solData: SolicitudBoveda): Promise<any> {
    return new Promise((resolve) => {
      const promises = [];
      const adjuntosPorSubir: any[] = solData.Archivos.ToUpload;
      const adjuntosPorBorrar: any[] = solData.Archivos.ToDelete;
      const nombreCarpetaSucursal: string = `${solData.NumeroSucursal} - ${solData.SucursalDescripcion}`;
      const folderRelativePath: string = `${bibliotecaBoveda}/${nombreCarpetaSucursal}`;

      if (adjuntosPorSubir.length > 0) {
        const primerAdjunto: any = adjuntosPorSubir[0];

        const elem = {
          TipoDocumentoId: primerAdjunto.TipoDocumentoId,
          TipoDocumentoDescripcion: primerAdjunto.TipoDocumentoDescripcion,
          TipoDocumentoConsecutivo: primerAdjunto.TipoDocumentoConsecutivo,
          SucursalId: primerAdjunto.SucursalId,
          SucursalDescripcion: primerAdjunto.SucursalDescripcion,
          SucursalConsecutivo: primerAdjunto.NumeroSucursal,
          FechaVencimiento: primerAdjunto.FechaVencimiento,
          CondicionDocumentoId: primerAdjunto.CondicionDocumentoId,
          CondicionDocumentoDescripcion:
            primerAdjunto.CondicionDocumentoDescripcion,
          SolicitudId: primerAdjunto.SolicitudId
        };

        for (let i = 0; i < adjuntosPorSubir.length; i++) {
          promises.push(
            this.agregarArchivos(
              bibliotecaBoveda,
              folderRelativePath,
              elem,
              adjuntosPorSubir[i]
            )
          );
        }
      }
      for (let i = 0; i < adjuntosPorBorrar.length; i++) {
        promises.push(
          this.eliminarArchivos(bibliotecaBoveda, adjuntosPorBorrar[i])
        );
      }
      Promise.all(promises)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log("Error actualizando adjuntos solicitud", error);
          resolve(0);
        });
    });
  }

  private agregarArchivos(
    libraryName: string,
    folderRelativePath: string,
    elem: any,
    archivo: File
  ): Promise<any> {
    return new Promise((resolve) => {
      const extension = archivo.name.lastIndexOf(".");
      const nuevoNombre = `${archivo.name.substr(
        0,
        extension
      )}_${moment().format("YYYYMMDDhhmmss")}${elem.SolicitudId
        }${archivo.name.substr(extension)}`;
      this._sp.web
        .getFolderByServerRelativePath(folderRelativePath)
        .files.addUsingPath(nuevoNombre, archivo, { Overwrite: true })
        .then((v) => {
          v.file.listItemAllFields
            .expand("File")()
            .then((listItemAllFields) => {
              this._sp.web.lists
                .getByTitle(libraryName)
                .items.getById(listItemAllFields.Id)
                .update({
                  NombreArchivo: archivo.name,
                  TipoDocumentoId: elem.TipoDocumentoId,
                  TipoDocumentoDescripcion: elem.TipoDocumentoDescripcion,
                  TipoDocumentoConsecutivo: elem.TipoDocumentoConsecutivo,
                  SucursalId: elem.SucursalId,
                  SucursalDescripcion: elem.SucursalDescripcion,
                  SucursalConsecutivo: elem.SucursalConsecutivo,
                  FechaVencimiento: elem.FechaVencimiento,
                  CondicionDocumentoId: elem.CondicionDocumentoId,
                  CondicionDocumentoDescripcion:
                    elem.CondicionDocumentoDescripcion,
                  SolicitudId: elem.SolicitudId,
                  DocumentoCargadoAplicativo:true
                })
                .then(() => {
                  resolve(listItemAllFields.File);
                })
                .catch((error) => {
                  console.log("Error agregarArchivos - update fields", error);
                  resolve(null);
                });
            })
            .catch((error) => {
              console.log("Error agregarArchivos - updload", error);
              resolve(null);
            });
        })
        .catch((error) => {
          console.log("Error agregarArchivos - relative path", error);
          resolve(null);
        });
    });
  }
  public obtenerCondicionesDocumento(): Promise<any[]> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaCondicionesDocumento)
        .items.select("ID", "Title")
        .orderBy("Title", true)
        .filter(`Activo eq ${comparadorBoleano.verdadero}`)
        .top(5000)()
        .then((items) => {
          const Array = items.map((item) => {
            const condicionDocumento: any = {};
            condicionDocumento.Id = item.ID;
            condicionDocumento.Title = item.Title;
            return condicionDocumento;
          });
          resolve(Array);
        })
        .catch((error) => {
          console.log("Error obtenerCondicionesDocumento", error);
          resolve(null);
        });
    });
  }

  private actualizarTipoDocumentoSolicitud(
    solicitudId: number,
    tipoDocumentoSolicitud: TiposDocumentoSolicitud
  ): Promise<number> {
    return new Promise<number>((resolve): void => {
      const listaTiposDocSolicitud = this._sp.web.lists.getByTitle(
        listaTiposDocumentoSolicitudes
      );
      const spItemUpdateDefinition = {
        SolicitudId: solicitudId,
        TipoDocumentoId: tipoDocumentoSolicitud.TipoDocumentoId,
        AplicaResguardo: tipoDocumentoSolicitud.AplicaResguardo,
        SolicitarResguardo: tipoDocumentoSolicitud.SolicitarResguardo,
        ComentariosResponsable: tipoDocumentoSolicitud.ComentariosResponsable,
        ComentariosAdministradorBoveda:
          tipoDocumentoSolicitud.ComentariosAdministradorBoveda,
        HistorialComentarios: tipoDocumentoSolicitud.HistorialComentarios,
        SolicitarDocumentoOriginal:
          tipoDocumentoSolicitud.SolicitarDocumentoOriginal,
        EstatusRevisionId:
          tipoDocumentoSolicitud.EstatusRevisionId > 0
            ? tipoDocumentoSolicitud.EstatusRevisionId
            : null,
        EstatusRevisionDescripcion:
          tipoDocumentoSolicitud.EstatusRevisionDescripcion,
        DiasPrestamo: tipoDocumentoSolicitud.DiasPrestamo,
        FechaDevolucionDocumentoOriginal: tipoDocumentoSolicitud.FechaDevolucionDocumentoOriginal
      };
      if (tipoDocumentoSolicitud.Id > 0) {
        listaTiposDocSolicitud.items
          .getById(tipoDocumentoSolicitud.Id)
          .update(spItemUpdateDefinition)
          .then(() => {
            resolve(tipoDocumentoSolicitud.Id);
          })
          .catch((error) => {
            console.log(
              `Error al actualizar el tipoDocumentoSolicitud Id: ${tipoDocumentoSolicitud.Id}`,
              error
            );
            resolve(0);
          });
      } else {
        listaTiposDocSolicitud.items
          .add(spItemUpdateDefinition)
          .then((result) => {
            result
              .item()
              .then((item) => {
                resolve(item.ID);
              })
              .catch((error) => {
                console.log(
                  "Error al insertar el tipo documento solicitud ",
                  error
                );
              });
          })
          .catch((error) => {
            console.log("Error al obtener el item generado ", error);
          });
      }
    });
  }
  public actualizarTiposDocumentoSolicitud(
    solicitudId: number,
    tiposDocumentoSolicitud: TiposDocumentoSolicitud[]
  ): Promise<any> {
    return new Promise((resolve) => {
      const promises = [];
      for (let i = 0; i < tiposDocumentoSolicitud.length; i++) {
        promises.push(
          this.actualizarTipoDocumentoSolicitud(
            solicitudId,
            tiposDocumentoSolicitud[i]
          )
        );
      }
      Promise.all(promises)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log(
            "Error al actualizar tipos de documento de la solicitud ",
            error
          );
          resolve(0);
        });
    });
  }

  private eliminarArchivos(listName: string, itemId: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.crearRegistroEliminacion(listName, itemId)
        .then((res) => {
          resolve(res);
        })
        .catch((error: any) => {
          console.log("Error RemoveFiles", error);
          resolve(false);
        });
    });
  }

  private crearRegistroEliminacion(
    tituloLista: string,
    registroId: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const limpiarIdFolio = this.limpiarIdArchivoAnexo(
        tituloLista,
        registroId
      );
      const registrarEliminar = this.registarEliminarRegistro(
        tituloLista,
        registroId
      );
      Promise.all([limpiarIdFolio, registrarEliminar])
        .then((result) => {
          resolve(result[0] && result[1]);
        })
        .catch((error) => {
          console.log("Error crearRegistroEliminacion", error);
          resolve(null);
        });
    });
  }
  private limpiarIdArchivoAnexo(
    tituloLista: string,
    registroId: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(tituloLista)
        .items.getById(registroId)
        .update({
          SolicitudId: 0,
        })
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          console.log("Error limpiarIdArchivoAnexo", error);
          resolve(false);
        });
    });
  }

  private registarEliminarRegistro(
    tituloLista: string,
    registroId: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaControlEliminacionDocumentos)
        .items.add({
          Title: tituloLista,
          RegistroId: registroId,
        })
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          console.log("Error insertarRegistroEliminar", error);
          resolve(false);
        });
    });
  }

  public crearCarpetaDocumentosSucursal(
    nombreCarpetaSucursal: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this._sp.web
        .getFolderByServerRelativePath(
          `${bibliotecaBoveda}/${nombreCarpetaSucursal}`
        )
        .select("Exists")()
        .then((result) => {
          const carpetaExistente = result.Exists;
          if(carpetaExistente)
            resolve(true);
          else {
            this._sp.web.lists
              .getByTitle(bibliotecaBoveda)
              .rootFolder.folders.addUsingPath(nombreCarpetaSucursal)
              .then((result) => {
                 result.folder.listItemAllFields().then(listItem => {
                  this._sp.web.lists.getByTitle(bibliotecaBoveda).items.getById(listItem.ID).update({ 
                    UltimaVersion: true,
                    DocumentoCargadoAplicativo: true
                  })
                  .then(() => {
                    resolve(true);
                }).catch(errorActualizacion => {
                  console.log("Error al actualizar la propiedad DocumentoCargadoAplicativo de la carpeta creada. ", errorActualizacion);
                  resolve(false);
                });
                 }).catch((error)=>{
                  console.log("Error al obtener propiedades del item de la carpeta creada. ", error);
                  resolve(false);
                 });
              })
              .catch((error) => {
                console.log(
                  "Error al crear carpeta de sucursal en la biblioteca de boveda ",
                  error
                );
                resolve(false);
              });
          }
        })
        .catch((error) => {
          console.log(
            "Error al validar si ya existe una carpeta para una sucursal ",
            error
          );
          resolve(false);
        });
    });
  }

  public obtenerEstatusRevisionDocumento(): Promise<any[]> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaEstatusRevisionDocumento)
        .items.select("ID", "Title")
        .orderBy("Title", true)
        .filter(`Activo eq ${comparadorBoleano.verdadero}`)
        .top(5000)()
        .then((items) => {
          const Array = items.map((item) => {
            const estatusRevision: any = {};
            estatusRevision.Id = item.ID;
            estatusRevision.Title = item.Title;
            return estatusRevision;
          });
          resolve(Array);
        })
        .catch((error) => {
          console.log("Error obtenerEstatusRevisionDocumento", error);
          resolve(null);
        });
    });
  }

  public obtenerDocumentosVencidosPorSucursal(
    sucursalId: number,
    fechaComparar: string
  ): Promise<TiposDocumentoSolicitud[]> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(bibliotecaBoveda)
        .items.select(
          "ID",
          "NombreArchivo",
          "EncodedAbsUrl",
          "TipoDocumentoId",
          "TipoDocumentoDescripcion",
          "TipoDocumentoConsecutivo",
          "SucursalId",
          "SucursalDescripcion",
          "SucursalConsecutivo",
          "FechaVencimiento",
          "UltimaVersion",
          "CondicionDocumentoId",
          "CondicionDocumentoDescripcion"
        )
        .filter(
          `TipoDocumentoConsecutivo ne null and SucursalId eq ${sucursalId} and FechaVencimiento le datetime'${fechaComparar}' and UltimaVersion eq ${comparadorBoleano.verdadero} and DocumentoCargadoAplicativo eq ${comparadorBoleano.verdadero}`
        )()
        .then((items) => {
          const adjuntosArray: TiposDocumentoSolicitud[] = items.map((item) => {
            const documentoBoveda = {
              SolicitarResguardo: true,
              AplicaResguardo: false,
              ComentariosResponsable: "",
              Expira: true,
              SolicitarDocumentoOriginal: false,
              FechaDevolucionDocumentoOriginal: "",
              Id: 0,

              FileName: item.NombreArchivo,
              Url: item.EncodedAbsUrl,
              FechaVencimiento: item.FechaVencimiento,
              UltimaVersion: item.UltimaVersion,
              SucursalId: item.SucursalId,
              SucursalDescripcion: item.SucursalDescripcion,
              SucursalConsecutivo: item.SucursalConsecutivo,
              TipoDocumentoId: item.TipoDocumentoId,
              TipoDocumentoTitle: item.TipoDocumentoDescripcion,
              TipoDocumentoConsecutivo: item.TipoDocumentoConsecutivo,
              CondicionDocumentoId: item.CondicionDocumentoId,
              CondicionDocumentoDescripcion: item.CondicionDocumentoDescripcion,
              Confidencial: false
            };
            return documentoBoveda;
          });
          resolve(adjuntosArray);
        })
        .catch((error) => {
          console.log("Error obtenerDocumentosVencidosPorSucursal", error);
        });
    });
  }
  public actualizarSeguimientoChecklist(
    solicitudId: number,
    tipoDocumentoSolicitud: TiposDocumentoSolicitud,
    adjuntoRelacionado?: DocumentoBoveda
  ): Promise<any> {
    return new Promise((resolve) => {
      const promises = [];
      promises.push(
        this.actualizarTipoDocumentoSolicitud(
          solicitudId,
          tipoDocumentoSolicitud
        )
      );
      if (tipoDocumentoSolicitud.AplicaResguardo) {
        if (adjuntoRelacionado)
          promises.push(this.actualizarItemAdjunto(adjuntoRelacionado));
      } else {
        if (adjuntoRelacionado)
          promises.push(
            this.crearRegistroEliminacion(
              bibliotecaBoveda,
              adjuntoRelacionado.Id
            )
          );
      }
      Promise.all(promises)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log(
            "Error al actualizar seguimiento de un registro del checklist ",
            error
          );
          resolve(0);
        });
    });
  }

  private actualizarItemAdjunto(adjuntoData: DocumentoBoveda): Promise<any> {
    return new Promise((resolve) => {
      const bibliotecDocumentosBoveda =
        this._sp.web.lists.getByTitle(bibliotecaBoveda);
      const spItemUpdateDefinition = {
        FechaVencimiento: adjuntoData.FechaVencimiento,
        UltimaVersion: adjuntoData.UltimaVersion,
        RevisionDigital: adjuntoData.RevisionDigital,
        RevisionFisico: adjuntoData.RevisionFisico,
        EstatusRevisionId: adjuntoData.EstatusRevisionId,
        EstatusRevisionDescripcion: adjuntoData.EstatusRevisionDescripcion,
        CondicionDocumentoId: adjuntoData.CondicionDocumentoId,
        CondicionDocumentoDescripcion:
          adjuntoData.CondicionDocumentoDescripcion,
        DocumentoFisicoPrestado: adjuntoData.DocumentoFisicoPrestado,
        DocumentoFisicoPrestadoAId: adjuntoData.DocumentoFisicoPrestadoAId
      };
      if (adjuntoData.Id > 0) {
        bibliotecDocumentosBoveda.items
          .getById(adjuntoData.Id)
          .update(spItemUpdateDefinition)
          .then(() => {
            resolve(adjuntoData.Id);
          })
          .catch((error) => {
            console.log(
              "Error al actualizar las propiedades de un adjunto en la biblioteca boveda.",
              error
            );
            resolve(0);
          });
      }
    });
  }

  public obtenerFlujosEstatusSolicitud(): Promise<any> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaFlujoEstatusSolicitudes)
        .items.select(
          "ID",
          "EstatusActual/ID",
          "EstatusActual/Title",
          "SiguienteEstatusAprobacion/ID",
          "SiguienteEstatusAprobacion/Title",
          "SiguienteEstatusRechazo/ID",
          "SiguienteEstatusRechazo/Title",
          "TipoSolicitud/ID",
          "TipoSolicitud/Title"
        )
        .expand(
          "EstatusActual",
          "SiguienteEstatusAprobacion",
          "SiguienteEstatusRechazo",
          "TipoSolicitud"
        )
        .top(100)()
        .then((items: any) => {
          const resultadoFlujos = items.map((item: any) => {
            const flujo: any = {
              ID: item.Id,
              EstatusActualId: item.EstatusActual.ID,
              EstatusActualDescripcion: item.EstatusActual.Title,
              SiguienteEstatusAprobacionId: item.SiguienteEstatusAprobacion.ID,
              SiguienteEstatusAprobacionDescripcion:
                item.SiguienteEstatusAprobacion.Title,
              SiguienteEstatusRechazoId: item.SiguienteEstatusRechazo
                ? item.SiguienteEstatusRechazo.ID
                : null,
              SiguienteEstatusRechazoDescripcion: item.SiguienteEstatusRechazo
                ? item.SiguienteEstatusRechazo.Title
                : "",
              TipoSolicitudId: item.TipoSolicitud.ID,
              TipoSolicitudDescripcion: item.TipoSolicitud.Title,
            };
            return flujo;
          });
          resolve(resultadoFlujos);
        })
        .catch((error) => {
          console.log(
            "Error al consultar la lista FlujosEstatusSolicitudes ",
            error
          );
          resolve(null);
        });
    });
  }

  public obtenerAprobadoresSolicitud(): Promise<AprobadoresSolicitudes[]> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(listaAprobadores)
        .items.select(
          "ID",
          "RolResponsable/ID",
          "RolResponsable/Title",
          "Area/ID",
          "Area/Title",
          "Area/EMail",
          "DireccionBoveda/ID",
          "DireccionBoveda/Title",
          "DireccionBoveda/EMail",
          "AdministradorBoveda/ID",
          "AdministradorBoveda/Title",
          "AdministradorBoveda/EMail"
        )
        .expand(
          "RolResponsable",
          "Area",
          "DireccionBoveda",
          "AdministradorBoveda"
        )
        .top(100)()
        .then((items: any) => {
          const resultadoAprobadores: AprobadoresSolicitudes[] = items.map((item: any) => {
            const aprobador: AprobadoresSolicitudes = {
              Id: item.Id,
              RolResponsableId: item.RolResponsable.ID,
              RolResponsableTitle: item.RolResponsable.Title,
              AutorizadorAreaId: item.Area.ID,
              AutorizadorAreaTitle: item.Area.Title,
              AutorizadorAreaEmail: item.Area.EMail,
              AutorizadorDireccionBovedaId: item.DireccionBoveda.ID,
              AutorizadorDireccionBovedaTitle: item.DireccionBoveda.Title,
              AutorizadorDireccionBovedaEmail: item.DireccionBoveda.EMail,
              AutorizadorAdministradorBovedaId: item.AdministradorBoveda.ID,
              AutorizadorAdministradorBovedaTitle:
                item.AdministradorBoveda.Title,
              AutorizadorAdministradorBovedaEmail:
                item.AdministradorBoveda.EMail,
            };
            return aprobador;
          });
          resolve(resultadoAprobadores);
        })
        .catch((error) => {
          console.log("Error al consultar la lista Aprobadores ", error);
        });
    });
  }

  public obtenerDocumentosPorFiltro(
    filtro: string
  ): Promise<DocumentoBoveda[]> {
    return new Promise((resolve) => {
      this._sp.web.lists
        .getByTitle(bibliotecaBoveda)
        .items.select(
          "ID",
          "NombreArchivo",
          "EncodedAbsUrl",
          "TipoDocumentoId",
          "TipoDocumentoDescripcion",
          "TipoDocumentoConsecutivo",
          "SucursalId",
          "SucursalDescripcion",
          "SucursalConsecutivo",
          "FechaVencimiento",
          "UltimaVersion",
          "RevisionDigital",
          "RevisionFisico",
          "EstatusRevisionId",
          "EstatusRevisionDescripcion",
          "CondicionDocumentoId",
          "CondicionDocumentoDescripcion",
          "SolicitudId",
          "DocumentoFisicoPrestado"
        )
        .filter(filtro)
        .top(5000)()
        .then((items) => {
          const adjuntosArray: DocumentoBoveda[] = items.map((item) => {
            const documentoBoveda = {
              Id: item.Id,
              FileName: item.NombreArchivo,
              Url: item.EncodedAbsUrl,
              FechaVencimiento: item.FechaVencimiento,
              UltimaVersion: item.UltimaVersion,
              SucursalId: item.SucursalId,
              SucursalDescripcion: item.SucursalDescripcion,
              SucursalConsecutivo: item.SucursalConsecutivo,
              TipoDocumentoId: item.TipoDocumentoId,
              TipoDocumentoDescripcion: item.TipoDocumentoDescripcion,
              TipoDocumentoConsecutivo: item.TipoDocumentoConsecutivo,
              CondicionDocumentoId: item.CondicionDocumentoId,
              CondicionDocumentoDescripcion: item.CondicionDocumentoDescripcion,
              RevisionDigital: item.RevisionDigital,
              RevisionFisico: item.RevisionFisico,
              EstatusRevisionId: item.EstatusRevisionId,
              EstatusRevisionDescripcion: item.EstatusRevisionDescripcion,
              DocumentoFisicoPrestado: item.DocumentoFisicoPrestado,
              SolicitudId: item.SolicitudId,
            };
            return documentoBoveda;
          });
          resolve(adjuntosArray);
        })
        .catch((error) => {
          console.log("Error obtenerAdjuntosSolicitud", error);
          resolve(null);
        });
    });
  }

  public actualizarEstatusSolicitud(
    solicitudData: SolicitudBoveda
  ): Promise<any> {
    return new Promise((resolve) => {

      let spItemUpdateDefinition = {};

      if (solicitudData.EstatusId === EstatusSolicitudes.Finalizada.id) {
        spItemUpdateDefinition = {
          EstatusSolicitudId: solicitudData.EstatusId,
          EstatusSolicitudDescripcion: solicitudData.EstatusDescripcion,
          AsignadoId: solicitudData.AsignadoId,
          FechaFinalizacion: new Date()
        };
      }
      else {
        if (solicitudData.EstatusId === EstatusSolicitudes.RevisionArea.id
          || solicitudData.EstatusId === EstatusSolicitudes.RechazadaArea.id
          || solicitudData.EstatusId === EstatusSolicitudes.RevisionDireccion.id
          || solicitudData.EstatusId === EstatusSolicitudes.RechazadaDireccion.id)
          spItemUpdateDefinition = {
            EstatusSolicitudId: solicitudData.EstatusId,
            EstatusSolicitudDescripcion: solicitudData.EstatusDescripcion,
            AsignadoId: solicitudData.AsignadoId,
            HistorialComentariosArea: solicitudData.HistorialComentariosArea,
            HistorialComentariosDireccion: solicitudData.HistorialComentariosDireccion
          };
        else
          spItemUpdateDefinition = {
            EstatusSolicitudId: solicitudData.EstatusId,
            EstatusSolicitudDescripcion: solicitudData.EstatusDescripcion,
            AsignadoId: solicitudData.AsignadoId,
          };
      }

      this._sp.web.lists
        .getByTitle(listaSolicitudes)
        .items.getById(solicitudData.Id)
        .update(spItemUpdateDefinition)
        .then(() => {

          resolve(solicitudData.Id);
        })
        .catch((error) => {
          console.log(
            "Error al actualizar el estatus de una solicitud.",
            error
          );
          resolve(0);
        });
    });
  }

  public actualizarItemsAdjuntosSolicitud(adjuntosData: DocumentoBoveda[]): Promise<any> {
    return new Promise((resolve) => {
      const promises = [];
      for (let i = 0; i < adjuntosData.length; i++) {
        promises.push(
          this.actualizarItemAdjunto(adjuntosData[i])
        );
      }
      Promise.all(promises)
        .then((result) => {
          resolve(true);
        }).catch((error) => {
          console.log("Error al actualizar los metadatos de un documento adjunto en boveda ", error);
          resolve(false);
        });
    });
  }

  public obtenerAsuetos(): Promise<any[]> {
    return new Promise((resolve) => {
      this._spDM.web.lists
        .getByTitle(listaAsuetos)
        .items.select(
          "ID",
          "Title",
          "Fecha"
        )
        .orderBy("Fecha", true)
        .top(100)()
        .then((items: any) => {
          const resultadoAsuetos: [] = items.map((item: any) => {
            const itemDate = new Date(item.Fecha);
            const currentYear = new Date().getFullYear();
            const asueto = new Date(`${currentYear},${(itemDate.getMonth() + 1)},${itemDate.getDate()}`);
            return asueto;
          });
          resolve(resultadoAsuetos);
        })
        .catch((error) => {
          console.log("Error al consultar la lista Asuetos ", error);
        });
    });
  }
}
