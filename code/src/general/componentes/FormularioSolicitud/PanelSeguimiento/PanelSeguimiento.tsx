import * as React from "react";
import { Checkbox, DatePicker, DayOfWeek, TextField, IDropdownOption, Dropdown, Panel, PrimaryButton, DefaultButton, PanelType } from '@fluentui/react';
import { Attachments } from "../../Attachments/Attachments";
import { SolicitudBoveda, TiposDocumentoSolicitud, TiposSolicitud, cadenasEspanol, EstatusSolicitudes, EstatusRevisionDocumento } from "../../../data/entities";
import styles from './PanelSeguimiento.module.scss';
import { onFormatDate } from '../../../helpers/HelperGeneral';
import GeneralActivityItem from "../../GeneralActivityItem/GeneralActivityItem";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IPanelSeguimientoProps {
    condicionesDocumento: IDropdownOption[];
    context: WebPartContext;
    displayMode: string;
    estatusRevisionDocumento: IDropdownOption[];
    fieldsModalAttachmentState: any;
    itemSeleccionado: TiposDocumentoSolicitud;
    modificarValorCheckbox(e: any, valor: any): any;
    modificarValorFiltroDropdDown(e: any, selectedOption: any): any;
    modificarValorCampoTexto(e: any, valor: any): any;
    onAceptar(): any;
    onAgregarArchivo(file: any): any;
    onEliminarArchivo(fileName: any): any;
    onCancelar(): any;
    onModificarValorFechaVencimiento(date: Date): any;
    showDialog: boolean;
    solicitud: SolicitudBoveda;
}

export interface IPanelSeguimientoState {
    fieldsStatusError: any;
}

const buttonStyles = { root: { marginRight: 8 } };

export default class PanelSeguimiento extends React.Component<IPanelSeguimientoProps, IPanelSeguimientoState> {
    constructor(props: IPanelSeguimientoProps) {
        super(props);
        this.state = {
            fieldsStatusError: {
                validForm: true,
                field: {
                    adjuntos: { error: false, mensajeError: "" },
                    condicion: { error: false, mensajeError: "" },
                    comentariosResponsable: { error: false, mensajeError: "" },
                    comentariosAdministradorBoveda: { error: false, mensajeError: "" },
                    estatusRevision: { error: false, mensajeError: "" }
                }
            }
        }
    }

    private onAgregar = (file: any): void => {
        file.TipoDocumentoId = this.props.itemSeleccionado.TipoDocumentoId;
        file.TipoDocumentoDescripcion = this.props.itemSeleccionado.TipoDocumentoTitle;
        file.TipoDocumentoConsecutivo = this.props.itemSeleccionado.TipoDocumentoConsecutivo;
        file.SucursalId = this.props.solicitud.SucursalId;
        file.SucursalDescripcion = this.props.solicitud.SucursalDescripcion;
        file.NumeroSucursal = this.props.solicitud.NumeroSucursal;
        file.CondicionDocumentoId = 1;
        file.CondicionDocumentoDescripcion = "";
        file.SolicitudId = this.props.solicitud.Id;
        this.props.onAgregarArchivo(file);
    }

    private onEliminar = (fileName: any): void => {
        this.props.onEliminarArchivo(fileName);
    }

    private validarForm = (fieldsStatusError: any): any => {

        const solicitud = { ...this.props.solicitud };
        const item = { ...this.props.itemSeleccionado };
        let validForm = true;

        const field = {
            adjuntos: { error: false, mensajeError: "" },
            condicion: { error: false, mensajeError: "" },
            comentariosResponsable: { error: false, mensajeError: "" },
            comentariosAdministradorBoveda: { error: false, mensajeError: "" },
            estatusRevision: { error: false, mensajeError: "" }
        };

        /* Condiciones agrupadas por Tipo de solicitud / Estatus de solicitud */

        if (solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id || solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
            if (solicitud.EstatusId === EstatusSolicitudes.Pendiente.id || solicitud.EstatusId === EstatusSolicitudes.Rechazada.id) {
                if ((solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id && item.AplicaResguardo) || solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id) {
                    const adjunto = solicitud.Archivos.Files.find(x => x.TipoDocumentoConsecutivo === item.TipoDocumentoConsecutivo);

                    if (!adjunto) {
                        validForm = false;
                        field.adjuntos.error = true;
                        field.adjuntos.mensajeError = "Debe adjuntar un documento";
                    }
                    if (item.CondicionDocumentoId === null || item.CondicionDocumentoId === 0) {
                        validForm = false;
                        field.condicion.error = true;
                        field.condicion.mensajeError = "Debe seleccionar una Condición";
                    }
                }
                else {
                    if (item.ComentariosResponsable === null || item.ComentariosResponsable === "") {
                        validForm = false;
                        field.comentariosResponsable.error = true;
                        field.comentariosResponsable.mensajeError = "Debe agregar comentarios";
                    }
                }
            }
            else if (solicitud.EstatusId === EstatusSolicitudes.Revision.id) {
                if (item.EstatusRevisionId === null || item.EstatusRevisionId === 0) {
                    validForm = false;
                    field.estatusRevision.error = true;
                    field.estatusRevision.mensajeError = "Debe seleccionar un Estatus";
                }
                if (item.EstatusRevisionId === EstatusRevisionDocumento.Rechazado.id && (item.ComentariosAdministradorBoveda === null || item.ComentariosAdministradorBoveda === "")) {
                    validForm = false;
                    field.comentariosAdministradorBoveda.error = true;
                    field.comentariosAdministradorBoveda.mensajeError = "Debe agregar comentarios";
                }
            }
        }

        fieldsStatusError = {
            validForm: validForm,
            field: field
        };

        return fieldsStatusError;
    }
    private onActualizar = (): void => {
        const fieldsStatusError = { ...this.state.fieldsStatusError };
        const resultValidacion = this.validarForm(fieldsStatusError);
        this.setState({ fieldsStatusError: resultValidacion });
        if (resultValidacion.validForm)
            this.props.onAceptar();
    }

