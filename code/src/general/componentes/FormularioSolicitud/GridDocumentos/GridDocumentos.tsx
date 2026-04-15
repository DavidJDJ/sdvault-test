import * as React from "react";
import { Usuario, SolicitudBoveda, TipoDocumento, TiposDocumentoSolicitud, DocumentoBoveda } from "../../../data/entities";
import { EstatusRevisionDocumento, EstatusSolicitudes, Roles, TiposSolicitud } from "../../../data/entities/Constantes";
import { ConstrainMode, DetailsList, DetailsListLayoutMode, IColumn, SelectionMode, Checkbox, IDropdownOption, IconButton, TextField } from "@fluentui/react";
import PanelSeguimiento from "../PanelSeguimiento/PanelSeguimiento";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import GeneralActivityItem from "../../GeneralActivityItem/GeneralActivityItem";
import * as moment from "moment";
import { obtenerEstadoCamposModalAttachments } from "./GridDocumentsLogic";
import styles from '../GridDocumentos/GridDocumentos.module.scss';

export interface IGridDocumentosProps {
    condicionesDocumento: IDropdownOption[];
    context: WebPartContext;
    datosUsuario: Usuario;
    displayMode: string;
    estatusRevisionDocumento: IDropdownOption[];
    onActualizarTiposDocumentosSolicitud(tipoDocumentoActualizado: TiposDocumentoSolicitud, documentoRelacionado?: DocumentoBoveda, guardarSeguimientoSolicitud?: boolean): any;
    onAgregarArchivo(file: any): any;
    onEliminarArchivo(fileName: any): any;
    onSolicitarResgardoDocumentos(solicitarTodos: boolean): any;
    solicitud: SolicitudBoveda;
    tiposDocumentos: TipoDocumento[];
}
export interface IGridDocumentosState {
    fieldsModalAttachmentState: any;
    itemSeleccionado: TiposDocumentoSolicitud;
    mostrarCheckTodosTiposDocumento: boolean;
    mostrarModalDocumentos: boolean;
    solicitarTodosTiposDocumento: boolean;
    viewFields: IColumn[];
}

export default class GridDocumentos extends React.Component<IGridDocumentosProps, IGridDocumentosState>{

