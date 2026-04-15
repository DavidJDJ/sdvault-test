import * as React from 'react';
import * as moment from "moment";
import styles from '../FormularioSolicitud/FormularioSolicitud.module.scss';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { Spinner, SpinnerSize, TextField, Dropdown, ComboBox, DatePicker, DayOfWeek, IDropdownOption, Label, MessageBarType } from '@fluentui/react';
import { SolicitudBoveda, Usuario, Sucursal, TipoDocumento, TagNotificacion, Historial, TiposDocumentoSolicitud, AttachmentData, DocumentoBoveda, AprobadoresSolicitudes } from '../../data/entities';
import { cadenasEspanol, EstatusSolicitudes, prefijoFolios, TiposMovimientoHistorial, TiposNotificacion, TiposSolicitud, Roles, EstatusRevisionDocumento, comparadorBoleano } from '../../data/entities/Constantes';
import { mapListToDropDownItems, addZeroRight, onFormatDate, addDaysWithoutWeekendsAndHolidays } from '../../helpers/HelperGeneral';
import BarraControles from './BarraControles/BarraControles';
import { ISolicitudesBovedaService } from '../../data/interfaces/ISolicitudesBovedaService';
import GridDocumentos from './GridDocumentos/GridDocumentos';
import { INotificacionesService } from '../../data/interfaces/INotificacionesService';
import * as strings from 'GlobalStrings';
import GeneralMessageBar from '../GeneralMessageBar';
import { ISiteUserInfo } from "@pnp/sp/site-users/types";
export interface IFormularioSolicitudProps {
    aprobadoresSolicitud: AprobadoresSolicitudes[],
    condicionesDocumento: IDropdownOption[];
    context: WebPartContext;
    displayMode: string;
    estatusRevisionDocumento: IDropdownOption[];
    fieldsState: any;
    fieldsStatusError: any;
    listadoFlujosEstatus: any;
    listadoAdministradoresBoveda: ISiteUserInfo[];
    listadoGerentesConstruccion: ISiteUserInfo[];
    listadoGerentesSucursal: ISiteUserInfo[];
    listadoJuridicosAdministrativo: ISiteUserInfo[];
    listadoJuridicosInmuebles: ISiteUserInfo[];
    listadoRolesResponsables: IDropdownOption[];
    listadoSucursales: Sucursal[];
    listadoTiposDocumento: TipoDocumento[];
    spNotificacionesService: INotificacionesService;
    spSolicitudBovedaService: ISolicitudesBovedaService;
    solicitud: SolicitudBoveda;
    datosUsuario: Usuario;
}

export interface IFormularioSolicitudState {
    displayPermissionsHelper: boolean;
    fieldsStatusError: any,
    loading: boolean;
    onItemSaved: boolean;
    showMessageBar: boolean;
    MessageBarText: string;
    MessageBarType: MessageBarType;
    solicitud: SolicitudBoveda;
    usuariosResponsables: IDropdownOption[];
}

export default class FormularioSolicitud extends React.Component<IFormularioSolicitudProps, IFormularioSolicitudState>
{
    constructor(props: IFormularioSolicitudProps) {
        super(props);
        let messageBartText = "";
        let showMessageBar = false;
        let messageBarType = MessageBarType.info;
        if (this.props.solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id && this.props.displayMode === "New") {
            if (this.props.solicitud.TiposDocumentoSolicitud.length > 0) {
                messageBartText = "Seleccione los documentos a renovar y haga clic en Crear solicitud para cargar la documentación";
            }
            else {
                messageBartText = "Actualmente no hay documentos por vencer para su sucursal.";
                messageBarType = MessageBarType.success;
            }
            showMessageBar = true;
        }
        this.state = {
            displayPermissionsHelper: false,
            fieldsStatusError: { ...this.props.fieldsStatusError },
            loading: false,
            onItemSaved: false,
            showMessageBar: showMessageBar,
            MessageBarText: messageBartText,
            MessageBarType: messageBarType,
            solicitud: { ...this.props.solicitud },
            usuariosResponsables: (this.props.solicitud.Id > 0 || this.props.solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id || this.props.solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id) ? [{ key: this.props.solicitud.ResponsableId, text: this.props.solicitud.ResponsableTitle }] : []
        }
    }

    private modificarValorCampoSucursal = (e: any, selectedOption: any): void => {

        let solData: SolicitudBoveda = { ...this.state.solicitud };
        const arraySucursal = this.props.listadoSucursales.filter(x => x.Id === selectedOption.key);
        const informacionSucursal: Sucursal = arraySucursal[0];
        solData.NumeroSucursal = informacionSucursal.Consecutivo;
        solData.SucursalId = selectedOption.key;
        solData.SucursalDescripcion = informacionSucursal.Title;
        solData.EstadoId = informacionSucursal.EstadoId;
        solData.EstadoDescripcion = informacionSucursal.EstadoDescripcion;
        solData.CiudadId = informacionSucursal.CiudadId;
        solData.CiudadDescripcion = informacionSucursal.CiudadDescripcion;
        solData.FormatoSucursalId = informacionSucursal.FormatoId;
        solData.FormatoSucursalDescripcion = informacionSucursal.FormatoDescripcion;
        this.setState({ solicitud: solData });

        if (this.props.solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id) {
            // Obtener tipos documento disponibles en sucursal para préstamo físico
            const query = `TipoDocumentoConsecutivo ne null and UltimaVersion eq ${comparadorBoleano.verdadero} and SucursalId eq ${solData.SucursalId} and DocumentoFisicoPrestado eq ${comparadorBoleano.falso} and RevisionFisico eq ${comparadorBoleano.verdadero} and DocumentoCargadoAplicativo eq ${comparadorBoleano.verdadero}`
            this.props.spSolicitudBovedaService.obtenerDocumentosPorFiltro(query)
                .then(documentos => {
                    const tiposDocumentoDisponibles = documentos.map(e => {
                        const documento: TiposDocumentoSolicitud = new TiposDocumentoSolicitud();
                        documento.TipoDocumentoId = e.TipoDocumentoId;
                        documento.TipoDocumentoTitle = e.TipoDocumentoDescripcion;
                        documento.TipoDocumentoConsecutivo = e.TipoDocumentoConsecutivo;
                        documento.FechaDevolucionDocumentoOriginal = null;
                        documento.CondicionDocumentoDescripcion = e.CondicionDocumentoDescripcion;
                        return documento;
                    });

                    solData = { ...solData, TiposDocumentoSolicitud: tiposDocumentoDisponibles };
                    this.setState({ solicitud: solData })
                })
                .catch(error => { console.log("Error obteniendo documentos disponibles prestamo", error) });
        }
    }

    private modificarValorCampoRol = (e: any, selectedOption: any): void => {

        const tiposDocumentosSolicitud: TiposDocumentoSolicitud[] = [];

        const solData: SolicitudBoveda = { ...this.state.solicitud };
        solData.ResponsableId = 0;
        solData.ResponsableTitle = "";
        solData.ResponsableEmail = "";
        solData.RolResponsableId = selectedOption.key;
        solData.RolResponsableDescripcion = selectedOption.text;

        let listadoUsuariosResponsables: IDropdownOption[] = [];

        switch (selectedOption.key) {
            case 2:
                listadoUsuariosResponsables = mapListToDropDownItems([...this.props.listadoGerentesSucursal]);
                break;
            case 3:
                listadoUsuariosResponsables = mapListToDropDownItems([...this.props.listadoGerentesConstruccion]);
                break;
            case 4:
                listadoUsuariosResponsables = mapListToDropDownItems([...this.props.listadoJuridicosInmuebles]);
                break;
            case 5:
                listadoUsuariosResponsables = mapListToDropDownItems([...this.props.listadoJuridicosAdministrativo]);
                break;
            case 7:
                listadoUsuariosResponsables = mapListToDropDownItems([...this.props.listadoAdministradoresBoveda]);
                break;
            default:
                listadoUsuariosResponsables = [];
                break;
        }

        const listadoTiposDocumentosRol: TipoDocumento[] = this.props.listadoTiposDocumento.filter(x => x.RolId === selectedOption.key).filter(
            (TipoDocumento, i, arr) => arr.findIndex(t => t.Consecutivo === TipoDocumento.Consecutivo) === i
        );

        listadoTiposDocumentosRol.forEach(element => {
            const tipoDocumentosSolicitud = new TiposDocumentoSolicitud();
            tipoDocumentosSolicitud.TipoDocumentoId = element.Id;
            tipoDocumentosSolicitud.TipoDocumentoTitle = element.Title;
            tipoDocumentosSolicitud.TipoDocumentoConsecutivo = element.Consecutivo;
            tipoDocumentosSolicitud.Expira = element.Expira;
            tipoDocumentosSolicitud.Confidencial = element.Confidencial;
            tiposDocumentosSolicitud.push(tipoDocumentosSolicitud);
        });

        solData.TiposDocumentoSolicitud = [...tiposDocumentosSolicitud];
        this.setState({ solicitud: solData, usuariosResponsables: listadoUsuariosResponsables });
    }

