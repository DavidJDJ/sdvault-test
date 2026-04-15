import * as React from "react";
import { CommandBar, ICommandBarItemProps, Label, TextField, Spinner, PrimaryButton, ComboBox } from "@fluentui/react";
import { FiltrosDashboardSolicitudes, FiltroBuscador, FieldType, FiltroBuscadorGroup, Usuario  } from "../../../../general/data/entities";
import styles from "./FormFiltrosBusquedaSolicitudes.module.scss";

export interface IFormFiltrosBusquedaSolicitudesProps {
    buscandoSolicitudes: boolean;
    busquedaSolicitudes(filtros:FiltroBuscador[]):any;
    datosUsuarioLogueado: Usuario;
    listadoSucursales: any[];
    listadoTiposSolicitud: any[];
}
export interface IFormFiltrosBusquedaSolicitudesState {
    filtros: FiltrosDashboardSolicitudes;
    filtrosSeleccionados: FiltroBuscador[];
    mostrarFormularioFiltros: boolean;
}
export default class FormFiltrosBusquedaSolicitudes extends React.Component<IFormFiltrosBusquedaSolicitudesProps, IFormFiltrosBusquedaSolicitudesState>{

    constructor(props: IFormFiltrosBusquedaSolicitudesProps) {
        super(props);
        this.state = {
            filtros: new FiltrosDashboardSolicitudes(),
            filtrosSeleccionados: [],
            mostrarFormularioFiltros: true,
        }
    }

    private limpiarFiltros = () : void => {
        this.setState({ filtros: new FiltrosDashboardSolicitudes() , filtrosSeleccionados: []  });
    }

    private mostrarOcultarFormulario = () : void => {
        this.setState({ mostrarFormularioFiltros: !this.state.mostrarFormularioFiltros });
    }

    private modificarValorFiltro = (e: any): void => {
        const { title, value } = e.target;
        const elem: any = this.state.filtros;
        elem[title] = value;
        this.editarFiltro(title, value, FieldType.TextField, elem);
    }

    private modificarValorFiltroSucursal = (e: any, selectedOption: any) : void => {
        const field = "Sucursal";
        const filterData: any = this.state.filtros;
        filterData[field] = selectedOption;
        this.editarFiltro("SucursalId", selectedOption.key, FieldType.NumberField, filterData);
    }

    private modificarValorFiltroTipoSolicitud = (e: any, selectedOption: any) : void => {
        const field = "TipoSolicitud";
        const filterData: any = this.state.filtros;
        filterData[field] = selectedOption;
        this.editarFiltro("TipoSolicitudId", selectedOption.key, FieldType.NumberField, filterData);
    }

    private editarFiltro(fieldName: string, fieldValue: any, fieldType: FieldType, filterData: any, fieldGroup: FiltroBuscadorGroup = FiltroBuscadorGroup.And): void {
        const CurrentFilers: FiltroBuscador[] = this.state.filtrosSeleccionados;
        const filterUpdate = CurrentFilers.filter(x => x.Field === fieldName);
        if (filterUpdate.length > 0) {
            const index = CurrentFilers.indexOf(filterUpdate[0]);
            if (fieldValue === "" || fieldValue === 0 || fieldValue === null)
                CurrentFilers.splice(index, 1);
            else
                CurrentFilers[index] = { Field: fieldName, Type: fieldType, Value: fieldValue, Group: fieldGroup };
        }
        else {
            if (fieldName !== "SucursalId" || (fieldName === "SucursalId" && fieldValue !== 0)) {
                const newFilter = new FiltroBuscador();
                newFilter.Field = fieldName;
                newFilter.Type = fieldType;
                newFilter.Value = fieldValue;
                newFilter.Group = fieldGroup;
                CurrentFilers.push(newFilter);
            }
        }
        this.setState({
            filtrosSeleccionados: CurrentFilers,
            filtros: filterData
        });
    }

    private onBuscarSolicitudes = ():void => {
        this.props.busquedaSolicitudes(this.state.filtrosSeleccionados);
    }

    public render() : React.ReactElement<IFormFiltrosBusquedaSolicitudesProps> {

        const commandBarPrimary: ICommandBarItemProps[] = [
            {
                key: 'limpiarFiltros',
                text: 'Limpiar Filtros',
                iconProps: { iconName: 'ClearFilter' },
                onClick: () => this.limpiarFiltros(),
            },
        ];

        const commandBarFar: ICommandBarItemProps[] = [
            {
                key: 'ocultarFiltros',
                text: 'Mostrar / Ocultar filtros',
                ariaLabel: 'Mostrar / Ocultar filtros',
                iconOnly: true,
                iconProps: { iconName: this.state.mostrarFormularioFiltros ? 'ChevronUp' : 'ChevronDown' },
                onClick: this.mostrarOcultarFormulario,
            }
        ];

        return (
            <div className={styles.formFiltrosBusquedaSolicitudes}>
                {
                    this.props.datosUsuarioLogueado.Rol.Id > 0 ? <div>
                        <CommandBar
                            items={commandBarPrimary}
                            farItems={commandBarFar}
                        />
                        {this.state.mostrarFormularioFiltros ?
                            <div className={styles.searchForm}>
                                <div className={styles.row}>
                                    <div className={styles.column}>
                                        <Label>Folio</Label>
                                        <TextField title="Title" value={this.state.filtros.Title} onChange={this.modificarValorFiltro}
                                        />
                                    </div>

                                    <div className={styles.column}>
                                        <ComboBox
                                            label="Tipo de solicitud"
                                            options={this.props.listadoTiposSolicitud}
                                            onChange={this.modificarValorFiltroTipoSolicitud}
                                            selectedKey={this.state.filtros.TipoSolicitud.key}
                                            placeholder="Seleccione una opción"
                                        />
                                    </div>
                                    <div className={styles.column}>
                                        <ComboBox
                                            label="Sucursal"
                                            options={this.props.listadoSucursales}
                                            onChange={this.modificarValorFiltroSucursal}
                                            selectedKey={this.state.filtros.Sucursal.key}
                                            placeholder="Seleccione una opción"
                                        />
                                    </div>
                                </div>
                                <div className={styles.butonContainer}>
                                    {this.props.buscandoSolicitudes ?
                                        <div><Spinner label="Cargando..." ariaLive="assertive" labelPosition="right" /></div> :
                                        <PrimaryButton text="Buscar solicitudes" onClick={this.onBuscarSolicitudes}  />
                                    }
                                </div>
                            </div> : null}
                    </div> : null
                }
            </div>
        );
    }
}