    private onCancelar = (): void => {
        const fieldsStatusError = {
            validForm: true,
            field: {
                adjuntos: { error: false, mensajeError: "" },
                condicion: { error: false, mensajeError: "" },
                comentariosResponsable: { error: false, mensajeError: "" },
                comentariosAdministradorBoveda: { error: false, mensajeError: "" },
                estatusRevision: { error: false, mensajeError: "" }
            }
        }
        this.setState({ fieldsStatusError: fieldsStatusError }, this.props.onCancelar);
    }

    private onRenderFooterContent = (): any => {
        return (
            <div className={`ms-Grid-col ms-u-sm12 ms-u-textAlignRight`}>
                <PrimaryButton text="Guardar" disabled={this.props.fieldsModalAttachmentState.botonGuardar.disable} hidden={this.props.fieldsModalAttachmentState.botonGuardar.hide} onClick={this.onActualizar} styles={buttonStyles} />
                <DefaultButton text="Cancelar" onClick={this.onCancelar} />
            </div>
        );
    };

    public render(): React.ReactElement<IPanelSeguimientoProps> {

        const fileTipoDocumento: any[] = this.props.solicitud.Archivos.Files.filter(x => x.TipoDocumentoConsecutivo === this.props.itemSeleccionado.TipoDocumentoConsecutivo);
        const fechaVencimiento = this.props.itemSeleccionado.FechaVencimiento === null ? (new Date()).toISOString() : this.props.itemSeleccionado.FechaVencimiento;

        return (
            <div>
                <Panel
                    headerText={this.props.itemSeleccionado.TipoDocumentoTitle}
                    isOpen={this.props.showDialog}
                    onDismiss={this.onCancelar}
                    closeButtonAriaLabel="Cerrar"
                    onRenderFooterContent={this.onRenderFooterContent}
                    isFooterAtBottom={true}
                    type={PanelType.medium}
                >
                    <div>
                        <div className={styles.formulario}>
                            <div className={styles.row} style={{ display: this.props.fieldsModalAttachmentState.aplicaResguardo.hide ? "none" : "block" }}>
                                <Checkbox
                                    title='AplicaResguardo'
                                    label="Aplica documento"
                                    defaultChecked={this.props.itemSeleccionado.AplicaResguardo}
                                    onChange={this.props.modificarValorCheckbox}
                                    disabled={this.props.fieldsModalAttachmentState.aplicaResguardo.disable}
                                />
                            </div>
                            <div className={styles.row} style={{ display: this.props.fieldsModalAttachmentState.adjuntos.hide ? "none" : "block" }}>
                                <Attachments
                                    solicitud={this.props.solicitud}
                                    files={fileTipoDocumento}
                                    disabled={this.props.fieldsModalAttachmentState.adjuntos.disable}
                                    maxFiles={1}
                                    onAddFile={this.onAgregar}
                                    onDeleteExistingFile={this.onEliminar}
                                />
                                <span className={styles.mensajeError}>{this.state.fieldsStatusError.field.adjuntos.error ? this.state.fieldsStatusError.field.adjuntos.mensajeError : ""}</span>
                            </div>
                            <div className={styles.row} style={{ display: this.props.fieldsModalAttachmentState.documentoAdjunto.hide ? "none" : "block" }}>
                                <GeneralActivityItem
                                    key={this.props.itemSeleccionado.Id}
                                    context={this.props.context}
                                    urlDocumento={this.props.itemSeleccionado.Url}
                                    nombreDocumento={this.props.itemSeleccionado.NombreDocumento}
                                />
                            </div>
                            <div className={styles.row} style={{ display: this.props.fieldsModalAttachmentState.condicion.hide ? "none" : "block" }}>
                                <Dropdown
                                    label="Condición"
                                    title={"CondicionDocumento"}
                                    onChange={this.props.modificarValorFiltroDropdDown}
                                    placeholder="Seleccione una opción"
                                    options={this.props.condicionesDocumento}
                                    defaultSelectedKey={this.props.itemSeleccionado.CondicionDocumentoId}
                                    required={this.props.itemSeleccionado.AplicaResguardo}
                                    errorMessage={this.state.fieldsStatusError.field.condicion.error ? this.state.fieldsStatusError.field.condicion.mensajeError : ""}
                                    disabled={this.props.fieldsModalAttachmentState.condicion.disable}
                                />
                            </div>
                            <div className={styles.row} style={{ display: this.props.fieldsModalAttachmentState.fechaVencimiento.hide ? "none" : "block" }}>
                                <DatePicker
                                    title="fechaVencimiento"
                                    label="Vencimiento"
                                    firstDayOfWeek={DayOfWeek.Sunday}
                                    placeholder="Fecha Vencimiento"
                                    strings={cadenasEspanol}
                                    formatDate={onFormatDate}
                                    onSelectDate={this.props.onModificarValorFechaVencimiento}
                                    value={new Date(fechaVencimiento)}
                                    isRequired={this.props.itemSeleccionado.AplicaResguardo && this.props.itemSeleccionado.Expira && !this.props.itemSeleccionado.Confidencial}
                                    minDate={new Date()}
                                    disabled={this.props.fieldsModalAttachmentState.fechaVencimiento.disable}
                                />
                            </div>
                            <div className={styles.row} style={{ display: this.props.fieldsModalAttachmentState.revisionDigital.hide ? "none" : "block" }}>
                                <Checkbox
                                    title='RevisionDigital'
                                    label="Revisión digital"
                                    defaultChecked={this.props.itemSeleccionado.RevisionDigital}
                                    onChange={this.props.modificarValorCheckbox}
                                    disabled={this.props.fieldsModalAttachmentState.revisionDigital.disable}
                                />
                            </div>
                            <div className={styles.row} style={{ display: this.props.fieldsModalAttachmentState.revisionFisico.hide ? "none" : "block" }}>
                                <Checkbox
                                    title='RevisionFisico'
                                    label="Revisión físico"
                                    defaultChecked={this.props.itemSeleccionado.RevisionFisico}
                                    onChange={this.props.modificarValorCheckbox}
                                    disabled={this.props.fieldsModalAttachmentState.revisionFisico.disable}
                                />
                            </div>
                            <div className={styles.row} style={{ display: this.props.fieldsModalAttachmentState.estatusRevision.hide ? "none" : "block" }}>
                                <Dropdown
                                    label="Estatus de revisión"
                                    title={"EstatusRevision"}
                                    onChange={this.props.modificarValorFiltroDropdDown}
                                    placeholder="Seleccione una opción"
                                    options={this.props.estatusRevisionDocumento}
                                    defaultSelectedKey={this.props.itemSeleccionado.EstatusRevisionId}
                                    required={true}
                                    errorMessage={this.state.fieldsStatusError.field.estatusRevision.error ? this.state.fieldsStatusError.field.estatusRevision.mensajeError : ""}
                                    disabled={this.props.fieldsModalAttachmentState.estatusRevision.disable}
                                />
                            </div>
                            <div className={styles.row} style={{ display: this.props.fieldsModalAttachmentState.comentariosResponsable.hide ? "none" : "block" }}>
                                <TextField
                                    title='ComentariosResponsable'
                                    label="Comentarios"
                                    multiline rows={5}
                                    onChange={this.props.modificarValorCampoTexto}
                                    value={this.props.itemSeleccionado.ComentariosResponsable}
                                    required={(!this.props.itemSeleccionado.AplicaResguardo && this.props.solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id)}
                                    errorMessage={this.state.fieldsStatusError.field.comentariosResponsable.error ? this.state.fieldsStatusError.field.comentariosResponsable.mensajeError : ""}
                                    disabled={this.props.fieldsModalAttachmentState.comentariosResponsable.disable}
                                />
                            </div>
                            <div className={styles.row} style={{ display: this.props.fieldsModalAttachmentState.comentariosAdministradorBoveda.hide ? "none" : "block" }}>
                                <TextField
                                    title='ComentariosAdministradorBoveda'
                                    label="Comentarios Bóveda"
                                    multiline rows={5}
                                    onChange={this.props.modificarValorCampoTexto}
                                    value={this.props.itemSeleccionado.ComentariosAdministradorBoveda}
                                    required={this.props.itemSeleccionado.EstatusRevisionId === EstatusRevisionDocumento.Rechazado.id}
                                    errorMessage={this.state.fieldsStatusError.field.comentariosAdministradorBoveda.error ? this.state.fieldsStatusError.field.comentariosAdministradorBoveda.mensajeError : ""}
                                    disabled={this.props.fieldsModalAttachmentState.comentariosAdministradorBoveda.disable}
                                />
                            </div>
                            <div className={styles.row} style={{ display: this.props.fieldsModalAttachmentState.historialComentarios.hide ? "none" : "block" }}>
                                <TextField
                                    title='HistorialComentarios'
                                    label="Historial de comentarios"
                                    multiline rows={10}
                                    onChange={this.props.modificarValorCampoTexto}
                                    value={this.props.itemSeleccionado.HistorialComentarios}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>
        );
    }
}