    constructor(props: IGridDocumentosProps) {
        super(props);

        /* columnas base */

        const viewFields: IColumn[] = [
            {
                key: "TipoDocumentoConsecutivo",
                fieldName: "TipoDocumentoConsecutivo",
                name: "Consecutivo",
                isResizable: true,
                minWidth: 0,
                maxWidth: 80
            },
            {
                key: "TipoDocumentoTitle",
                fieldName: "TipoDocumentoTitle",
                name: "Tipo de documento",
                isResizable: true, minWidth: 0,
                maxWidth: 200
            }
        ];

        /* Condiciones agrupadas por Tipo de Solicitud/Rol del usuario/Estatus de la solicitud para agregar columnas al grid */

        if (this.props.solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id || this.props.solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id) {

            if (this.props.solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id) {
                viewFields.push({
                    key: "Confidencial",
                    fieldName: "Confidencial",
                    name: "Confidencial",
                    isResizable: true, minWidth: 0,
                    maxWidth: 80,
                    onRender: (item: TiposDocumentoSolicitud) => {
                        return item.Confidencial ? <IconButton className={styles.aprobado} iconProps={{ iconName: "BoxCheckmarkSolid" }} title="Este documento requerirá autorización especial para ser consultado" ariaLabel="Conficencial" /> : "";
                    }
                });
            }
            if (this.props.solicitud.Id === 0) {
                if (this.props.solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id && this.props.datosUsuario.Rol.Id === Roles.AdministradorBoveda.id) {
                    viewFields.push({
                        key: "SolicitarResguardo",
                        fieldName: "SolicitarResguardo",
                        name: "Solicitar documento",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 140,
                        onRender: (item: TiposDocumentoSolicitud) => {
                            return <Checkbox checked={item.SolicitarResguardo} onChange={this.modificarValorSolicitarResguardo.bind(null, item)} disabled={this.props.displayMode === "View"} />
                        }
                    });
                }
                else if (this.props.solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id && this.props.datosUsuario.Id === this.props.solicitud.ResponsableId) {
                    viewFields.push({
                        key: "Renovar",
                        fieldName: "Renovar",
                        name: "Renovar",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 140,
                        onRender: (item: TiposDocumentoSolicitud) => {
                            return <Checkbox checked={item.Renovar} onChange={this.modificarValorSolicitarRenovacion.bind(null, item)} disabled={this.props.displayMode === "View"} />
                        }
                    }, {
                        key: "FechaVencimiento",
                        fieldName: "FechaVencimiento",
                        name: "Vencimiento",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 80,
                        onRender: (item: TiposDocumentoSolicitud) => { const formatedDate = item.FechaVencimiento !== null ? moment(item.FechaVencimiento, moment.ISO_8601).format("DD/MM/YYYY") : ""; return formatedDate; }
                    });
                }
            }
            if (this.props.datosUsuario.Id === this.props.solicitud.ResponsableId && ((this.props.solicitud.EstatusId === EstatusSolicitudes.Pendiente.id && this.props.solicitud.Id > 0) || this.props.solicitud.EstatusId === EstatusSolicitudes.Rechazada.id) ||
                (this.props.datosUsuario.Rol.Id === Roles.AdministradorBoveda.id && this.props.solicitud.EstatusId === EstatusSolicitudes.Revision.id)) {
                viewFields.push({
                    key: "Seguimiento",
                    fieldName: "Seguimiento",
                    name: "Seguimiento",
                    isResizable: true,
                    minWidth: 0,
                    maxWidth: 85,
                    onRender: (item: TiposDocumentoSolicitud) => {
                        return <IconButton iconProps={{ iconName: 'FabricFolderFill' }} title="Seguimiento" ariaLabel="Seguimiento" onClick={this.cargarDocumentoClicked.bind(null, item)} />;
                    }
                });
            }
            if (this.props.datosUsuario.Id === this.props.solicitud.ResponsableId && (this.props.solicitud.EstatusId === EstatusSolicitudes.Revision.id) ||
                (this.props.datosUsuario.Rol.Id === Roles.AdministradorBoveda.id && ((this.props.solicitud.Id > 0 && this.props.solicitud.EstatusId === EstatusSolicitudes.Pendiente.id) || this.props.solicitud.EstatusId === EstatusSolicitudes.Rechazada.id))
            ) {
                viewFields.push({
                    key: "Documento",
                    fieldName: "Documento",
                    name: "Documento",
                    isResizable: true,
                    minWidth: 0,
                    maxWidth: 80,
                    onRender: (item: TiposDocumentoSolicitud) => {
                        return item.Url ?
                            <GeneralActivityItem
                                key={item.Id}
                                context={this.props.context}
                                urlDocumento={item.Url}
                                nombreDocumento={item.NombreDocumento}
                            /> : null
                    }
                });
            }
            if (this.props.solicitud.EstatusId === EstatusSolicitudes.Aprobada.id || this.props.solicitud.EstatusId === EstatusSolicitudes.Finalizada.id) {
                viewFields.push({
                    key: "Documentación",
                    fieldName: "Documentación",
                    name: "Documentación",
                    isResizable: true,
                    minWidth: 0,
                    maxWidth: 100,
                    onRender: (item: TiposDocumentoSolicitud) => {
                        return <IconButton iconProps={{ iconName: 'FabricFolderFill' }} title="Seguimiento" ariaLabel="Seguimiento" onClick={this.cargarDocumentoClicked.bind(null, item)} />;
                    }
                });
            }
            if (this.props.solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id && this.props.solicitud.Id > 0) {
                viewFields.push({
                    key: "AplicaResguardo",
                    fieldName: "AplicaResguardo",
                    name: "Aplica documento",
                    isResizable: true,
                    minWidth: 0,
                    maxWidth: 120,
                    onRender: (item: TiposDocumentoSolicitud) => {
                        return <Checkbox checked={item.AplicaResguardo} disabled />
                    }
                });
            }
            if (this.props.solicitud.Id > 0) {
                viewFields.push(
                    {
                        key: "CondicionDocumentoDescripcion",
                        fieldName: "CondicionDocumentoDescripcion",
                        name: "Condición",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 70
                    },
                    {
                        key: "FechaVencimiento",
                        fieldName: "FechaVencimiento",
                        name: "Vencimiento",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 80,
                        onRender: (item: TiposDocumentoSolicitud) => { const formatedDate = item.FechaVencimiento !== null ? moment(item.FechaVencimiento, moment.ISO_8601).format("DD/MM/YYYY") : ""; return formatedDate; }
                    });
            }
            if (this.props.solicitud.EstatusId === EstatusSolicitudes.Revision.id || this.props.solicitud.EstatusId === EstatusSolicitudes.Aprobada.id || this.props.solicitud.EstatusId === EstatusSolicitudes.Rechazada.id || this.props.solicitud.EstatusId === EstatusSolicitudes.Finalizada.id) {
                viewFields.push({
                    key: "RevisionDigital",
                    fieldName: "RevisionDigital",
                    name: "Revisión digital",
                    isResizable: true,
                    minWidth: 0,
                    maxWidth: 100,
                    onRender: (item: TiposDocumentoSolicitud) => {
                        return <Checkbox checked={item.RevisionDigital} disabled />
                    }
                },
                    {
                        key: "RevisionFisico",
                        fieldName: "RevisionFisico",
                        name: "Revisión físico",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 95,
                        onRender: (item: TiposDocumentoSolicitud) => {
                            return <Checkbox checked={item.RevisionFisico} disabled />
                        }
                    },
                    {
                        key: "EstatusRevisionDescripcion",
                        fieldName: "EstatusRevisionDescripcion",
                        name: "Aprobado",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 120,
                        onRender: (item: TiposDocumentoSolicitud) => {
                            return item.EstatusRevisionId === EstatusRevisionDocumento.Aprobado.id ?
                                <IconButton className={styles.aprobado} iconProps={{ iconName: "BoxCheckmarkSolid" }} title="Aprobado" ariaLabel="Aprobado" />
                                : item.EstatusRevisionId === EstatusRevisionDocumento.Rechazado.id ?
                                    <IconButton className={styles.rechazado} iconProps={{ iconName: "BoxMultiplySolid" }} title="Rechazado" ariaLabel="Rechazado" />
                                    : "";
                        }
                    });
            }
        }

        else if (this.props.solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id) {
            if (this.props.solicitud.Id === 0) {
                viewFields.push(
                    {
                        key: "CondicionDocumentoDescripcion",
                        fieldName: "CondicionDocumentoDescripcion",
                        name: "Condición",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 70
                    },
                    {
                        key: "SolicitarDocumentoOriginal",
                        fieldName: "SolicitarDocumentoOriginal",
                        name: "Solicitar documento",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 140,
                        onRender: (item: TiposDocumentoSolicitud) => {
                            return <Checkbox checked={item.SolicitarDocumentoOriginal} onChange={this.modificarValorSolicitarDocumentoOriginal.bind(null, item)} />
                        }
                    },
                    {
                        key: "DiasPrestamo",
                        fieldName: "DiasPrestamo",
                        name: "Días de préstamo",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 140,
                        onRender: (item: TiposDocumentoSolicitud) => {
                            return <TextField value={item.DiasPrestamo.toString()} onChange={this.modificarValorDiasPrestamo.bind(null, item)} disabled={!item.SolicitarDocumentoOriginal} />
                        }
                    });
            }
            else {

                viewFields.push({
                    key: "Documento",
                    fieldName: "Documento",
                    name: "Documento",
                    isResizable: true,
                    minWidth: 0,
                    maxWidth: 120,
                    onRender: (item: TiposDocumentoSolicitud) => {
                        return item.Url ?
                            <GeneralActivityItem
                                key={item.Id}
                                context={this.props.context}
                                urlDocumento={item.Url}
                                nombreDocumento={item.NombreDocumento}
                            /> : null
                    }
                },
                    {
                        key: "DiasPrestamo",
                        fieldName: "DiasPrestamo",
                        name: "Días de préstamo",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 140,
                        onRender: (item: TiposDocumentoSolicitud) => {
                            return <TextField value={item.DiasPrestamo.toString()} onChange={this.modificarValorDiasPrestamo.bind(null, item)} disabled={(this.props.solicitud.EstatusId !== EstatusSolicitudes.RechazadaArea.id && this.props.solicitud.EstatusId !== EstatusSolicitudes.RechazadaDireccion.id) || this.props.solicitud.SolicitanteId !== this.props.datosUsuario.Id || this.props.displayMode !== "Edit"} />
                        }
                    });
                if (this.props.solicitud.EstatusId === EstatusSolicitudes.Aprobada.id || this.props.solicitud.EstatusId === EstatusSolicitudes.Finalizada.id) {
                    viewFields.push({
                        key: "FechaDevolucion",
                        fieldName: "FechaDevolucion",
                        name: "Fecha de devolución",
                        isResizable: true,
                        minWidth: 0,
                        maxWidth: 80,
                        onRender: (item: TiposDocumentoSolicitud) => { const formatedDate = item.FechaDevolucionDocumentoOriginal !== "" && item.FechaDevolucionDocumentoOriginal !== null ? moment(item.FechaDevolucionDocumentoOriginal, moment.ISO_8601).format("DD/MM/YYYY") : ""; return formatedDate; }
                    });
                }
            }
        }

        this.state = {
            fieldsModalAttachmentState: {
                aplicaResguardo: { disable: true, hide: false },
                adjuntos: { disable: true, hide: false },
                documentoAdjunto: { disable: true, hide: false },
                condicion: { disable: true, hide: false },
                fechaVencimiento: { disable: true, hide: false },
                comentariosResponsable: { disable: true, hide: false },
                revisionDigital: { disable: true, hide: false },
                revisionFisico: { disable: true, hide: false },
                EstatusRevision: { disable: true, hide: false },
                comentariosAdministradorBoveda: { disable: true, hide: false },
                historialComentarios: { disable: true, hide: false },
                botonGuardar: { disable: true, hide: true }
            },
            itemSeleccionado: new TiposDocumentoSolicitud(),
            mostrarCheckTodosTiposDocumento: this.mostrarCheckTodosTiposDocumento(),
            mostrarModalDocumentos: false,
            solicitarTodosTiposDocumento: false,
            viewFields: viewFields
        };
    }

