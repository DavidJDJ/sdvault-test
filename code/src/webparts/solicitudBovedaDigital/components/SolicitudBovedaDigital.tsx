import * as React from 'react';
import { ISolicitudBovedaDigitalProps } from './ISolicitudBovedaDigitalProps';
import FormularioSolicitud from '../../../general/componentes/FormularioSolicitud/FormularioSolicitud';
import { SolicitudBoveda, Usuario, Sucursal, Ciudad, Rol, TipoDocumento, TipoDocumentoRol, AprobadoresSolicitudes, TiposDocumentoSolicitud } from '../../../general/data/entities';
import { comparadorBoleano, EstatusSolicitudes, grupoAdministradorBoveda, grupoGerenteConstruccion, grupoGerenteSucursal, grupoJuridicoAdministrativo, grupoJuridicoInmuebles, Roles, TiposSolicitud } from '../../../general/data/entities/Constantes';
import { mapListToDropDownItems } from '../../../general/helpers/HelperGeneral';
import { IDropdownOption, MessageBarType } from '@fluentui/react';
import GeneralMessageBar from '../../../general/componentes/GeneralMessageBar';
import { ISiteUserInfo } from "@pnp/sp/site-users/types";
export interface ISolicitudResguardoDocumentosState {
  administradoresBoveda: ISiteUserInfo[];
  aprobadoresSolicitud: AprobadoresSolicitudes[],
  condicionesDocumento: IDropdownOption[],
  estatusRevisionDocumento: IDropdownOption[],
  displayMode: string,
  fieldsState: any,
  fieldsStatusError: any,
  flujosEstatusSolicitud: any,
  gerentesConstruccion: ISiteUserInfo[];
  gerentesSucursal: ISiteUserInfo[];
  juridicosAdmnistrativos: ISiteUserInfo[];
  juridicosInmuebles: ISiteUserInfo[];
  loading: boolean;
  rolesResponsables: IDropdownOption[];
  sucursales: Sucursal[];
  solicitud: SolicitudBoveda;
  tiposDocumento: TipoDocumento[],
  usuario: Usuario;
  validacionAcceso: any
}

export default class SolicitudBovedaDigital extends React.Component<ISolicitudBovedaDigitalProps, ISolicitudResguardoDocumentosState> {
  constructor(props: ISolicitudBovedaDigitalProps) {
    super(props);
    this.state = {
      administradoresBoveda: [],
      aprobadoresSolicitud: [],
      condicionesDocumento: [],
      estatusRevisionDocumento: [],
      displayMode: "",
      fieldsState: {
        sucursal: { disable: true, hide: false },
        rolResponsable: { disable: true, hide: false },
        responsable: { disable: true, hide: false },
        fechaCompromiso: { disable: true, hide: false },
        comentarios: { disable: true, hide: false },
        historialComentarios: { disable: true, hide: false },
        comentariosFlujoAprobacion: { disable: true, hide: true },
        historialComentariosArea: { disable: true, hide: true },
        historialComentariosDireccion: { disable: true, hide: true }
      },
      fieldsStatusError: {
        errorForm: { error: false, mensajeError: "" },
        field: {
          sucursal: { error: false, mensajeError: "" },
          rolResponsable: { error: false, mensajeError: "" },
          responsable: { error: false, mensajeError: "" },
          fechaCompromiso: { error: false, mensajeError: "" },
          comentarios: { error: false, mensajeError: "" }
        },
        errorValidacionTiposAdjuntos: { error: false, mensajeError: "" }
      },
      flujosEstatusSolicitud: [],
      gerentesConstruccion: [],
      gerentesSucursal: [],
      juridicosAdmnistrativos: [],
      juridicosInmuebles: [],
      loading: false,
      rolesResponsables: [],
      sucursales: [],
      solicitud: new SolicitudBoveda(),
      tiposDocumento: [],
      usuario: new Usuario(),
      validacionAcceso: {}
    }
  }

