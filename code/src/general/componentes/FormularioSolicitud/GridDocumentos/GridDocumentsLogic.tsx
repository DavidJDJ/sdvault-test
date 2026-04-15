import { EstatusRevisionDocumento, EstatusSolicitudes, Roles, SolicitudBoveda, TiposDocumentoSolicitud, TiposSolicitud, Usuario } from "../../../data/entities";

export const obtenerEstadoCamposModalAttachments = (props: any, itemSeleccionado: TiposDocumentoSolicitud): any => {

    const solicitud: SolicitudBoveda = { ...props.solicitud };
    const usuario: Usuario = { ...props.datosUsuario };
    const tipoSolicitudId: number = solicitud.TipoSolicitudId;
    let fieldsStatus: any = {};
    const displayModeEdit: boolean = props.displayMode === "Edit" ? true : false;

    /* Condiciones agrupadas por Tipo de solicitud / Rol / Estatus de solicitud */

    if (tipoSolicitudId === TiposSolicitud.Resguardo.id) {

        if (solicitud.ResponsableId === usuario.Id) {
            if (solicitud.EstatusId === EstatusSolicitudes.Pendiente.id) {
                fieldsStatus = {
                    aplicaResguardo: { disable: !displayModeEdit, hide: false },
                    adjuntos: { disable: !displayModeEdit, hide: !itemSeleccionado.AplicaResguardo },
                    documentoAdjunto: { disable: !displayModeEdit, hide: true },
                    condicion: { disable: !displayModeEdit, hide: !itemSeleccionado.AplicaResguardo },
                    fechaVencimiento: { disable: !displayModeEdit, hide: !itemSeleccionado.AplicaResguardo || !itemSeleccionado.Expira || itemSeleccionado.Confidencial },
                    comentariosResponsable: { disable: !displayModeEdit, hide: itemSeleccionado.AplicaResguardo },
                    revisionDigital: { disable: true, hide: true },
                    revisionFisico: { disable: true, hide: true },
                    estatusRevision: { disable: true, hide: true },
                    comentariosAdministradorBoveda: { disable: true, hide: true },
                    historialComentarios: { disable: true, hide: true },
                    botonGuardar: { disable: !displayModeEdit, hide: false }
                }
            }
            else if (solicitud.EstatusId === EstatusSolicitudes.Rechazada.id) {
                fieldsStatus = {
                    aplicaResguardo: { disable: !displayModeEdit, hide: false },
                    adjuntos: { disable: !displayModeEdit, hide: !itemSeleccionado.AplicaResguardo },
                    documentoAdjunto: { disable: true, hide: true },
                    condicion: { disable: !displayModeEdit, hide: !itemSeleccionado.AplicaResguardo },
                    fechaVencimiento: { disable: !displayModeEdit, hide: !itemSeleccionado.AplicaResguardo || !itemSeleccionado.Expira || itemSeleccionado.Confidencial },
                    comentariosResponsable: { disable: !displayModeEdit, hide: itemSeleccionado.AplicaResguardo },
                    revisionDigital: { disable: true, hide: false },
                    revisionFisico: { disable: true, hide: false },
                    estatusRevision: { disable: true, hide: false },
                    comentariosAdministradorBoveda: { disable: true, hide: true },
                    historialComentarios: { disable: true, hide: false },
                    botonGuardar: { disable: !displayModeEdit, hide: false }
                }
            }
            else if (solicitud.EstatusId === EstatusSolicitudes.Aprobada.id || solicitud.EstatusId === EstatusSolicitudes.Finalizada.id) {
                fieldsStatus = {
                    aplicaResguardo: { disable: true, hide: itemSeleccionado.AplicaResguardo },
                    adjuntos: { disable: true, hide: true },
                    documentoAdjunto: { disable: true, hide: !itemSeleccionado.AplicaResguardo },
                    condicion: { disable: true, hide: !itemSeleccionado.AplicaResguardo },
                    fechaVencimiento: { disable: true, hide: !itemSeleccionado.AplicaResguardo || !itemSeleccionado.Expira || itemSeleccionado.Confidencial },
                    comentariosResponsable: { disable: true, hide: true },
                    revisionDigital: { disable: true, hide: false },
                    revisionFisico: { disable: true, hide: false },
                    estatusRevision: { disable: true, hide: false },
                    comentariosAdministradorBoveda: { disable: true, hide: true },
                    historialComentarios: { disable: true, hide: false },
                    botonGuardar: { disable: true, hide: true }
                }
            }
        }
        if (usuario.Rol.Id === Roles.AdministradorBoveda.id) {

            if (solicitud.EstatusId === EstatusSolicitudes.Revision.id) {
                fieldsStatus = {
                    aplicaResguardo: { disable: true, hide: itemSeleccionado.AplicaResguardo },
                    adjuntos: { disable: true, hide: true },
                    documentoAdjunto: { disable: !displayModeEdit, hide: !itemSeleccionado.AplicaResguardo },
                    condicion: { disable: true, hide: !itemSeleccionado.AplicaResguardo },
                    fechaVencimiento: { disable: true, hide: !itemSeleccionado.AplicaResguardo || !itemSeleccionado.Expira || itemSeleccionado.Confidencial },
                    comentariosResponsable: { disable: true, hide: true },
                    revisionDigital: { disable: !displayModeEdit || !itemSeleccionado.AplicaResguardo, hide: false },
                    revisionFisico: { disable: !displayModeEdit || !itemSeleccionado.AplicaResguardo, hide: false },
                    estatusRevision: { disable: !displayModeEdit, hide: false },
                    comentariosAdministradorBoveda: { disable: !displayModeEdit, hide: false },
                    historialComentarios: { disable: true, hide: false },
                    botonGuardar: { disable: !displayModeEdit, hide: false }
                }
            }
            else if (solicitud.EstatusId === EstatusSolicitudes.Aprobada.id || solicitud.EstatusId === EstatusSolicitudes.Finalizada.id) {
                fieldsStatus = {
                    aplicaResguardo: { disable: true, hide: itemSeleccionado.AplicaResguardo },
                    adjuntos: { disable: true, hide: true },
                    documentoAdjunto: { disable: true, hide: !itemSeleccionado.AplicaResguardo },
                    condicion: { disable: true, hide: !itemSeleccionado.AplicaResguardo },
                    fechaVencimiento: { disable: true, hide: !itemSeleccionado.AplicaResguardo || !itemSeleccionado.Expira || itemSeleccionado.Confidencial },
                    comentariosResponsable: { disable: true, hide: true },
                    revisionDigital: { disable: true, hide: false },
                    revisionFisico: { disable: true, hide: false },
                    estatusRevision: { disable: true, hide: false },
                    comentariosAdministradorBoveda: { disable: true, hide: true },
                    historialComentarios: { disable: true, hide: false },
                    botonGuardar: { disable: true, hide: true }
                }
            }
        }
    }

    else if (tipoSolicitudId === TiposSolicitud.Renovacion.id) {
        if (usuario.Rol.Id === Roles.GerenteSucursal.id) {
            if (solicitud.EstatusId === EstatusSolicitudes.Pendiente.id) {
                fieldsStatus = {
                    aplicaResguardo: { disable: true, hide: true },
                    adjuntos: { disable: !displayModeEdit, hide: false },
                    documentoAdjunto: { disable: true, hide: true },
                    condicion: { disable: !displayModeEdit, hide: false },
                    fechaVencimiento: { disable: !displayModeEdit, hide: false },
                    comentariosResponsable: { disable: !displayModeEdit, hide: false },
                    revisionDigital: { disable: true, hide: true },
                    revisionFisico: { disable: true, hide: true },
                    estatusRevision: { disable: true, hide: true },
                    comentariosAdministradorBoveda: { disable: true, hide: true },
                    historialComentarios: { disable: true, hide: true },
                    botonGuardar: { disable: !displayModeEdit, hide: false }
                }
            }
            else if (solicitud.EstatusId === EstatusSolicitudes.Rechazada.id) {
                if (itemSeleccionado.EstatusRevisionId === EstatusRevisionDocumento.Rechazado.id) {
                    fieldsStatus = {
                        aplicaResguardo: { disable: true, hide: true },
                        adjuntos: { disable: !displayModeEdit, hide: false },
                        documentoAdjunto: { disable: true, hide: true },
                        condicion: { disable: !displayModeEdit, hide: false },
                        fechaVencimiento: { disable: !displayModeEdit, hide: false },
                        comentariosResponsable: { disable: !displayModeEdit, hide: false },
                        revisionDigital: { disable: true, hide: false },
                        revisionFisico: { disable: true, hide: false },
                        estatusRevision: { disable: true, hide: false },
                        comentariosAdministradorBoveda: { disable: true, hide: true },
                        historialComentarios: { disable: true, hide: false },
                        botonGuardar: { disable: !displayModeEdit, hide: false }
                    }
                }
            }
            else if (solicitud.EstatusId === EstatusSolicitudes.Aprobada.id || solicitud.EstatusId === EstatusSolicitudes.Finalizada.id) {
                fieldsStatus = {
                    aplicaResguardo: { disable: true, hide: itemSeleccionado.AplicaResguardo },
                    adjuntos: { disable: true, hide: true },
                    documentoAdjunto: { disable: true, hide: !itemSeleccionado.AplicaResguardo },
                    condicion: { disable: true, hide: !itemSeleccionado.AplicaResguardo },
                    fechaVencimiento: { disable: true, hide: !itemSeleccionado.AplicaResguardo || !itemSeleccionado.Expira },
                    comentariosResponsable: { disable: true, hide: true },
                    revisionDigital: { disable: true, hide: false },
                    revisionFisico: { disable: true, hide: false },
                    estatusRevision: { disable: true, hide: false },
                    comentariosAdministradorBoveda: { disable: true, hide: true },
                    historialComentarios: { disable: true, hide: false },
                    botonGuardar: { disable: true, hide: true }
                }
            }
        }

        else if (usuario.Rol.Id === Roles.AdministradorBoveda.id) {
            if (solicitud.EstatusId === EstatusSolicitudes.Revision.id) {
                fieldsStatus = {
                    aplicaResguardo: { disable: true, hide: true },
                    adjuntos: { disable: !displayModeEdit, hide: true },
                    documentoAdjunto: { disable: true, hide: false },
                    condicion: { disable: true, hide: false },
                    fechaVencimiento: { disable: true, hide: false },
                    comentariosResponsable: { disable: true, hide: true },
                    revisionDigital: { disable: !displayModeEdit, hide: false },
                    revisionFisico: { disable: !displayModeEdit, hide: false },
                    estatusRevision: { disable: !displayModeEdit, hide: false },
                    comentariosAdministradorBoveda: { disable: !displayModeEdit, hide: false },
                    historialComentarios: { disable: true, hide: false },
                    botonGuardar: { disable: !displayModeEdit, hide: false }
                }
            }
            else if (solicitud.EstatusId === EstatusSolicitudes.Aprobada.id || solicitud.EstatusId === EstatusSolicitudes.Finalizada.id) {
                fieldsStatus = {
                    aplicaResguardo: { disable: true, hide: itemSeleccionado.AplicaResguardo },
                    adjuntos: { disable: true, hide: true },
                    documentoAdjunto: { disable: true, hide: !itemSeleccionado.AplicaResguardo },
                    condicion: { disable: true, hide: !itemSeleccionado.AplicaResguardo },
                    fechaVencimiento: { disable: true, hide: !itemSeleccionado.AplicaResguardo || !itemSeleccionado.Expira },
                    comentariosResponsable: { disable: true, hide: true },
                    revisionDigital: { disable: true, hide: false },
                    revisionFisico: { disable: true, hide: false },
                    estatusRevision: { disable: true, hide: false },
                    comentariosAdministradorBoveda: { disable: true, hide: true },
                    historialComentarios: { disable: true, hide: false },
                    botonGuardar: { disable: true, hide: true }
                }
            }
        }
    }

    return fieldsStatus;
}