    private modificarValorSolicitarResguardo = (item: TiposDocumentoSolicitud, e: any, valor: any): void => {
        item.SolicitarResguardo = valor;
        this.props.onActualizarTiposDocumentosSolicitud(item, null, false);
    }

    private modificarValorSolicitarRenovacion = (item: TiposDocumentoSolicitud, e: any, valor: any): void => {
        item.Renovar = valor;
        item.FechaDevolucionDocumentoOriginal = null;
        this.props.onActualizarTiposDocumentosSolicitud(item, null, false);
    }

    private mostrarCheckTodosTiposDocumento = (): boolean => {
        if (this.props.solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id && this.props.datosUsuario.Rol.Id === Roles.AdministradorBoveda.id && this.props.solicitud.Id === 0 && this.props.solicitud.TiposDocumentoSolicitud.length > 0)
            return true;
        else
            return false;
    }

    private modificarValorSolicitarTodosTiposDocumento = (e: any, valor: any): void => {
        this.props.onSolicitarResgardoDocumentos(valor);
    }

    /* Funciones relaciondas al componente ModalAttachment */

    private cargarDocumentoClicked = (item: TiposDocumentoSolicitud): void => {
        const fieldsStatus = obtenerEstadoCamposModalAttachments(this.props, item);
        this.setState({ mostrarModalDocumentos: true, itemSeleccionado: { ...item }, fieldsModalAttachmentState: { ...fieldsStatus } });
    }