  public componentDidMount(): void {

    const params = new URLSearchParams(document.location.search.substring(1));
    const solicitudId = params.get("SolicitudId") !== null ? parseInt(params.get("SolicitudId")) : 0;
    const tipoSolicitud: string = params.get("TipoSolicitud") !== null ? params.get("TipoSolicitud") : 'Resguardo';
    const displayMode = params.get("DisplayMode") !== null ? params.get("DisplayMode") : "New";

    const initializationRequests = [];
    initializationRequests.push(this.props.spGeneralService.obtenerDatosUsuario());
    initializationRequests.push(this.props.spSolicitudBovedaService.obtenerSucursales());
    initializationRequests.push(this.props.spSolicitudBovedaService.obtenerCiudades());
    initializationRequests.push(this.props.spSolicitudBovedaService.obtenerRoles());
    initializationRequests.push(this.props.spSolicitudBovedaService.obtenerTiposDocumento());
    initializationRequests.push(this.props.spSolicitudBovedaService.obtenerTiposDocumentoRol());
    initializationRequests.push(this.props.spSolicitudBovedaService.obtenerCondicionesDocumento());

    //Obtiene usuarios de grupos que pueden dar seguimiento a solicitudes de resguardo de documentos
    initializationRequests.push(this.props.spGeneralService.obtenerUsuariosGrupoSP(grupoGerenteSucursal));
    initializationRequests.push(this.props.spGeneralService.obtenerUsuariosGrupoSP(grupoGerenteConstruccion));
    initializationRequests.push(this.props.spGeneralService.obtenerUsuariosGrupoSP(grupoJuridicoInmuebles));
    initializationRequests.push(this.props.spGeneralService.obtenerUsuariosGrupoSP(grupoJuridicoAdministrativo));
    initializationRequests.push(this.props.spGeneralService.obtenerUsuariosGrupoSP(grupoAdministradorBoveda));

    initializationRequests.push(this.props.spSolicitudBovedaService.obtenerEstatusRevisionDocumento());
    initializationRequests.push(this.props.spSolicitudBovedaService.obtenerFlujosEstatusSolicitud());
    initializationRequests.push(this.props.spSolicitudBovedaService.obtenerAprobadoresSolicitud());

    Promise.all(initializationRequests).then(async result => {

      const resultDatosUsuario: Usuario = result[0] as Usuario;
      const resultSucursales: Sucursal[] = result[1] as Sucursal[];
      const resultCiudades: Ciudad[] = result[2] as Ciudad[];
      const resultRoles: Rol[] = result[3] as Rol[];
      const resultTiposDocumento: TipoDocumento[] = result[4] as TipoDocumento[];
      const resultTiposDocumentoRol: TipoDocumentoRol[] = result[5] as TipoDocumentoRol[];
      const resultCondicionesDocumento: any = result[6];

      //usuarios de grupos que pueden dar seguimiento a solicitudes de resguardo de documentos
      const usuariosGerentesSucursal: any = result[7];
      const usuariosGerentesConstruccion: any = result[8];
      const usuariosJuridicoInmuebles: any = result[9];
      const usuariosJuridicoAdministrativo: any = result[10];
      const usuariosAdministradorBoveda: any = result[11];

      const resultEstatusRevisionDocumento: any = result[12];
      const resultFlujosEstatusSolicitud: any = result[13];
      const resultAprobadoresSolicitud: AprobadoresSolicitudes[] = result[14] as AprobadoresSolicitudes[];

      const listadoTiposDocumento: TipoDocumento[] = resultTiposDocumentoRol.map((element: TipoDocumentoRol) => {
        
        const consecutivo = element.TipoDocumentoConsecutivo;
        const informacionTipoDocumento: TipoDocumento = resultTiposDocumento.find(x => x.Consecutivo === consecutivo);
        const tipoDocumentoObj = new TipoDocumento();
        if (informacionTipoDocumento) {
          tipoDocumentoObj.Id = informacionTipoDocumento.Id;
          tipoDocumentoObj.Title = informacionTipoDocumento.Title;
          tipoDocumentoObj.Consecutivo = informacionTipoDocumento.Consecutivo;
          tipoDocumentoObj.RolId = element.RolId;
          tipoDocumentoObj.RolDescripcion = element.RolDescripcion;
          tipoDocumentoObj.TipoTramiteId = informacionTipoDocumento.TipoTramiteId;
          tipoDocumentoObj.TipoTramiteDescripcion = informacionTipoDocumento.TipoTramiteDescripcion;
          tipoDocumentoObj.Expira = informacionTipoDocumento.Expira;
          tipoDocumentoObj.Confidencial = informacionTipoDocumento.Confidencial;
        }
        return tipoDocumentoObj;
      });

      let solicitud = { ...this.state.solicitud };
      let fieldsStatus = [];

      if (solicitudId > 0) {
        this.props.spSolicitudBovedaService.obtenerDetalleSolicitud(solicitudId).then((resultadoSolicitud) => {
          solicitud = resultadoSolicitud;
          fieldsStatus = this.obtenerEstadoCampos(displayMode, solicitud, this.state.fieldsState, resultDatosUsuario);

          this.setState({
            administradoresBoveda: usuariosAdministradorBoveda,
            aprobadoresSolicitud: resultAprobadoresSolicitud,
            condicionesDocumento: mapListToDropDownItems(resultCondicionesDocumento),
            estatusRevisionDocumento: mapListToDropDownItems(resultEstatusRevisionDocumento),
            displayMode: displayMode,
            fieldsState: fieldsStatus,
            flujosEstatusSolicitud: resultFlujosEstatusSolicitud,
            gerentesConstruccion: usuariosGerentesConstruccion,
            gerentesSucursal: usuariosGerentesSucursal,
            juridicosAdmnistrativos: usuariosJuridicoAdministrativo,
            juridicosInmuebles: usuariosJuridicoInmuebles,
            loading: false,
            rolesResponsables: mapListToDropDownItems(resultRoles.filter(x => x.SeguimientoSolicitudesResguardo)),
            sucursales: resultSucursales.map((sucursal: Sucursal) => {
              const ciudad = resultCiudades.filter(x => x.Id === sucursal.CiudadId);
              if (ciudad.length > 0) {
                sucursal.EstadoId = ciudad[0].EstadoId;
                sucursal.EstadoDescripcion = ciudad[0].EstadoDescripcion;
              }
              return sucursal;
            }),
            solicitud: solicitud,
            tiposDocumento: listadoTiposDocumento,
            usuario: resultDatosUsuario
          });
        }).catch((error) => {
          console.log("Error al obtener el detalle de la solicitud");
        });
      }
      else {

        const sucursalesCompletas = resultSucursales.map((sucursal: Sucursal) => {
          const ciudad = resultCiudades.filter(x => x.Id === sucursal.CiudadId);
          if (ciudad.length > 0) {
            sucursal.EstadoId = ciudad[0].EstadoId;
            sucursal.EstadoDescripcion = ciudad[0].EstadoDescripcion;
          }
          return sucursal;
        });

        solicitud.TipoSolicitudId = tipoSolicitud === TiposSolicitud.Resguardo.titulo ? TiposSolicitud.Resguardo.id : tipoSolicitud === TiposSolicitud.Prestamo.titulo ? TiposSolicitud.Prestamo.id : TiposSolicitud.Renovacion.id;
        const resultAcceso = this.validarAcceso(solicitud, resultDatosUsuario, resultRoles);
        if (!resultAcceso.accesoDenegado) {
          solicitud.TipoSolicitudDescripcion = tipoSolicitud;
          solicitud.SolicitanteId = resultDatosUsuario.Id;
          solicitud.SolicitanteTitle = resultDatosUsuario.Nombre;
          solicitud.SolicitanteEmail = resultDatosUsuario.Email;
          solicitud.RolSolicitanteId = resultDatosUsuario.Rol.Id;
          solicitud.RolSolicitanteDescripcion = resultDatosUsuario.Rol.Title;
          solicitud.EstatusId = tipoSolicitud === TiposSolicitud.Resguardo.titulo ? EstatusSolicitudes.Pendiente.id : EstatusSolicitudes.Pendiente.id;
          solicitud.EstatusDescripcion = tipoSolicitud === TiposSolicitud.Resguardo.titulo ? EstatusSolicitudes.Pendiente.titulo : EstatusSolicitudes.Pendiente.titulo;
          solicitud.FechaCompromiso = tipoSolicitud === TiposSolicitud.Prestamo.titulo ? null : new Date().toISOString();
          fieldsStatus = this.obtenerEstadoCampos(displayMode, solicitud, this.state.fieldsState, resultDatosUsuario);


          const sucursalUsuarioActual = sucursalesCompletas.find(e => e.Id === resultDatosUsuario.SucursalId);
          if (solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id && sucursalUsuarioActual !== null || (solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id && resultDatosUsuario.Rol.Id === Roles.GerenteSucursal.id)) {
            solicitud.SucursalId = sucursalUsuarioActual.Id;
            solicitud.NumeroSucursal = sucursalUsuarioActual.Consecutivo;
            solicitud.SucursalDescripcion = sucursalUsuarioActual.Title;
            solicitud.EstadoId = sucursalUsuarioActual.EstadoId;
            solicitud.EstadoDescripcion = sucursalUsuarioActual.EstadoDescripcion;
            solicitud.CiudadId = sucursalUsuarioActual.CiudadId;
            solicitud.CiudadDescripcion = sucursalUsuarioActual.CiudadDescripcion;
            solicitud.FormatoSucursalId = sucursalUsuarioActual.FormatoId;
            solicitud.FormatoSucursalDescripcion = sucursalUsuarioActual.FormatoDescripcion;
          }

          if (solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id || solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id) {
            solicitud.RolResponsableId = resultDatosUsuario.Rol.Id;
            solicitud.RolResponsableDescripcion = resultDatosUsuario.Rol.Title;
            solicitud.ResponsableId = resultDatosUsuario.Id;
            solicitud.ResponsableTitle = resultDatosUsuario.Nombre;
            solicitud.ResponsableEmail = resultDatosUsuario.Email;
          }

          if (solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
            const configuracionRecurrencia = await this.props.spGeneralService.obtenerConfiguracionRecurrencia();
            const fechaComparar = new Date();
            fechaComparar.setDate(fechaComparar.getDate() + configuracionRecurrencia.DiasAnticipacion);
            const tiposDocumentoSolicitud = await this.props.spSolicitudBovedaService.obtenerDocumentosVencidosPorSucursal(sucursalUsuarioActual.Id, fechaComparar.toISOString());
            tiposDocumentoSolicitud.sort(function(a, b) {
              return (a.FechaVencimiento < b.FechaVencimiento) ? -1 : ((a.FechaVencimiento > b.FechaVencimiento) ? 1 : 0);
          });
            solicitud = { ...solicitud, TiposDocumentoSolicitud: tiposDocumentoSolicitud };
          }
          else if (solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id && resultDatosUsuario.Rol.Id === Roles.GerenteSucursal.id) {
            const query = `TipoDocumentoConsecutivo ne null and UltimaVersion eq ${comparadorBoleano.verdadero} and SucursalId eq ${solicitud.SucursalId} and DocumentoFisicoPrestado eq ${comparadorBoleano.falso} and RevisionFisico eq ${comparadorBoleano.verdadero} and DocumentoCargadoAplicativo eq ${comparadorBoleano.verdadero}`
            const docsDisponibles = await this.props.spSolicitudBovedaService.obtenerDocumentosPorFiltro(query);
            const tiposDocumentoDisponibles = docsDisponibles.map(e => {
              const documento: TiposDocumentoSolicitud = new TiposDocumentoSolicitud();
              documento.TipoDocumentoId = e.TipoDocumentoId;
              documento.TipoDocumentoTitle = e.TipoDocumentoDescripcion;
              documento.TipoDocumentoConsecutivo = e.TipoDocumentoConsecutivo;
              documento.CondicionDocumentoDescripcion = e.CondicionDocumentoDescripcion;
              documento.FechaDevolucionDocumentoOriginal = null;
              return documento;
            });
            solicitud = { ...solicitud, TiposDocumentoSolicitud: tiposDocumentoDisponibles };


          }

          this.setState({
            administradoresBoveda: usuariosAdministradorBoveda,
            aprobadoresSolicitud: resultAprobadoresSolicitud,
            condicionesDocumento: mapListToDropDownItems(resultCondicionesDocumento),
            estatusRevisionDocumento: mapListToDropDownItems(resultEstatusRevisionDocumento),
            displayMode: displayMode,
            fieldsState: fieldsStatus,
            gerentesConstruccion: usuariosGerentesConstruccion,
            gerentesSucursal: usuariosGerentesSucursal,
            juridicosAdmnistrativos: usuariosJuridicoAdministrativo,
            juridicosInmuebles: usuariosJuridicoInmuebles,
            loading: false,
            rolesResponsables: mapListToDropDownItems(resultRoles.filter(x => x.SeguimientoSolicitudesResguardo)),
            sucursales: sucursalesCompletas,
            solicitud: solicitud,
            tiposDocumento: listadoTiposDocumento,
            usuario: resultDatosUsuario,
            validacionAcceso: resultAcceso
          });
        }
        else
          this.setState({ validacionAcceso: resultAcceso });
      }

    }).catch((error) => {
      console.log("Error SolicitudBovedaDigital - componentDidMount", error);
    });

  }

