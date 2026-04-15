import * as React from 'react';
import { IconButton, TooltipHost } from '@fluentui/react';
import * as strings from 'GlobalStrings';
import { SolicitudBoveda, Usuario, EstatusSolicitudes, Roles } from '../../../general/data/entities';

export interface IMenuContextualGridProps {
    item: SolicitudBoveda;
    clickOpcion?: any;
    datosUsuarioLogueado: Usuario
}

export class MenuContextualGrid extends React.Component<IMenuContextualGridProps> {
    public constructor(props: IMenuContextualGridProps) {
        super(props);
    }

    public render() : React.ReactElement<IMenuContextualGridProps> {

        const menuItems = [
            {
                key: 'VerSolicitud',
                name: "Ver solicitud",
                iconProps: { iconName: 'RedEye' },
                disabled: this.props.item.Id <= 0,
                onClick: () => { this.controlOpcion('VerSolicitud'); }
            }];
              
        //Roles
        const DireccionBoveda = this.props.datosUsuarioLogueado.Rol.Id === Roles.DireccionBoveda.id;
        const DireccionArea = this.props.datosUsuarioLogueado.Rol.Id === Roles.DireccionArea.id;
        const GerenteSucursal = this.props.datosUsuarioLogueado.Rol.Id === Roles.GerenteSucursal.id;
        const GerenteConstruccion = this.props.datosUsuarioLogueado.Rol.Id === Roles.GerenteConstruccion.id;
        const JuridicoInmuebles = this.props.datosUsuarioLogueado.Rol.Id === Roles.JuridicoInmuebles.id;
        const JuridicoAdministrativo = this.props.datosUsuarioLogueado.Rol.Id === Roles.JuridicoAdministrativo.id;
        const AdministradorBoveda = this.props.datosUsuarioLogueado.Rol.Id === Roles.AdministradorBoveda.id;

        //Estatus de Solicitud (se decidió por el .titulo en vez del .id porque a veces .id === undefined)
        const Pendiente = this.props.item.EstatusDescripcion === EstatusSolicitudes.Pendiente.titulo;
        const Revision = this.props.item.EstatusDescripcion === EstatusSolicitudes.Revision.titulo;
        const Aprobada = this.props.item.EstatusDescripcion === EstatusSolicitudes.Aprobada.titulo;
        const Rechazada = this.props.item.EstatusDescripcion === EstatusSolicitudes.Rechazada.titulo;
        const RechazadaArea = this.props.item.EstatusDescripcion === EstatusSolicitudes.RechazadaArea.titulo;
        const RevisionArea = this.props.item.EstatusDescripcion === EstatusSolicitudes.RevisionArea.titulo;
        const RechazadaDireccion = this.props.item.EstatusDescripcion === EstatusSolicitudes.RechazadaDireccion.titulo;
        const RevisionDireccion = this.props.item.EstatusDescripcion === EstatusSolicitudes.RevisionDireccion.titulo;
        
        const rolResponsable = this.props.item.RolResponsableDescripcion;

        //Mostrar el botón de Editar
        if
        (
            (AdministradorBoveda && (Revision || Aprobada))
            ||
            ((DireccionArea && RevisionArea) || (DireccionBoveda && RevisionDireccion) )
            ||
            ((GerenteSucursal || GerenteConstruccion || JuridicoAdministrativo || JuridicoInmuebles || (AdministradorBoveda && rolResponsable === Roles.AdministradorBoveda.titulo)) && (Pendiente || Rechazada || RechazadaArea || RechazadaDireccion) )
        )
        {
            menuItems.push({
                key: 'EditarSolicitud',
                name: "Editar solicitud",
                iconProps: { iconName: 'Edit' },
                disabled: this.props.item.Id <= 0,
                onClick: () => { this.controlOpcion('EditarSolicitud'); }
            });
        }


        //Mostrar el botón de Ver Historial

        if
        (!Pendiente){
            menuItems.push(
            {
                key: 'VerHistorial',
                name: "Ver historial",
                iconProps: { iconName: 'TimeEntry' },
                disabled: this.props.item.Id <= 0,
                onClick: () => { this.controlOpcion('VerHistorial'); }
            });
        }

        return (
            <div>
                <TooltipHost
                    content={strings.MensajeToolTip}
                    id={"tooltip"}
                >
                    <IconButton id='ContextualMenuButton1'
                        text=''
                        width='30'
                        split={false}
                        aria-describedby={"tooltipId"}
                        iconProps={{ iconName: 'More' }}
                        menuIconProps={{ iconName: '' }}
                        menuProps={{
                            shouldFocusOnMount: true,
                            items: menuItems
                        }} />
                </TooltipHost>
            </div>
        );
    }

    private controlOpcion = (optionType: string) : void => {
        this.props.clickOpcion(this.props.item, optionType);
    }
}