    private modificarValorCampoResponsable = (e: any, selectedOption: any): void => {
        const solData: SolicitudBoveda = this.state.solicitud;
        solData.ResponsableId = selectedOption.key;
        solData.ResponsableTitle = selectedOption.text;
        solData.ResponsableEmail = this.obtenerEmailResponsable(solData.RolResponsableId, solData.ResponsableId);
        this.setState({ solicitud: solData });
    }

    private modificarValorCampoComentarios = (e: any): void => {
        const { value, title } = e.target;
        const solData: any = { ...this.state.solicitud };
        solData[title] = value;
        this.setState({ solicitud: solData });
    }

    private onFechaCompromisoChange = (date: Date): void => {
        const solicitud = this.state.solicitud;
        solicitud.FechaCompromiso = date.toISOString();
        this.setState({
            solicitud: solicitud
        });
    }

    private regresarAnterior = (): void => {
        window.location.href = `${this.props.context.pageContext.web.absoluteUrl}/SitePages/DashboardSolicitudes.aspx`;
    }

    private crearSolicitud = (): void => {

        this.setState({ loading: true });
        const solData: SolicitudBoveda = { ...this.state.solicitud };
        const anio: number = new Date().getFullYear();
        const fieldsStatusError = this.validarFormulario(solData, this.props.fieldsStatusError);

        if (fieldsStatusError.errorForm.error || fieldsStatusError.errorValidacionTiposAdjuntos.error) {
            const mensajeAlerta = fieldsStatusError.errorForm.error ? fieldsStatusError.errorForm.mensajeError : fieldsStatusError.errorValidacionTiposAdjuntos.mensajeError;
            this.setState({ loading: false, fieldsStatusError: fieldsStatusError, showMessageBar: true, MessageBarType: MessageBarType.warning, MessageBarText: mensajeAlerta });
        }
        else {

            let tipoMovimientoHistorial: string = "";

            if (solData.TipoSolicitudId === TiposSolicitud.Resguardo.id) {
                solData.EstatusId = EstatusSolicitudes.Pendiente.id;
                solData.EstatusDescripcion = EstatusSolicitudes.Pendiente.titulo;
                solData.TiposDocumentoSolicitud = solData.TiposDocumentoSolicitud.filter(x => x.SolicitarResguardo);
                tipoMovimientoHistorial = TiposMovimientoHistorial.CreacionSolicitudResguardo;
            }
            else if (solData.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
                solData.EstatusId = EstatusSolicitudes.Pendiente.id;
                solData.EstatusDescripcion = EstatusSolicitudes.Pendiente.titulo;
                solData.TiposDocumentoSolicitud = solData.TiposDocumentoSolicitud.filter(x => x.Renovar);
                tipoMovimientoHistorial = TiposMovimientoHistorial.CreacionSolicitudRenovacion;
            }
            else if (solData.TipoSolicitudId === TiposSolicitud.Prestamo.id) {

                const aprobador = this.obtenerAprobador(EstatusSolicitudes.RevisionArea.id);

                solData.EstatusId = EstatusSolicitudes.RevisionArea.id;
                solData.EstatusDescripcion = EstatusSolicitudes.RevisionArea.titulo;
                solData.TiposDocumentoSolicitud = solData.TiposDocumentoSolicitud.filter(x => x.SolicitarDocumentoOriginal);

                if (aprobador) {
                    solData.AsignadoId = aprobador.Id;
                    solData.AsignadoTitle = aprobador.Nombre;
                    solData.AsignadoEmail = aprobador.Email;
                }
                else {
                    solData.AsignadoId = null;
                    solData.AsignadoTitle = "";
                    solData.AsignadoEmail = "";
                }

                tipoMovimientoHistorial = TiposMovimientoHistorial.CreacionSolicitudPrestamo;
            }

            this.props.spSolicitudBovedaService.obtenerContador(anio).then((contador) => {

                const contadorSolicitud = contador;
                const contadorZerosRight = addZeroRight(contadorSolicitud.ContadorFolios, 5);
                solData.Folio = `${prefijoFolios}-${contadorZerosRight}-${new Date().getFullYear()}`;

                this.props.spSolicitudBovedaService.actualizarSolicitudBoveda(solData).then((resultSolicitud) => {
                    solData.Id = resultSolicitud;
                    this.setState({ solicitud: solData }, () => {
                        this.props.spSolicitudBovedaService.actualizarContador(contadorSolicitud).then(() => {
                            this.notificarCambioEstatus(solData).then(() => {
                                this.guardarCambiosHistorial(tipoMovimientoHistorial);
                            }).catch((error) => {
                                console.log("Error al guardar cambios en historial de la solicitud.", error);
                            })
                        }).catch((error) => {
                            console.log("Error al actualizar contador al generar una solicitud.", error);
                        });
                    });
                }).catch((error) => {
                    console.log("Error al actualizar/crear solicitud de boveda.", error);
                });
            }).catch((error) => {
                console.log("Error al obtener contador para generar folio de solicitud.", error);
            });
        }
    }

    private validarFormulario = (solData: SolicitudBoveda, fieldsStatusError: any): any => {

        let errorForm: any = { error: false, mensajeError: "" };
        let errorValidacionTiposAdjuntos: boolean = false;
        let mensajeErrorTiposAdjuntos: string = "";
        let newFieldsStatusError: any = { ...fieldsStatusError };

        const field: any = {
            sucursal: { error: false, mensajeError: "" },
            responsable: { error: false, mensajeError: "" },
            rolResponsable: { error: false, mensajeError: "" },
            fechaCompromiso: { error: false, mensajeError: "" },
            comentarios: { error: false, mensajeError: "" }
        };

        if (solData.SucursalDescripcion === "") {
            errorForm = { error: true, mensajeError: strings.MensajeErrorFormulario };
            field.sucursal.error = true;
            field.sucursal.mensajeError = strings.EtiquetaCampoRequerido;
        }
        if (solData.ResponsableTitle === "") {
            errorForm = { error: true, mensajeError: strings.MensajeErrorFormulario };
            field.responsable.error = true;
            field.responsable.mensajeError = strings.EtiquetaCampoRequerido;
        }
        if (solData.RolResponsableDescripcion === "") {
            errorForm = { error: true, mensajeError: strings.MensajeErrorFormulario };
            field.rolResponsable.error = true;
            field.rolResponsable.mensajeError = strings.EtiquetaCampoRequerido;
        }

        // Validaciones para creacion de una solicitud de resguardo de documentos

        if (solData.TipoSolicitudId === TiposSolicitud.Resguardo.id) {

            if (solData.Id === 0 && this.props.datosUsuario.Rol.Id === Roles.AdministradorBoveda.id) {

                const documentosSolicitados = solData.TiposDocumentoSolicitud.filter(x => x.SolicitarResguardo === true);

                if ((solData.FechaCompromiso === "" || solData.FechaCompromiso === null) && solData.TipoSolicitudId !== TiposSolicitud.Renovacion.id) {
                    errorForm = true;
                    field.fechaCompromiso.error = true;
                    field.fechaCompromiso.mensajeError = strings.EtiquetaCampoRequerido;
                }
                if (documentosSolicitados.length === 0) {
                    errorValidacionTiposAdjuntos = true;
                    mensajeErrorTiposAdjuntos = strings.MensajeErrorValidacionTiposAdjuntos;
                }
            }
        }
        else if (solData.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
            if (solData.Id === 0) {
                const documentosRenovar = solData.TiposDocumentoSolicitud.filter(x => x.Renovar);
                if (documentosRenovar.length === 0) {
                    errorValidacionTiposAdjuntos = true;
                    mensajeErrorTiposAdjuntos = strings.MensajeValidacionSinDocumentosRenovar;
                }
            }
        }

        if (solData.TipoSolicitudId === TiposSolicitud.Prestamo.id) {
            const tiposDocsSeleccionados = solData.TiposDocumentoSolicitud.some(x => x.SolicitarDocumentoOriginal);
            const tiposDocsError = solData.TiposDocumentoSolicitud.some(x => x.SolicitarDocumentoOriginal && x.DiasPrestamo === 0)
            if (solData.Comentarios === "") {
                errorForm = { error: true, mensajeError: strings.MensajeErrorFormulario };
                field.comentarios.error = true;
                field.comentarios.mensajeError = strings.EtiquetaCampoRequerido;
            }
            if (!tiposDocsSeleccionados)
                errorForm = { error: true, mensajeError: strings.MensajeErrorValidacionTiposAdjuntos };
            else if (tiposDocsError)
                errorForm = { error: true, mensajeError: strings.MensajeErrorDiasPrestamo };

        }

        newFieldsStatusError = {
            errorForm: errorForm,
            field: field,
            errorValidacionTiposAdjuntos: { error: errorValidacionTiposAdjuntos, mensajeError: mensajeErrorTiposAdjuntos }
        };

        return newFieldsStatusError;
    }