  public obtenerEstadoCampos = (displayMode: string, solData: SolicitudBoveda, fieldsState: any, usuario: Usuario): any => {
    const tipoSolicitudId = solData.TipoSolicitudId;
    let newFieldsState = { ...fieldsState };

    switch (tipoSolicitudId) {
      case TiposSolicitud.Resguardo.id:
        if (displayMode === "New") {
          newFieldsState = {
            sucursal: { disable: false, hide: false },
            rolResponsable: { disable: false, hide: false },
            responsable: { disable: false, hide: false },
            fechaCompromiso: { disable: false, hide: false },
            comentarios: { disable: false, hide: false },
            comentariosFlujoAprobacion: { disable: true, hide: true },
            historialComentariosArea: { disable: true, hide: true },
            historialComentariosDireccion: { disable: true, hide: true }
          }
        }
        else {
          newFieldsState = {
            sucursal: { disable: true, hide: false },
            rolResponsable: { disable: true, hide: false },
            responsable: { disable: true, hide: false },
            fechaCompromiso: { disable: true, hide: false },
            comentarios: { disable: true, hide: false },
            historialComentarios: { disable: true, hide: false },
            comentariosFlujoAprobacion: { disable: true, hide: true },
            historialComentariosArea: { disable: true, hide: true },
            historialComentariosDireccion: { disable: true, hide: true }
          }
        }
        break;
      case TiposSolicitud.Renovacion.id:
        newFieldsState = {
          sucursal: { disable: true, hide: false },
          rolResponsable: { disable: true, hide: false },
          responsable: { disable: true, hide: false },
          fechaCompromiso: { disable: true, hide: true },
          comentarios: { disable: true, hide: true },
          historialComentarios: { disable: true, hide: true },
          comentariosFlujoAprobacion: { disable: true, hide: true },
          historialComentariosArea: { disable: true, hide: true },
          historialComentariosDireccion: { disable: true, hide: true }
        }
        break;
      case TiposSolicitud.Prestamo.id:
        if (solData.Id === 0) {
          newFieldsState = {
            sucursal: { disable: solData.RolSolicitanteDescripcion === grupoGerenteSucursal ? true : false, hide: false },
            rolResponsable: { disable: true, hide: false },
            responsable: { disable: true, hide: false },
            fechaCompromiso: { disable: true, hide: true },
            comentarios: { disable: false, hide: false },
            historialComentarios: { disable: true, hide: true },
            comentariosFlujoAprobacion: { disable: true, hide: true },
            historialComentariosArea: { disable: true, hide: true },
            historialComentariosDireccion: { disable: true, hide: true }

          }
        }
        else {
          newFieldsState = {
            sucursal: { disable: true, hide: false },
            rolResponsable: { disable: true, hide: false },
            responsable: { disable: true, hide: false },
            fechaCompromiso: { disable: true, hide: true },
            comentarios: { disable: true, hide: false },
            historialComentarios: { disable: true, hide: false },
            comentariosFlujoAprobacion: { disable: true, hide: true },
            historialComentariosArea: { disable: true, hide: true },
            historialComentariosDireccion: { disable: true, hide: true }
          }
          switch (solData.EstatusId) {
            case EstatusSolicitudes.RevisionArea.id:
              newFieldsState.historialComentariosArea = { disable: true, hide: false };
              if (solData.AsignadoId === usuario.Id && displayMode === "Edit")
                newFieldsState.comentariosFlujoAprobacion = { disable: false, hide: false };
              break;

            case EstatusSolicitudes.RevisionDireccion.id:
              newFieldsState.historialComentariosDireccion = { disable: true, hide: false };
              if (solData.AsignadoId === usuario.Id && displayMode === "Edit")
                newFieldsState.comentariosFlujoAprobacion = { disable: false, hide: false };
              if (solData.SolicitanteId === usuario.Id && displayMode === "Edit") {
                newFieldsState.comentarioFlujoAprobacion = { disable: true, hide: false };
                newFieldsState.historialComentariosArea = { disable: true, hide: false };
              }
              break;

            case EstatusSolicitudes.RechazadaArea.id:
              newFieldsState.historialComentariosArea = { disable: true, hide: false };
              if (solData.SolicitanteId === usuario.Id && displayMode === "Edit")
                newFieldsState.comentariosFlujoAprobacion = { disable: false, hide: false };

              break;

            case EstatusSolicitudes.RechazadaDireccion.id:
              newFieldsState.historialComentariosDireccion = { disable: true, hide: false };
              if (solData.SolicitanteId === usuario.Id && displayMode === "Edit")
                newFieldsState.comentariosFlujoAprobacion = { disable: false, hide: false };
              break;


          }
        }
        break;

    }
    return newFieldsState;
  };