    private onAceptarModalAttachment = (): void => {

        const solicitud = { ...this.props.solicitud };
        const itemActualizado = { ...this.state.itemSeleccionado };

        if (solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id)
            itemActualizado.AplicaResguardo = true;

        if (itemActualizado.AplicaResguardo && itemActualizado.Expira && itemActualizado.FechaVencimiento === null && !itemActualizado.Confidencial)
            itemActualizado.FechaVencimiento = (new Date()).toISOString();
        
        const historialComentarios = itemActualizado.HistorialComentarios === null ? "" : itemActualizado.HistorialComentarios;

        if (itemActualizado.EdicionComentariosResponsable) {
            itemActualizado.HistorialComentarios = `✓ ${this.props.datosUsuario.Nombre} (${(new Date()).toLocaleString()}): ${itemActualizado.ComentariosResponsable} \r\n${historialComentarios}`;
            itemActualizado.EdicionComentariosResponsable = false;
        }
        else if (itemActualizado.EdicionComentariosBoveda) {
            itemActualizado.HistorialComentarios = `✓ ${this.props.datosUsuario.Nombre} (${(new Date()).toLocaleString()}): ${itemActualizado.ComentariosAdministradorBoveda} \r\n${historialComentarios}`;
            itemActualizado.EdicionComentariosBoveda = false;
        }

        const consecutivoItemSeleccionado = itemActualizado.TipoDocumentoConsecutivo;
        let documentoRelacionado: DocumentoBoveda = null;

        const indexOfAdjuntoObject = solicitud.Archivos.Files.findIndex((object: DocumentoBoveda) => {
            return object.TipoDocumentoConsecutivo === consecutivoItemSeleccionado;
        });

        if (indexOfAdjuntoObject !== -1) {

            documentoRelacionado = solicitud.Archivos.Files[indexOfAdjuntoObject];
            documentoRelacionado.FechaVencimiento = itemActualizado.FechaVencimiento;
            documentoRelacionado.UltimaVersion = itemActualizado.UltimaVersion;
            documentoRelacionado.RevisionDigital = itemActualizado.RevisionDigital;
            documentoRelacionado.RevisionFisico = itemActualizado.RevisionFisico;
            documentoRelacionado.EstatusRevisionId = itemActualizado.EstatusRevisionId;
            documentoRelacionado.EstatusRevisionDescripcion = itemActualizado.EstatusRevisionDescripcion;
            documentoRelacionado.CondicionDocumentoId = itemActualizado.CondicionDocumentoId;
            documentoRelacionado.CondicionDocumentoDescripcion = itemActualizado.CondicionDocumentoDescripcion;

            if (itemActualizado.AplicaResguardo) {
                itemActualizado.DocumentoId = documentoRelacionado.Id;
                itemActualizado.NombreDocumento = documentoRelacionado.FileName;
                itemActualizado.Url = documentoRelacionado.Url;
            }
            else {
                itemActualizado.DocumentoId = 0;
                itemActualizado.NombreDocumento = "";
                itemActualizado.Url = "";
            }

            this.setState({ mostrarModalDocumentos: false }, this.props.onActualizarTiposDocumentosSolicitud(itemActualizado, documentoRelacionado, true));
        }
        else
            this.setState({ mostrarModalDocumentos: false }, this.props.onActualizarTiposDocumentosSolicitud(itemActualizado, null, true));
    }