    public notificarCambioEstatus(solicitud: SolicitudBoveda): Promise<boolean> {
        return new Promise<boolean>((resolve): void => {

            let tags: TagNotificacion[] = [];
            let destinatario: string = "";
            const notificaciones: any[] = [];

            if (solicitud.EstatusId === EstatusSolicitudes.Pendiente.id) {
                if (solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id) {
                    destinatario = solicitud.ResponsableEmail;
                    if (destinatario !== null && destinatario !== "") {
                        tags = [
                            { Key: "{folio}", Value: solicitud.Folio },
                            { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                            { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=Edit` }
                        ];
                        notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.NuevaSolicitudResguardo, tags));
                    }
                }
            }

            else if (solicitud.EstatusId === EstatusSolicitudes.Revision.id) {
                destinatario = solicitud.AsignadoEmail; //Se envia solicitud al rol Bóveda
                if (destinatario !== null && destinatario !== "") {
                    tags = [
                        { Key: "{folio}", Value: solicitud.Folio },
                        { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                        { Key: "{rol}", Value: solicitud.RolResponsableDescripcion },
                        { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=Edit` }
                    ];
                    notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.SolicitudRevisionBoveda, tags));
                }
            }

            else if (solicitud.EstatusId === EstatusSolicitudes.Aprobada.id) {
                if (solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id || solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
                    destinatario = solicitud.ResponsableEmail;
                    if (destinatario !== null && destinatario !== "") {
                        tags = [
                            { Key: "{folio}", Value: solicitud.Folio },
                            { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                            { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=View` }
                        ];
                        notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.SolicitudAprobadaBoveda, tags));
                    }
                }
                else {
                    destinatario = solicitud.SolicitanteEmail;
                    if (destinatario !== null && destinatario !== "") {
                        tags = [
                            { Key: "{folio}", Value: solicitud.Folio },
                            { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                            { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=View` }
                        ];
                        notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.SolicitudPrestamoAprobada, tags));
                    }
                    const aprobador = this.props.aprobadoresSolicitud.find(x => x.RolResponsableId === solicitud.RolSolicitanteId);
                    if (aprobador) {
                        destinatario = aprobador.AutorizadorAdministradorBovedaEmail;
                        if (destinatario !== null && destinatario !== "") {
                            tags = [
                                { Key: "{folio}", Value: solicitud.Folio },
                                { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                                { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=Edit` }
                            ];
                            notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.SolicitudPrestamoAprobada, tags));
                        }
                    }
                }
            }

            else if (solicitud.EstatusId === EstatusSolicitudes.Rechazada.id) {
                if (solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id || solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
                    destinatario = solicitud.ResponsableEmail;
                    if (destinatario !== null && destinatario !== "") {
                        tags = [
                            { Key: "{folio}", Value: solicitud.Folio },
                            { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                            { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=Edit` }
                        ];
                        notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.SolicitudRechazadaBoveda, tags));
                    }
                }
            }

            else if (solicitud.EstatusId === EstatusSolicitudes.RevisionArea.id) {
                destinatario = solicitud.AsignadoEmail;
                if (destinatario !== null && destinatario !== "") {
                    tags = [
                        { Key: "{folio}", Value: solicitud.Folio },
                        { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                        { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=Edit` }
                    ];
                    notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.NuevaSolicitudPrestamoDireccionArea, tags));
                }
            }

            else if (solicitud.EstatusId === EstatusSolicitudes.RevisionDireccion.id) {
                destinatario = solicitud.AsignadoEmail;
                if (destinatario !== null && destinatario !== "") {
                    tags = [
                        { Key: "{folio}", Value: solicitud.Folio },
                        { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                        { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=Edit` }
                    ];
                    notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.NuevaSolicitudPrestamoDireccionBoveda, tags));
                }
            }

            else if (solicitud.EstatusId === EstatusSolicitudes.RechazadaArea.id || solicitud.EstatusId === EstatusSolicitudes.RechazadaDireccion.id) {
                destinatario = solicitud.SolicitanteEmail;
                if (destinatario !== null && destinatario !== "") {
                    tags = [
                        { Key: "{folio}", Value: solicitud.Folio },
                        { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                        { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=Edit` }
                    ];
                    notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.SolicitudPrestamoRechazada, tags));
                }

                const aprobador = this.props.aprobadoresSolicitud.find(x => x.RolResponsableId === solicitud.RolSolicitanteId);
                if (aprobador) {
                    destinatario = aprobador.AutorizadorAdministradorBovedaEmail;
                    if (destinatario !== null && destinatario !== "") {
                        tags = [
                            { Key: "{folio}", Value: solicitud.Folio },
                            { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                            { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=View` }
                        ];
                        notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.SolicitudPrestamoRechazada, tags));
                    }
                }
            }

            else if (solicitud.EstatusId === EstatusSolicitudes.Finalizada.id) {
                if (solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id || solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
                    destinatario = solicitud.ResponsableEmail;
                    if (destinatario !== null && destinatario !== "") {
                        tags = [
                            { Key: "{folio}", Value: solicitud.Folio },
                            { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                            { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=View` }
                        ];
                        notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.SolicitudFinalizada, tags));
                    }
                }
                else {
                    destinatario = solicitud.SolicitanteEmail;
                    if (destinatario !== null && destinatario !== "") {
                        tags = [
                            { Key: "{folio}", Value: solicitud.Folio },
                            { Key: "{sucursal}", Value: solicitud.SucursalDescripcion },
                            { Key: "{enlace}", Value: `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${solicitud.Id}&DisplayMode=View` }
                        ];
                        notificaciones.push(this.props.spNotificacionesService.enviarNotificacion(destinatario, TiposNotificacion.SolicitudPrestamoFinalizada, tags));
                    }
                }
            }

            Promise.all(notificaciones).then(() => {
                resolve(true);
            }).catch((Error) => {
                console.log("Error al enviar notificaciones de cambio de estatus de la solicitud.", Error);
                resolve(false);
            });
        });
    }

    private guardarCambiosHistorial = (tipoMovimiento: string): void => {

        const registroHistorial: Historial = new Historial();
        registroHistorial.FolioSolicitud = this.state.solicitud.Folio;
        registroHistorial.SolicitudId = this.state.solicitud.Id;
        registroHistorial.Estatus = this.state.solicitud.EstatusDescripcion;
        registroHistorial.FechaEntrada = new Date().toISOString();
        registroHistorial.FechaSalida = new Date().toISOString();
        registroHistorial.TipoMovimiento = tipoMovimiento;
        registroHistorial.Rol = this.props.datosUsuario.Rol.Title;
        registroHistorial.Responsable = this.props.datosUsuario.Nombre;

        if(tipoMovimiento === TiposMovimientoHistorial.CreacionSolicitudResguardo || tipoMovimiento === TiposMovimientoHistorial.CreacionSolicitudRenovacion || tipoMovimiento === TiposMovimientoHistorial.CreacionSolicitudPrestamo)
            registroHistorial.Comentarios = this.state.solicitud.Comentarios;
        else if (this.state.solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id && tipoMovimiento !== TiposMovimientoHistorial.CreacionSolicitudPrestamo)
            registroHistorial.Comentarios = this.state.solicitud.ComentariosFlujoAprobacion;
        else
            registroHistorial.Comentarios = "";

        let mensajeConfirmacion = "";

        if (tipoMovimiento === TiposMovimientoHistorial.CreacionSolicitudResguardo || tipoMovimiento === TiposMovimientoHistorial.CreacionSolicitudRenovacion || tipoMovimiento === TiposMovimientoHistorial.CreacionSolicitudPrestamo)
            mensajeConfirmacion = strings.MensajeConfirmacionCreacionSolicitud;
        else if (tipoMovimiento === TiposMovimientoHistorial.EnvioSolicitudRevisionBoveda)
            mensajeConfirmacion = strings.MensajeConfirmacionEnvioRevisionBoveda;
        else if (tipoMovimiento === TiposMovimientoHistorial.AprobacionAdministradorBoveda || tipoMovimiento === TiposMovimientoHistorial.AprobacionArea || tipoMovimiento === TiposMovimientoHistorial.AprobacionDireccionBoveda)
            mensajeConfirmacion = strings.MensajeConfirmacionAprobacion;
        else if (tipoMovimiento === TiposMovimientoHistorial.RechazoAdministradorBoveda || tipoMovimiento === TiposMovimientoHistorial.RechazoArea || tipoMovimiento === TiposMovimientoHistorial.RechazoDireccionBoveda)
            mensajeConfirmacion = strings.MensajeConfirmacionRechazo;
        else if (tipoMovimiento === TiposMovimientoHistorial.FinalizacionSolicitud)
            mensajeConfirmacion = strings.MensajeConfirmacionFinalizacion;
        else if (tipoMovimiento === TiposMovimientoHistorial.EnvioSolicitudArea)
            mensajeConfirmacion = strings.MensajeSolicitudEnviadaArea;
        else if (tipoMovimiento === TiposMovimientoHistorial.EnvioSolicitudDireccion)
            mensajeConfirmacion = strings.MensajeSolicitudEnviadaBoveda;

        this.props.spSolicitudBovedaService.insertarHistoricoSolicitud(registroHistorial).then(() => {
            this.terminarGuardado(mensajeConfirmacion);
        }).catch((error) => {
            console.log("Error al insertar movimiento en historial");
        });
    }

    private terminarGuardado = (mensajeConfirmacion: string): void => {
        this.setState({
            onItemSaved: true,
            showMessageBar: true,
            MessageBarType: MessageBarType.success,
            MessageBarText: mensajeConfirmacion,
            loading: false
        }, () => {
            if (this.state.solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id && this.state.solicitud.EstatusId === EstatusSolicitudes.Pendiente.id) {
                setTimeout(() => {
                    this.setState({ onItemSaved: false, showMessageBar: false, MessageBarText: "", MessageBarType: MessageBarType.info });
                    window.location.href = `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${this.state.solicitud.Id}&TipoSolicitud=Renovación&DisplayMode=Edit`;
                }, 500);
            }
            else {
                setTimeout(() => {
                    this.setState({ onItemSaved: false, showMessageBar: false, MessageBarText: "", MessageBarType: MessageBarType.info });
                    window.location.href = `${this.props.context.pageContext.web.absoluteUrl}/SitePages/DashboardSolicitudes.aspx`;
                }, 1500);
            }
        });
    }

    private onSeguimientoEstatusSolicitud = (envioBoveda: boolean, aprobacion: boolean, rechazo: boolean): void => {

        const solicitudData = { ...this.state.solicitud };
        const estatusActualId = this.state.solicitud.EstatusId;
        const tipoSolicitudId = this.state.solicitud.TipoSolicitudId;
        const flujoSiguienteEstatus = this.obtenerSiguienteEstatusSolicitud(estatusActualId, tipoSolicitudId, aprobacion, rechazo);
        const tipoMovimientoHistorial = this.obtenerTipoMovimientoHistorial(envioBoveda, aprobacion, rechazo);

        if (flujoSiguienteEstatus) {

            const validacionSolicitud = this.validarInformacionSolicitud(solicitudData, flujoSiguienteEstatus.SiguienteEstatus.Id);

            if (validacionSolicitud.SolicitudValida) {

                const archivosFisicosRequeridosLength: number = solicitudData.TiposDocumentoSolicitud.filter(x => x.RevisionFisico).length;

                if ((solicitudData.TipoSolicitudId === TiposSolicitud.Resguardo.id || solicitudData.TipoSolicitudId === TiposSolicitud.Renovacion.id) && Number(flujoSiguienteEstatus.SiguienteEstatus.Id) === EstatusSolicitudes.Aprobada.id && archivosFisicosRequeridosLength === 0) {
                    solicitudData.EstatusId = EstatusSolicitudes.Finalizada.id;
                    solicitudData.EstatusDescripcion = EstatusSolicitudes.Finalizada.titulo;
                    solicitudData.AsignadoId = null;
                    solicitudData.FinalizadaAutomatica = true;
                }
                else {

                    if ((solicitudData.EstatusId === EstatusSolicitudes.RevisionArea.id || solicitudData.EstatusId === EstatusSolicitudes.RechazadaArea.id) && solicitudData.ComentariosFlujoAprobacion !== "" && solicitudData.ComentariosFlujoAprobacion !== null) {
                        const historialComentarios = solicitudData.HistorialComentariosArea === null ? "" : solicitudData.HistorialComentariosArea;
                        solicitudData.HistorialComentariosArea = `✓ ${this.props.datosUsuario.Nombre} (${(new Date()).toLocaleString()}): ${solicitudData.ComentariosFlujoAprobacion} \r\n${historialComentarios}`;
                    }
                    else if ((solicitudData.EstatusId === EstatusSolicitudes.RevisionDireccion.id || solicitudData.EstatusId === EstatusSolicitudes.RechazadaDireccion.id) && solicitudData.ComentariosFlujoAprobacion !== "" && solicitudData.ComentariosFlujoAprobacion !== null) {
                        const historialComentarios = solicitudData.HistorialComentariosDireccion === null ? "" : solicitudData.HistorialComentariosDireccion;
                        solicitudData.HistorialComentariosDireccion = `✓ ${this.props.datosUsuario.Nombre} (${(new Date()).toLocaleString()}): ${solicitudData.ComentariosFlujoAprobacion} \r\n${historialComentarios}`;
                    }

                    solicitudData.EstatusId = flujoSiguienteEstatus.SiguienteEstatus.Id;
                    solicitudData.EstatusDescripcion = flujoSiguienteEstatus.SiguienteEstatus.Descripcion;

                    if (flujoSiguienteEstatus.Aprobador) {
                        solicitudData.AsignadoId = flujoSiguienteEstatus.Aprobador.Id;
                        solicitudData.AsignadoTitle = flujoSiguienteEstatus.Aprobador.Nombre;
                        solicitudData.AsignadoEmail = flujoSiguienteEstatus.Aprobador.Email;
                    }
                    else
                        solicitudData.AsignadoId = null;
                }

                this.props.spSolicitudBovedaService.actualizarEstatusSolicitud(solicitudData).then((result: number) => {
                    if (result > 0) {
                        this.setState({ solicitud: solicitudData }, () => {
                            this.notificarCambioEstatus(solicitudData).then(() => {
                                this.actualizarPropiedadesAdjuntosSolicitud(solicitudData).then(() => {
                                    this.guardarCambiosHistorial(tipoMovimientoHistorial);
                                })
                                    .catch((error) => {
                                        console.log("Ocurrio un error al actualizar los archivos de una solicitud autorizada o finalizada.", error);
                                    })
                            })
                                .catch((error) => {
                                    console.log("Ocurrió un error al notificar cambio de estatus de la solicitud", error);
                                });
                        });
                    }
                    else {
                        this.setState({
                            onItemSaved: false,
                            showMessageBar: true,
                            MessageBarType: MessageBarType.error,
                            MessageBarText: strings.MensajeErrorSeguimientoEstatus,
                            loading: false
                        });
                    }
                }).catch((error) => {
                    console.log("Error al actualizar el estatus de la solicitud", error);
                });
            }
            else {
                this.setState({
                    onItemSaved: false,
                    showMessageBar: true,
                    MessageBarType: MessageBarType.error,
                    MessageBarText: validacionSolicitud.MensajeError,
                    loading: false
                });
            }
        }
    }

    private obtenerSiguienteEstatusSolicitud = (estatusActualId: number, tipoSolicitudId: number, aprobacion: boolean, rechazo: boolean): any => {

        const flujoSiguienteEstatus: any = {};
        const siguienteEstatus: any = {};
        let aprobador: Usuario = null;

        const catalogoFlujos = [...this.props.listadoFlujosEstatus];
        const configuracionSiguienteEstatus = catalogoFlujos.find(x => x.EstatusActualId === estatusActualId && x.TipoSolicitudId === tipoSolicitudId);

        if (configuracionSiguienteEstatus) {
            if (aprobacion) {
                siguienteEstatus.Id = configuracionSiguienteEstatus.SiguienteEstatusAprobacionId;
                siguienteEstatus.Descripcion = configuracionSiguienteEstatus.SiguienteEstatusAprobacionDescripcion;
            }
            else if (rechazo) {
                siguienteEstatus.Id = configuracionSiguienteEstatus.SiguienteEstatusRechazoId;
                siguienteEstatus.Descripcion = configuracionSiguienteEstatus.SiguienteEstatusRechazoDescripcion;
            }
        }
        if (estatusActualId !== siguienteEstatus.Id)
            aprobador = this.obtenerAprobador(siguienteEstatus.Id);

        flujoSiguienteEstatus.SiguienteEstatus = siguienteEstatus;
        flujoSiguienteEstatus.Aprobador = aprobador;

        return flujoSiguienteEstatus;
    }

    private obtenerAprobador = (siguienteEstatusId: number): Usuario => {
        let aprobador: Usuario = null;
        const solicitud = { ...this.state.solicitud };
        const aprobadoresSolicitudes: AprobadoresSolicitudes[] = [...this.props.aprobadoresSolicitud];
        const datosUsuario = this.props.datosUsuario;

        if (solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id || solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
            if (siguienteEstatusId === EstatusSolicitudes.Revision.id || siguienteEstatusId === EstatusSolicitudes.Aprobada.id) {
                if (solicitud.RolResponsableId === Roles.AdministradorBoveda.id) {
                    aprobador = {
                        Id: solicitud.ResponsableId,
                        Nombre: solicitud.ResponsableTitle,
                        Email: solicitud.ResponsableEmail
                    }
                }
                else {
                    const aprobadorSolicitud = aprobadoresSolicitudes.find(x => x.RolResponsableId === solicitud.RolResponsableId);
                    if (aprobadorSolicitud) {
                        aprobador = {
                            Id: aprobadorSolicitud.AutorizadorAdministradorBovedaId,
                            Nombre: aprobadorSolicitud.AutorizadorAdministradorBovedaTitle,
                            Email: aprobadorSolicitud.AutorizadorAdministradorBovedaEmail
                        }
                    }
                }
            }
        }
        else if (solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id) {
            const aprobadorSolicitud = aprobadoresSolicitudes.find(x => x.RolResponsableId === solicitud.RolSolicitanteId);
            if (aprobadorSolicitud) {
                switch (siguienteEstatusId) {
                    case EstatusSolicitudes.RevisionArea.id:
                        if(solicitud.RolSolicitanteId === Roles.GerenteSucursal.id && datosUsuario.DireccionArea.Id > 0)
                            aprobador = {
                                Id: datosUsuario.DireccionArea.Id,
                                Nombre: datosUsuario.DireccionArea.Nombre,
                                Email: datosUsuario.DireccionArea.Email
                            }
                        else
                            aprobador = {
                                Id: aprobadorSolicitud.AutorizadorAreaId,
                                Nombre: aprobadorSolicitud.AutorizadorAreaTitle,
                                Email: aprobadorSolicitud.AutorizadorAreaEmail
                            }
                        break;
                    case EstatusSolicitudes.RevisionDireccion.id:
                        aprobador = {
                            Id: aprobadorSolicitud.AutorizadorDireccionBovedaId,
                            Nombre: aprobadorSolicitud.AutorizadorDireccionBovedaTitle,
                            Email: aprobadorSolicitud.AutorizadorDireccionBovedaEmail
                        }
                        break;
                    case EstatusSolicitudes.Aprobada.id:
                        aprobador = {
                            Id: aprobadorSolicitud.AutorizadorAdministradorBovedaId,
                            Nombre: aprobadorSolicitud.AutorizadorAdministradorBovedaTitle,
                            Email: aprobadorSolicitud.AutorizadorAdministradorBovedaEmail
                        }
                        break;
                }
            }
        }
        return aprobador;
    }

    private obtenerTipoMovimientoHistorial = (envioBoveda: boolean, aprobacion: boolean, rechazo: boolean): string => {
        const { solicitud, datosUsuario } = this.props;

        let tipoMovimientoHistorial = "";
        if (envioBoveda)
            tipoMovimientoHistorial = TiposMovimientoHistorial.EnvioSolicitudRevisionBoveda;
        else if (aprobacion && datosUsuario.Rol.Id === Roles.AdministradorBoveda.id && solicitud.EstatusId === EstatusSolicitudes.Revision.id)
            tipoMovimientoHistorial = TiposMovimientoHistorial.AprobacionAdministradorBoveda;
        else if (aprobacion && datosUsuario.Rol.Id === Roles.AdministradorBoveda.id && solicitud.EstatusId === EstatusSolicitudes.Aprobada.id)
            tipoMovimientoHistorial = TiposMovimientoHistorial.FinalizacionSolicitud;
        else if (rechazo && datosUsuario.Rol.Id === Roles.AdministradorBoveda.id)
            tipoMovimientoHistorial = TiposMovimientoHistorial.RechazoAdministradorBoveda;
        else if (aprobacion && solicitud.EstatusId === EstatusSolicitudes.RevisionArea.id)
            tipoMovimientoHistorial = TiposMovimientoHistorial.AprobacionArea;
        else if (aprobacion && solicitud.EstatusId === EstatusSolicitudes.RevisionDireccion.id)
            tipoMovimientoHistorial = TiposMovimientoHistorial.AprobacionDireccionBoveda;
        else if (rechazo && solicitud.EstatusId === EstatusSolicitudes.RevisionArea.id)
            tipoMovimientoHistorial = TiposMovimientoHistorial.RechazoArea;
        else if (aprobacion && solicitud.EstatusId === EstatusSolicitudes.RechazadaArea.id)
            tipoMovimientoHistorial = TiposMovimientoHistorial.EnvioSolicitudArea;
        else if (rechazo && solicitud.EstatusId === EstatusSolicitudes.RevisionDireccion.id)
            tipoMovimientoHistorial = TiposMovimientoHistorial.RechazoDireccionBoveda;
        else if (aprobacion && solicitud.EstatusId === EstatusSolicitudes.RechazadaDireccion.id)
            tipoMovimientoHistorial = TiposMovimientoHistorial.EnvioSolicitudDireccion;
        return tipoMovimientoHistorial;
    }

    private validarInformacionSolicitud = (solicitudData: SolicitudBoveda, siguienteEstatusId: number): any => {

        const resultValidacionSolicitud: any = { SolicitudValida: true, MensajeError: "" };
        const tiposDocumentoRelacionados: TiposDocumentoSolicitud[] = solicitudData.TiposDocumentoSolicitud;
        const archivosAdjuntos: DocumentoBoveda[] = solicitudData.Archivos.Files;

        if (solicitudData.TipoSolicitudId === TiposSolicitud.Resguardo.id) {
            if (siguienteEstatusId === EstatusSolicitudes.Revision.id) {

                const tiposDocumentoAplicaResguardo = tiposDocumentoRelacionados.filter(x => x.AplicaResguardo);

                if (archivosAdjuntos.length < tiposDocumentoAplicaResguardo.length) {
                    resultValidacionSolicitud.SolicitudValida = false;
                    resultValidacionSolicitud.MensajeError = "Debe adjuntar un documento para cada tipo de documento que aplica resguardo.";
                    return resultValidacionSolicitud;
                }

                for (let i = 0; i < tiposDocumentoRelacionados.length; i++) {
                    const tipoDocumento = tiposDocumentoRelacionados[i];
                    if (tipoDocumento.AplicaResguardo) {
                        if (tipoDocumento.DocumentoId === 0) {
                            resultValidacionSolicitud.SolicitudValida = false;
                            resultValidacionSolicitud.MensajeError = "Debe adjuntar un documento para cada tipo de documento que aplica resguardo.";
                            break;
                        }
                        if (tipoDocumento.Expira && tipoDocumento.FechaVencimiento === null && !tipoDocumento.Confidencial) {
                            resultValidacionSolicitud.SolicitudValida = false;
                            resultValidacionSolicitud.MensajeError = "Debe asignar una fecha de Vencimiento para cada tipo de documento que aplica resguardo y que expira.";
                            break;
                        }
                        if (tipoDocumento.CondicionDocumentoId === 0) {
                            resultValidacionSolicitud.SolicitudValida = false;
                            resultValidacionSolicitud.MensajeError = "Debe asignar una condición para cada tipo de documento que aplica resguardo.";
                            break;
                        }
                    }
                    else {
                        if (tipoDocumento.ComentariosResponsable === "") {
                            resultValidacionSolicitud.SolicitudValida = false;
                            resultValidacionSolicitud.MensajeError = "Debe agregar un comentario para cada tipo de documento que no aplica resguardo.";
                            break;
                        }
                    }
                }
            }
            else if (siguienteEstatusId === EstatusSolicitudes.Aprobada.id || siguienteEstatusId === EstatusSolicitudes.Rechazada.id) {
                for (let i = 0; i < tiposDocumentoRelacionados.length; i++) {
                    const tipoDocumento = tiposDocumentoRelacionados[i];
                    if (tipoDocumento.EstatusRevisionId === 0 || tipoDocumento.EstatusRevisionId === null) {
                        resultValidacionSolicitud.SolicitudValida = false;
                        resultValidacionSolicitud.MensajeError = "Debe asignar un estatus de revisión para cada tipo de documento.";
                        break;
                    }
                    else if (tipoDocumento.EstatusRevisionId === EstatusRevisionDocumento.Rechazado.id) {
                        if (tipoDocumento.ComentariosAdministradorBoveda === "") {
                            resultValidacionSolicitud.SolicitudValida = false;
                            resultValidacionSolicitud.MensajeError = "Debe agregar comentarios para aquellos tipos de documento rechazados.";
                            break;
                        }
                        if (siguienteEstatusId === EstatusSolicitudes.Aprobada.id) {
                            resultValidacionSolicitud.SolicitudValida = false;
                            resultValidacionSolicitud.MensajeError = "Todos los tipos de documento deben estar aprobados para poder aprobar la solicitud.";
                            break;
                        }
                    }
                }
            }

        }
        else
            if (solicitudData.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
                if (siguienteEstatusId === EstatusSolicitudes.Revision.id) {
                    if (archivosAdjuntos.length === 0) {
                        resultValidacionSolicitud.SolicitudValida = false;
                        resultValidacionSolicitud.MensajeError = "Debe adjuntar al menos un documento a renovar.";
                        return resultValidacionSolicitud;
                    }
                }
                else
                    if (siguienteEstatusId === EstatusSolicitudes.Aprobada.id || siguienteEstatusId === EstatusSolicitudes.Rechazada.id) {
                        for (let i = 0; i < tiposDocumentoRelacionados.length; i++) {
                            const tipoDocumento = tiposDocumentoRelacionados[i];
                            if (tipoDocumento.EstatusRevisionId === 0 || tipoDocumento.EstatusRevisionId === null) {
                                resultValidacionSolicitud.SolicitudValida = false;
                                resultValidacionSolicitud.MensajeError = "Debe asignar un estatus de revisión para cada tipo de documento.";
                                return resultValidacionSolicitud;
                            }
                            else if (tipoDocumento.EstatusRevisionId === EstatusRevisionDocumento.Rechazado.id) {
                                if (tipoDocumento.ComentariosAdministradorBoveda === "") {
                                    resultValidacionSolicitud.SolicitudValida = false;
                                    resultValidacionSolicitud.MensajeError = "Debe agregar comentarios para aquellos tipos de documento rechazados.";
                                    return resultValidacionSolicitud;
                                }
                                if (siguienteEstatusId === EstatusSolicitudes.Aprobada.id) {
                                    resultValidacionSolicitud.SolicitudValida = false;
                                    resultValidacionSolicitud.MensajeError = "Todos los tipos de documento deben estar aprobados para poder aprobar la solicitud.";
                                    return resultValidacionSolicitud;
                                }
                            }
                        }
                    }
            }
            else
                if (solicitudData.TipoSolicitudId === TiposSolicitud.Prestamo.id && (siguienteEstatusId === EstatusSolicitudes.RechazadaArea.id || siguienteEstatusId === EstatusSolicitudes.RechazadaDireccion.id)) {
                    if (solicitudData.ComentariosFlujoAprobacion === "") {
                        resultValidacionSolicitud.SolicitudValida = false;
                        resultValidacionSolicitud.MensajeError = "Debe agregar comentarios con el motivo de rechazo.";
                        return resultValidacionSolicitud;
                    }
                }
        return resultValidacionSolicitud;
    }

    /* Funciones relacionadas al componente GridDocumentos */

    public actualizarTiposDocumentosSolicitud = (tipoDocumentoActualizado: TiposDocumentoSolicitud, archivoRelacionado?: DocumentoBoveda, guardarSeguimientoSolicitud?: boolean): void => {

        const solicitud: SolicitudBoveda = { ...this.state.solicitud };
        const tiposDocumentosSolicitud = [...this.state.solicitud.TiposDocumentoSolicitud];
        const archivosSolicitud = { ...this.state.solicitud.Archivos };

        const tipoDocumentoActualizadoIndex = tiposDocumentosSolicitud.findIndex((object: TiposDocumentoSolicitud) => {
            return object.TipoDocumentoConsecutivo === tipoDocumentoActualizado.TipoDocumentoConsecutivo;
        });

        if (tipoDocumentoActualizadoIndex !== -1) {
            tiposDocumentosSolicitud[tipoDocumentoActualizadoIndex] = tipoDocumentoActualizado;
        }

        if (archivoRelacionado) {
            const archivoRelacionadoIndex = archivosSolicitud.Files.findIndex((object: DocumentoBoveda) => {
                return object.TipoDocumentoConsecutivo === archivoRelacionado.TipoDocumentoConsecutivo;
            });
            if (archivoRelacionadoIndex !== -1) {
                archivosSolicitud.Files[archivoRelacionadoIndex] = archivoRelacionado;
            }
        }

        if (guardarSeguimientoSolicitud) {
            this.props.spSolicitudBovedaService.actualizarSeguimientoChecklist(solicitud.Id, tipoDocumentoActualizado, archivoRelacionado).then((result) => {
                this.setState({ solicitud: { ...this.state.solicitud, TiposDocumentoSolicitud: [...tiposDocumentosSolicitud], Archivos: { ...archivosSolicitud } } });
            }).catch((error) => {
                console.log("Error al actualizar seguimiento en checklist ", error);
            });
        }
        else
            this.setState({ solicitud: { ...this.state.solicitud, TiposDocumentoSolicitud: [...tiposDocumentosSolicitud], Archivos: { ...archivosSolicitud } } });
    }

    public onSolicitarResgardoDocumentos = (solicitarTodos: boolean): any => {
        const tiposDocumentosSolicitud: TiposDocumentoSolicitud[] = [...this.state.solicitud.TiposDocumentoSolicitud];
        tiposDocumentosSolicitud.forEach(element => {
            element.SolicitarResguardo = solicitarTodos;
        });
        this.setState({ solicitud: { ...this.state.solicitud, TiposDocumentoSolicitud: [...tiposDocumentosSolicitud] } });
    }

    /* Funciones relacionadas a adjuntos */

    private onAgregarArchivo = (file: any): void => {

        const item: SolicitudBoveda = { ...this.state.solicitud };
        const updateFileData = this.onAgregarArchivos(file, item.Archivos);
        item.Archivos = updateFileData;

        this.props.spSolicitudBovedaService.actualizarAdjuntos(item).then((result) => {
            const filtroDocsSolicitud = `SolicitudId eq ${item.Id} and DocumentoCargadoAplicativo eq ${comparadorBoleano.verdadero}`;
            this.props.spSolicitudBovedaService.obtenerDocumentosPorFiltro(filtroDocsSolicitud).then((resultAdjuntos) => {
                item.Archivos.Files = resultAdjuntos;
                item.Archivos.ToDelete = [];
                item.Archivos.ToUpload = [];
                this.setState({ solicitud: { ...this.state.solicitud, Archivos: { ...item.Archivos } } });
            }).catch((error) => {
                console.log("Error al obtener adjuntos de una solicitud", error);
            })
        }).catch((error) => {
            console.log("Error el actualizar adjuntos de la solicitud", error);
        });
    }

    private onEliminarArchivo = (fileName: any): void => {

        //Se elimina archivo
        const item: SolicitudBoveda = { ...this.state.solicitud };
        const adjuntos = item.Archivos;
        const files = adjuntos.Files;
        const toDelete = adjuntos.ToDelete;
        let index = -1;
        for (let i = 0; i < files.length; i++) {
            if (files[i].FileName === fileName) {
                toDelete.push(files[i].Id);
                index = i;
                break;
            }
        }
        if (index >= 0) {
            files.splice(index, 1);
            adjuntos.Files = files;
            adjuntos.ToDelete = toDelete;
            item.Archivos = adjuntos;
        }

        this.props.spSolicitudBovedaService.actualizarAdjuntos(item).then((result) => {
            const filtroDocsSolicitud = `SolicitudId eq ${item.Id} and DocumentoCargadoAplicativo eq ${comparadorBoleano.verdadero}`;
            this.props.spSolicitudBovedaService.obtenerDocumentosPorFiltro(filtroDocsSolicitud).then((resultAdjuntos) => {
                item.Archivos.Files = resultAdjuntos;
                this.setState({ solicitud: { ...this.state.solicitud, Archivos: { ...item.Archivos } } });
            }).catch((error) => {
                console.log("Error al obtener adjuntos de una solicitud", error);
            })
        }).catch((error) => {
            console.log("Error el actualizar adjuntos de la solicitud", error);
        });
    }

    private onAgregarArchivos(file: any, currentFiles: AttachmentData): AttachmentData {

        const fileData = currentFiles;
        const files = fileData.Files;
        const toUpload = fileData.ToUpload;

        // si el archivo ya existia en los guardados, agregarlo al arreglo de eliminacion
        if (files.filter(currentItem => currentItem.FileName.toUpperCase() === file.name.toUpperCase()).length > 0) {
            console.log("Error. Ya existe un archivo con el mismo nombre.");
        }
        else {
            // Si el archivo ya fue agregado, que no se duplique
            if (toUpload.filter(currentItem => currentItem.name.toUpperCase() === file.name.toUpperCase()).length === 0) {
                toUpload.push(file);
            }
            fileData.Files = files;
            fileData.ToUpload = toUpload;
        }
        return fileData;
    }

    private actualizarPropiedadesAdjuntosSolicitud = (solicitud: SolicitudBoveda): Promise<boolean> => {
        return new Promise<boolean>((resolve): void => {

            const promises: any[] = [];
            
            if (solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id) {
                if (solicitud.EstatusId === EstatusSolicitudes.Aprobada.id) {
                    let archivosPorPrestar: DocumentoBoveda[] = [];
                    const filtroDocsSucursal = `SucursalId eq ${solicitud.SucursalId} and UltimaVersion eq ${comparadorBoleano.verdadero} and TipoDocumentoConsecutivo ne null and DocumentoCargadoAplicativo eq ${comparadorBoleano.verdadero}`;
                    this.props.spSolicitudBovedaService.obtenerAsuetos().then(resultAsuetos => {
                        const tiposDocSolicitud = [...solicitud.TiposDocumentoSolicitud];
                        tiposDocSolicitud.forEach(x => {
                            x.FechaDevolucionDocumentoOriginal = addDaysWithoutWeekendsAndHolidays(resultAsuetos, x.DiasPrestamo).toISOString();
                        });
                        this.props.spSolicitudBovedaService.actualizarTiposDocumentoSolicitud(solicitud.Id, solicitud.TiposDocumentoSolicitud).then(() => {
                            this.props.spSolicitudBovedaService.obtenerDocumentosPorFiltro(filtroDocsSucursal).then(archivosSucursal => {
                                archivosPorPrestar = [...archivosSucursal].filter(x => solicitud.TiposDocumentoSolicitud.some(y => x.TipoDocumentoConsecutivo === y.TipoDocumentoConsecutivo));
                                archivosPorPrestar.forEach(adjunto => {
                                    adjunto.DocumentoFisicoPrestado = true;
                                    adjunto.DocumentoFisicoPrestadoAId = solicitud.SolicitanteId;
                                });

                                if (archivosPorPrestar.length > 0)
                                    promises.push(this.props.spSolicitudBovedaService.actualizarItemsAdjuntosSolicitud(archivosPorPrestar));
                            }).catch((error) => {
                                console.log("Error al obtener los documentos", error);
                            });
                        }).catch((error) => {
                            console.log("Error al obtener los documentos", error);
                        });

                    }).catch((error) => {
                        console.log("Error al obtener los asuetos", error);
                    });
                }
                else if (solicitud.EstatusId === EstatusSolicitudes.Finalizada.id) {
                    let archivosPorHabilitar: DocumentoBoveda[] = [];
                    const filtroDocsSucursal = `SucursalId eq ${solicitud.SucursalId} and UltimaVersion eq ${comparadorBoleano.verdadero} and TipoDocumentoConsecutivo ne null and DocumentoCargadoAplicativo eq ${comparadorBoleano.verdadero}`;
                    this.props.spSolicitudBovedaService.obtenerDocumentosPorFiltro(filtroDocsSucursal).then(archivosSucursal => {
                        archivosPorHabilitar = [...archivosSucursal].filter(x => this.props.solicitud.TiposDocumentoSolicitud.some(y => x.TipoDocumentoConsecutivo === y.TipoDocumentoConsecutivo));
                        archivosPorHabilitar.forEach(adjunto => {
                            adjunto.DocumentoFisicoPrestado = false;
                            adjunto.DocumentoFisicoPrestadoAId = null;
                        });

                        if (archivosPorHabilitar.length > 0)
                            promises.push(this.props.spSolicitudBovedaService.actualizarItemsAdjuntosSolicitud(archivosPorHabilitar));
                    }).catch((error) => {
                        console.log("Error al obtener los documentos", error);
                    });
                }
                else if (solicitud.EstatusId === EstatusSolicitudes.RevisionArea.id || solicitud.EstatusId === EstatusSolicitudes.RevisionDireccion.id)
                    promises.push(this.props.spSolicitudBovedaService.actualizarTiposDocumentoSolicitud(solicitud.Id, solicitud.TiposDocumentoSolicitud));
            }

            Promise.all(promises).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
    }

    private obtenerEmailResponsable = (rolIdResponsableId: number, responsableUserId: number): string => {

        let emailResponsable: string = "";
        let responsable: ISiteUserInfo = null;

        if (rolIdResponsableId === Roles.GerenteConstruccion.id) {
            responsable = this.props.listadoGerentesConstruccion.find(x => x.Id === responsableUserId);
            if (responsable)
                emailResponsable = responsable.Email;
        }
        else if (rolIdResponsableId === Roles.GerenteSucursal.id) {
            responsable = this.props.listadoGerentesSucursal.find(x => x.Id === responsableUserId);
            if (responsable)
                emailResponsable = responsable.Email;
        }
        else if (rolIdResponsableId === Roles.JuridicoAdministrativo.id) {
            responsable = this.props.listadoJuridicosAdministrativo.find(x => x.Id === responsableUserId);
            if (responsable)
                emailResponsable = responsable.Email;
        }
        else if (rolIdResponsableId === Roles.JuridicoInmuebles.id) {
            responsable = this.props.listadoJuridicosInmuebles.find(x => x.Id === responsableUserId);
            if (responsable)
                emailResponsable = responsable.Email;
        }
        else if (rolIdResponsableId === Roles.AdministradorBoveda.id) {
            responsable = this.props.listadoAdministradoresBoveda.find(x => x.Id === responsableUserId);
            if (responsable)
                emailResponsable = responsable.Email;
        }
        return emailResponsable;
    }
    public render(): React.ReactElement<IFormularioSolicitudProps> {
        const listadoSucursales = mapListToDropDownItems([...this.props.listadoSucursales], true);
        return (
            <div>
                {this.state.loading ? <Spinner size={SpinnerSize.large} /> :
                    <div>
                        <div className={styles.formularioSolicitud}>
                            <Label className={styles.title}>Bóveda - Solicitud de {this.state.solicitud.TipoSolicitudDescripcion.toLocaleLowerCase()} de documentos</Label>
                            <GeneralMessageBar display={this.state.showMessageBar} message={this.state.MessageBarText} type={this.state.MessageBarType} />
                            <div style={{ display: this.state.displayPermissionsHelper ? "none" : "block" }}>
                                <BarraControles
                                    datosUsuario={this.props.datosUsuario}
                                    displayMode={this.props.displayMode}
                                    onGoBack={this.regresarAnterior}
                                    onCrearSolicitud={this.crearSolicitud}
                                    onSeguimientoEstatusSolicitud={this.onSeguimientoEstatusSolicitud}
                                    solicitud={this.state.solicitud}
                                />

                                <div style={{ display: this.state.solicitud.Id > 0 ? "block" : "none" }} >
                                    <h2 className={styles.subTitleSection}>
                                        <span className={styles.subTitleSectionLabel}>Información general</span>
                                    </h2>
                                    <div className={styles.row}>
                                        <div className={styles.column}>
                                            <TextField
                                                title="folio"
                                                label="Folio"
                                                value={this.state.solicitud.Folio}
                                                hidden={false}
                                                disabled={true}
                                            />
                                        </div>
                                        <div className={styles.column}>
                                            <TextField
                                                title="fechaCreacion"
                                                label="Fecha de creación"
                                                value={moment(this.state.solicitud.FechaCreacion, moment.ISO_8601).format("DD/MM/YYYY hh:mm a")}
                                                hidden={false}
                                                disabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.column}>
                                            <TextField
                                                title="estatus"
                                                label="Estatus"
                                                value={this.state.solicitud.EstatusDescripcion}
                                                hidden={false}
                                                disabled={true}
                                            />
                                        </div>
                                        <div className={styles.column}>
                                            <TextField
                                                title="solicitante"
                                                label="Nombre de quien captura"
                                                value={this.state.solicitud.SolicitanteTitle}
                                                hidden={false}
                                                disabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <h2 className={styles.subTitleSection}>
                                    <span className={styles.subTitleSectionLabel}>Datos de la solicitud</span>
                                </h2>
                                <div className={styles.row}>
                                    <div className={styles.column}>
                                        <ComboBox
                                            title="sucursal"
                                            label="Sucursal"
                                            options={listadoSucursales}
                                            onChange={this.modificarValorCampoSucursal}
                                            defaultSelectedKey={this.state.solicitud.SucursalId}
                                            placeholder="Seleccione una opción"
                                            hidden={this.props.fieldsState.sucursal.hide}
                                            disabled={this.props.fieldsState.sucursal.disable}
                                            errorMessage={this.state.fieldsStatusError.field.sucursal.error ? this.state.fieldsStatusError.field.sucursal.mensajeError : ""}
                                            required
                                        />
                                    </div>
                                    <div className={styles.column}>
                                        <TextField
                                            title="estado"
                                            label="Estado"
                                            value={this.state.solicitud.EstadoDescripcion}
                                            hidden={false}
                                            disabled={true}
                                        />
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.column}>
                                        <TextField
                                            title="ciudad"
                                            label="Ciudad"
                                            value={this.state.solicitud.CiudadDescripcion}
                                            hidden={false}
                                            disabled={true}
                                        />
                                    </div>

                                    <div className={styles.column}>
                                        <TextField
                                            title="formato"
                                            label="Formato"
                                            value={this.state.solicitud.FormatoSucursalDescripcion}
                                            hidden={false}
                                            disabled={true}
                                        />
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.column}
                                        style={{ display: this.props.fieldsState.rolResponsable.hide ? "none" : "block" }}
                                    >
                                        <Dropdown
                                            title={"rolResponsable"}
                                            label='Rol del responsable'
                                            onChange={this.modificarValorCampoRol}
                                            placeholder="Seleccione una opción"
                                            options={this.props.listadoRolesResponsables}
                                            defaultSelectedKey={this.state.solicitud.RolResponsableId}
                                            hidden={this.props.fieldsState.rolResponsable.hide}
                                            disabled={this.props.fieldsState.rolResponsable.disable}
                                            errorMessage={this.state.fieldsStatusError.field.rolResponsable.error ? this.state.fieldsStatusError.field.rolResponsable.mensajeError : ""}
                                            required

                                        />
                                    </div>
                                    <div className={styles.column}
                                        style={{ display: this.props.fieldsState.responsable.hide ? "none" : "block" }}
                                    >
                                        <Dropdown
                                            title={"responsable"}
                                            label='Responsable'
                                            onChange={this.modificarValorCampoResponsable}
                                            placeholder="Seleccione una opción"
                                            options={this.state.usuariosResponsables}
                                            defaultSelectedKey={this.state.solicitud.ResponsableId}
                                            hidden={this.props.fieldsState.responsable.hide}
                                            disabled={this.props.fieldsState.responsable.disable}
                                            errorMessage={this.state.fieldsStatusError.field.responsable.error ? this.state.fieldsStatusError.field.responsable.mensajeError : ""}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.column}
                                        style={{ display: this.props.fieldsState.fechaCompromiso.hide ? "none" : "block" }}
                                    >
                                        <DatePicker
                                            title="fechaCompromiso"
                                            label="Fecha compromiso"
                                            firstDayOfWeek={DayOfWeek.Sunday}
                                            placeholder="Fecha compromiso"
                                            strings={cadenasEspanol}
                                            formatDate={onFormatDate}
                                            onSelectDate={this.onFechaCompromisoChange}
                                            value={new Date(this.state.solicitud.FechaCompromiso)}
                                            hidden={this.props.fieldsState.fechaCompromiso.hide}
                                            disabled={this.props.fieldsState.fechaCompromiso.disable}
                                            isRequired={true}
                                            minDate={new Date()}
                                        />
                                    </div>
                                    <div className={styles.column}
                                        style={{ display: this.props.fieldsState.comentarios.hide ? "none" : "block" }}
                                    >
                                        <TextField
                                            title='Comentarios'
                                            label="Comentarios"
                                            multiline rows={5}
                                            onChange={this.modificarValorCampoComentarios}
                                            value={this.state.solicitud.Comentarios}
                                            hidden={this.props.fieldsState.comentarios.hide}
                                            disabled={this.props.fieldsState.comentarios.disable}
                                            errorMessage={this.state.fieldsStatusError.field.comentarios.error ? this.state.fieldsStatusError.field.comentarios.mensajeError : ""}
                                            required={this.props.solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id}
                                        />
                                    </div>
                                    <div className={styles.column}
                                        style={{ display: this.props.fieldsState.comentariosFlujoAprobacion.hide ? "none" : "block" }}
                                    >
                                        <TextField
                                            title='ComentariosFlujoAprobacion'
                                            label="Comentarios del seguimiento"
                                            multiline rows={5}
                                            onChange={this.modificarValorCampoComentarios}
                                            value={this.state.solicitud.ComentariosFlujoAprobacion}
                                            hidden={this.props.fieldsState.comentariosFlujoAprobacion.hide}
                                            disabled={this.props.fieldsState.comentariosFlujoAprobacion.disable}
                                        />
                                    </div>
                                </div>
                                <div className={styles.row} style={{ display: this.props.fieldsState.historialComentariosArea.hide ? "none" : "block" }}>
                                    <TextField
                                        title='HistorialComentarios'
                                        label="Historial de comentarios de dirección de área"
                                        multiline rows={10}
                                        defaultValue={this.state.solicitud.HistorialComentariosArea}
                                        disabled
                                    />
                                </div>
                                <div className={styles.row} style={{ display: this.props.fieldsState.historialComentariosDireccion.hide ? "none" : "block" }}>
                                    <TextField
                                        title='HistorialComentarios'
                                        label="Historial de comentarios de dirección de bóveda"
                                        multiline rows={10}
                                        defaultValue={this.state.solicitud.HistorialComentariosDireccion}
                                        disabled
                                    />
                                </div>
                            </div>
                            <h2 className={styles.subTitleSection}>
                                <span className={styles.subTitleSectionLabel}>Documentación</span>
                            </h2>
                            <GridDocumentos
                                condicionesDocumento={this.props.condicionesDocumento}
                                context={this.props.context}
                                datosUsuario={this.props.datosUsuario}
                                displayMode={this.props.displayMode}
                                estatusRevisionDocumento={this.props.estatusRevisionDocumento}
                                onActualizarTiposDocumentosSolicitud={this.actualizarTiposDocumentosSolicitud}
                                onAgregarArchivo={this.onAgregarArchivo}
                                onEliminarArchivo={this.onEliminarArchivo}
                                onSolicitarResgardoDocumentos={this.onSolicitarResgardoDocumentos}
                                solicitud={this.state.solicitud}
                                tiposDocumentos={this.props.listadoTiposDocumento}
                            />
                        </div>
                    </div>}
            </div>
        );
    }
}