  private validarAcceso = (solicitud: SolicitudBoveda, datosUsuario: Usuario, rolesUsuarios: Rol[]): any => {
    let validacionAcceso = { accesoDenegado: false, mensajeErrorAcceso: "" };

    if (!datosUsuario.Rol) {
      validacionAcceso = { accesoDenegado: true, mensajeErrorAcceso: "Lo sentimos, no cuenta con los privilegios necesarios. Comuníquese con el administrador para que le asigne un rol." }
      return validacionAcceso;
    }
    if (solicitud.Id === 0) {
      if (solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id) {
        if (datosUsuario.Rol.Id !== Roles.AdministradorBoveda.id)
          validacionAcceso = { accesoDenegado: true, mensajeErrorAcceso: "Lo sentimos, debe tener asignado el rol de Administrador de Bóveda para poder crear solicitudes de resguardo." };
      }
      else if (solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
        if (datosUsuario.Rol.Id !== Roles.GerenteSucursal.id || datosUsuario.SucursalId === 0)
          validacionAcceso = { accesoDenegado: true, mensajeErrorAcceso: "Lo sentinos, debe tener asignado el rol de Gerente de sucursal y tener configurada una sucursal para poder crear solicitudes de renovación." }
      }
      else if (solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id) {
        const definicionRolUsuario = rolesUsuarios.find(x=> x.Id === datosUsuario.Rol.Id);
        if(definicionRolUsuario){
          if(!definicionRolUsuario.SolicitarPrestamoDocumentos){
            validacionAcceso = { accesoDenegado: true, mensajeErrorAcceso: "Lo sentimos, el rol que tiene configurado en el aplicativo no permite la creación de solicitudes de préstamo de documentos." }
          }
        }
      }
    }
    return validacionAcceso
  }