    private onCancelarModalAttachment = (): void => {
        this.setState({ mostrarModalDocumentos: false });
    }

    private modificarValorCheckbox = (e: any, valor: any): void => {
        const field = e.target.title;
        const item: any = { ...this.state.itemSeleccionado };
        item[field] = valor;
        if (field === "AplicaResguardo") {
            if (valor) {
                item.ComentariosResponsable = "";
                this.setState({ itemSeleccionado: item, fieldsModalAttachmentState: { ...this.state.fieldsModalAttachmentState, adjuntos: { hide: false }, condicion: { hide: false }, comentariosResponsable: { hide: true }, fechaVencimiento: { hide: item.Expira && !item.Confidencial ? false : true } } });
            }
            else {
                item.CondicionDocumentoId = null;
                item.CondicionDocumentoDescripcion = "";
                item.FechaVencimiento = null;
                this.setState({ itemSeleccionado: item, fieldsModalAttachmentState: { ...this.state.fieldsModalAttachmentState, adjuntos: { hide: true }, condicion: { hide: true }, comentariosResponsable: { hide: false }, fechaVencimiento: { hide: true } } });
            }
        } else
            this.setState({ itemSeleccionado: item });
    }

    private modificarValorFiltroDropdDown = (e: any, selectedOption: any): void => {
        const field = e.target.title;
        const item: any = { ...this.state.itemSeleccionado };
        item[`${field}Id`] = selectedOption.key;
        item[`${field}Descripcion`] = selectedOption.text;
        this.setState({ itemSeleccionado: item });
    }

