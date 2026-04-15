import * as React from "react";
import { ICommandBarItemProps, CommandBar } from "@fluentui/react";
import { EstatusSolicitudes, Roles, SolicitudBoveda, TiposSolicitud, Usuario } from "../../../data/entities";

export interface IBarraControlesProps {
    datosUsuario: Usuario;
    displayMode: string;
    onGoBack(): any;
    onCrearSolicitud(): any;
    onSeguimientoEstatusSolicitud(envioBoveda: boolean, aprobacion: boolean, rechazo: boolean): any;
    solicitud: SolicitudBoveda;
}

export default class BarraControles extends React.Component<IBarraControlesProps>{
    private commandBarActions: ICommandBarItemProps[];
    constructor(props: IBarraControlesProps) {
        super(props);
    }

    private inicializarBarraControles = (): ICommandBarItemProps[] => {
        const solicitud = this.props.solicitud;
        const usuario = this.props.datosUsuario;
        const items: ICommandBarItemProps[] = [{
            key: "regresar",
            text: "Regresar",
            iconProps: { iconName: "Back" },
            onClick: () => this.props.onGoBack()
        }];

        if ((solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id && usuario.Rol.Id === Roles.AdministradorBoveda.id) ||
            (solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id && usuario.Rol.Id === Roles.GerenteSucursal.id) ||
            (solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id)) {
            if (solicitud.Id === 0)
                items.push({
                    key: 'crearSolicitud',
                    text: 'Crear solicitud',
                    iconProps: { iconName: 'Add' },
                    disabled: false,
                    onClick: () => this.props.onCrearSolicitud()
                });
        }
        if ((solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id || solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id)
            && usuario.Id === solicitud.ResponsableId
            && ((solicitud.EstatusId === EstatusSolicitudes.Pendiente.id && solicitud.Id > 0) || solicitud.EstatusId === EstatusSolicitudes.Rechazada.id)
            && this.props.displayMode === "Edit") {
            items.push({
                key: 'enviarSolicitudBoveda',
                text: 'Enviar a Bóveda',
                iconProps: { iconName: 'Send' },
                disabled: false,
                onClick: () => this.props.onSeguimientoEstatusSolicitud(true, true, false)
            });
        }
        if (solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id
            && usuario.Id === solicitud.ResponsableId
            && solicitud.EstatusId === EstatusSolicitudes.RechazadaArea.id
            && this.props.displayMode === "Edit") {
            items.push({
                key: 'enviarSolicitudArea',
                text: 'Enviar a Dirección de Área',
                iconProps: { iconName: 'Send' },
                disabled: false,
                onClick: () => this.props.onSeguimientoEstatusSolicitud(false, true, false)
            });
        }
        if (solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id
            && usuario.Id === solicitud.ResponsableId
            && solicitud.EstatusId === EstatusSolicitudes.RechazadaDireccion.id
            && this.props.displayMode === "Edit") {
            items.push({
                key: 'enviarSolicitudArea',
                text: 'Enviar a Dirección de Bóveda',
                iconProps: { iconName: 'Send' },
                disabled: false,
                onClick: () => this.props.onSeguimientoEstatusSolicitud(false, true, false)
            });
        }

        if (this.props.displayMode === "Edit"
            && (
                ((
                    solicitud.TipoSolicitudId === TiposSolicitud.Resguardo.id || solicitud.TipoSolicitudId === TiposSolicitud.Renovacion.id)
                    && solicitud.EstatusId === EstatusSolicitudes.Revision.id
                    && usuario.Rol.Id === Roles.AdministradorBoveda.id
                    && usuario.Id === solicitud.AsignadoId)
                || (solicitud.TipoSolicitudId === TiposSolicitud.Prestamo.id
                    && solicitud.AsignadoId === usuario.Id
                    && (
                        solicitud.EstatusId === EstatusSolicitudes.RevisionArea.id
                        || solicitud.EstatusId === EstatusSolicitudes.RevisionDireccion.id))
            )
        ) {
            items.push({
                key: 'aprobarSolicitud',
                text: 'Aprobar',
                iconProps: { iconName: 'CompletedSolid' },
                disabled: false,
                onClick: () => this.props.onSeguimientoEstatusSolicitud(false, true, false)
            },
                {
                    key: 'rechazarSolicitud',
                    text: 'Rechazar',
                    iconProps: { iconName: 'StatusErrorFull' },
                    disabled: false,
                    onClick: () => this.props.onSeguimientoEstatusSolicitud(false, false, true)
                });
        }
        if (solicitud.EstatusId === EstatusSolicitudes.Aprobada.id
            && usuario.Rol.Id === Roles.AdministradorBoveda.id
            && usuario.Id === solicitud.AsignadoId
            && this.props.displayMode === "Edit") {
            items.push({
                key: 'finalizarSolicitudBoveda',
                text: 'Finalizar',
                iconProps: { iconName: 'Send' },
                disabled: false,
                onClick: () => this.props.onSeguimientoEstatusSolicitud(false, true, false)
            });
        }
        return items;
    }

    public render(): React.ReactElement<IBarraControlesProps> {
        this.commandBarActions = this.inicializarBarraControles();
        return (
            <CommandBar
                items={this.commandBarActions}
                ariaLabel="Acciones Solicitud"
            />
        )
    }
}