  public render(): React.ReactElement<ISolicitudBovedaDigitalProps> {
    return (
      <div>
        <GeneralMessageBar display={this.state.validacionAcceso.accesoDenegado} message={this.state.validacionAcceso.mensajeErrorAcceso} type={MessageBarType.error} />
        {
          this.state.usuario.Id > 0 && !this.state.validacionAcceso.accesoDenegado ?
            <FormularioSolicitud
              aprobadoresSolicitud={this.state.aprobadoresSolicitud}
              condicionesDocumento={this.state.condicionesDocumento}
              context={this.props.context}
              displayMode={this.state.displayMode}
              estatusRevisionDocumento={this.state.estatusRevisionDocumento}
              fieldsState={this.state.fieldsState}
              fieldsStatusError={this.state.fieldsStatusError}
              listadoAdministradoresBoveda={this.state.administradoresBoveda}
              listadoFlujosEstatus={this.state.flujosEstatusSolicitud}
              listadoGerentesConstruccion={this.state.gerentesConstruccion}
              listadoGerentesSucursal={this.state.gerentesSucursal}
              listadoJuridicosAdministrativo={this.state.juridicosAdmnistrativos}
              listadoJuridicosInmuebles={this.state.juridicosInmuebles}
              listadoRolesResponsables={this.state.rolesResponsables}
              listadoSucursales={this.state.sucursales}
              listadoTiposDocumento={this.state.tiposDocumento}
              solicitud={this.state.solicitud}
              spSolicitudBovedaService={this.props.spSolicitudBovedaService}
              spNotificacionesService={this.props.spNotificacionesService}
              datosUsuario={this.state.usuario}
            /> : null
        }
      </div>
    );
  }
}