    private onFechaVencimientoChange = (date: Date): void => {
        const item: any = { ...this.state.itemSeleccionado };
        item.FechaVencimiento = date.toISOString();
        this.setState({ itemSeleccionado: item });
    }

    private modificarValorCampoTexto = (e: any): void => {
        const { title, value } = e.target;
        const item: any = { ...this.state.itemSeleccionado };
        item[title] = value;
        if (title === "ComentariosResponsable")
            item.EdicionComentariosResponsable = value !== "" ? true : false;
        else if (title === "ComentariosAdministradorBoveda")
            item.EdicionComentariosBoveda = value !== "" ? true : false;
        this.setState({ itemSeleccionado: item });
    }

    private modificarValorSolicitarDocumentoOriginal = (item: TiposDocumentoSolicitud, e: any, valor: any): void => {
        item.SolicitarDocumentoOriginal = valor;
        item.DiasPrestamo = !valor ? 0 : item.DiasPrestamo;
        this.props.onActualizarTiposDocumentosSolicitud(item, null, false);
    }

    private modificarValorDiasPrestamo = (item: TiposDocumentoSolicitud, e: any, valor: any): void => {
        if (!isNaN(valor)) {
            valor = valor === "" ? 0 : parseInt(valor);
            if (valor >= 0 && valor <= 20) {
                item.DiasPrestamo = valor;
                this.props.onActualizarTiposDocumentosSolicitud(item, null, false);
            }
        }
    }


    public render(): React.ReactElement<IGridDocumentosProps> {
        return (
            <div>
                <div style={{ display: this.mostrarCheckTodosTiposDocumento() ? "block" : "none" }}
                >
                    <Checkbox
                        defaultChecked={this.state.solicitarTodosTiposDocumento}
                        label="Seleccionar todos"
                        onChange={this.modificarValorSolicitarTodosTiposDocumento}
                        title='todosTiposDocumentos'
                    />
                </div>
                <DetailsList
                    columns={this.state.viewFields}
                    constrainMode={ConstrainMode.unconstrained}
                    items={this.props.solicitud.TiposDocumentoSolicitud}
                    layoutMode={DetailsListLayoutMode.fixedColumns}
                    selectionMode={SelectionMode.none}
                />
                {
                    this.state.itemSeleccionado.TipoDocumentoId > 0 ?
                        <PanelSeguimiento
                            condicionesDocumento={this.props.condicionesDocumento}
                            context={this.props.context}
                            displayMode={this.props.displayMode}
                            estatusRevisionDocumento={this.props.estatusRevisionDocumento}
                            fieldsModalAttachmentState={this.state.fieldsModalAttachmentState}
                            itemSeleccionado={this.state.itemSeleccionado}
                            onAceptar={this.onAceptarModalAttachment}
                            onAgregarArchivo={this.props.onAgregarArchivo}
                            onEliminarArchivo={this.props.onEliminarArchivo}
                            onCancelar={this.onCancelarModalAttachment}
                            modificarValorCheckbox={this.modificarValorCheckbox}
                            modificarValorFiltroDropdDown={this.modificarValorFiltroDropdDown}
                            modificarValorCampoTexto={this.modificarValorCampoTexto}
                            onModificarValorFechaVencimiento={this.onFechaVencimientoChange}
                            showDialog={this.state.mostrarModalDocumentos}
                            solicitud={this.props.solicitud}
                        /> : null
                }
            </div >
        );
    }
}
