import * as React from 'react';
import * as strings from 'GlobalStrings';
import styles from './DashboardSolicitudes.module.scss';
import { MessageBar, MessageBarType, Pivot, PivotItem, Modal, IconButton, getTheme, IIconProps, IButtonStyles, Spinner, SpinnerSize, IDropdownOption } from '@fluentui/react';
import { IDashboardSolicitudesProps } from './IDashboardSolicitudesProps';
import FormFiltrosBusquedaSolicitudes from './FormFiltrosBusquedaSolicitudes/FormFiltrosBusquedaSolicitudes';
import { EstatusSolicitudes, Usuario, FiltroBuscador, FieldType, Operator, FiltroBuscadorGroup, ResultadoBusquedaSolicitudes, SolicitudBoveda, Historial, Roles } from '../../../general/data/entities';
import GridHistorial from './GridHistorial';
import GridDashboardSolicitudes from './GridDashboardSolicitudes';
import { mapListToDropDownItems } from '../../../general/helpers/HelperGeneral';

export interface IDashboardSolicitudesState {
  buscandoSolicitudes: boolean,
  cargandoModal: boolean,
  datosHistorial: Historial[];
  datosUsuarioLogueado: Usuario;
  estatusSeleccionadoPivote: string,
  estatusObtenidos: any[];
  filtrosBaseRol: FiltroBuscador[];
  filtrosSeleccionados: FiltroBuscador[];
  listadoSucursales: any[];
  listadoTiposSolicitud: any[];
  mostrarModal: boolean,
  resultadoBusquedaSolicitudes: ResultadoBusquedaSolicitudes;
  solicitudesAgrupadasEstatus: any[];
  solicitudesFiltradasTab: SolicitudBoveda[],
  tituloModal: string
}

const theme = getTheme();
const cancelIcon: IIconProps = { iconName: 'Cancel' };
const iconButtonStyles: Partial<IButtonStyles> = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px',
  },
  rootHovered: {
    color: theme.palette.neutralDark,
  },
};


export default class DashboardSolicitudes extends React.Component<IDashboardSolicitudesProps, IDashboardSolicitudesState> {

  constructor(props: IDashboardSolicitudesProps) {
    super(props);
    this.state = {
      buscandoSolicitudes: false,
      cargandoModal: false,
      datosHistorial: [],
      datosUsuarioLogueado: new Usuario(),
      estatusObtenidos: [],
      estatusSeleccionadoPivote: "0",
      filtrosBaseRol: [],
      filtrosSeleccionados: [],
      listadoSucursales: [],
      listadoTiposSolicitud: [],
      mostrarModal: false,
      resultadoBusquedaSolicitudes: new ResultadoBusquedaSolicitudes(),
      solicitudesAgrupadasEstatus: [],
      solicitudesFiltradasTab: [],
      tituloModal: ""
    }
  }

  public componentDidMount(): void {

    const initializationRequests = [];
    initializationRequests.push(this.props.spGeneralService.obtenerDatosUsuario());

    Promise.all(initializationRequests).then(result => {

      const datosUsuario: Usuario = result[0] as Usuario;
      this.setState({ datosUsuarioLogueado: datosUsuario });

      if (datosUsuario.Rol.Id > 0) {
        const filtrosBasePorRol: FiltroBuscador[] = this.obtenerFiltrosBaseRol(datosUsuario);
        this.setState({ filtrosBaseRol: [...filtrosBasePorRol], filtrosSeleccionados: [...filtrosBasePorRol] }, this.ejecutarBusquedaSolicitudes);
        
        //El desplegable mostrará todas las sucursales, siempre.
        this.props.spServicioSolicitudBoveda.obtenerSucursales().then(resultadoSucursales => {
          const sucursales: IDropdownOption[] = [{ key: 0, text: "Todas" }, ...mapListToDropDownItems([...resultadoSucursales], true)];
          this.setState({ filtrosBaseRol: filtrosBasePorRol, filtrosSeleccionados: filtrosBasePorRol, listadoSucursales: sucursales }, this.ejecutarBusquedaSolicitudes);
        }).catch((error) => {
          console.log("Error en obtenerSucursales en componentDidMount", error);
        });
       
        this.props.spServicioSolicitudBoveda.obtenerTiposSolicitud().then(resultadoTipos => {
          const tiposSolicitud: IDropdownOption[] = [{ key: 0, text: "Todas" }, ...resultadoTipos];
          this.setState({ filtrosBaseRol: filtrosBasePorRol, filtrosSeleccionados: filtrosBasePorRol, listadoTiposSolicitud: tiposSolicitud }, this.ejecutarBusquedaSolicitudes);
        }).catch((error) => {
          console.log("Error en obtenerTiposSolicitud en funcion componentDidMount", error);
        })
      }

    }).catch((error) => {
      console.log("Error componentDidMount DashboardSolicitudes");
    });
  }

  private obtenerFiltrosBaseRol = (datosUsuario: Usuario): FiltroBuscador[] => {

    let filtrosBasePorRol: FiltroBuscador[] = [];
    const AdministradorBoveda = datosUsuario.Rol.Id === Roles.AdministradorBoveda.id;
    const DireccionArea = datosUsuario.Rol.Id === Roles.DireccionArea.id;
    const DireccionBoveda = datosUsuario.Rol.Id === Roles.DireccionBoveda.id;

    if (AdministradorBoveda) {
      filtrosBasePorRol = [
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.Pendiente.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.Revision.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.Aprobada.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.Rechazada.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "FechaFinalizacion", Type: FieldType.DateField, Value: this.obtenerFechaFiltroSolicitudesFinalizadas(-30), Operator: Operator.GreaterThanOrEqualTo, Group: FiltroBuscadorGroup.Or }
      ];
      return filtrosBasePorRol;
    }
    else if (DireccionArea || DireccionBoveda) {
      filtrosBasePorRol = [
        { Field: "Asignado", Type: FieldType.LookupField, Value: datosUsuario.Nombre, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.And }
      ];
      return filtrosBasePorRol;
    }
    else {
      filtrosBasePorRol = [
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.Pendiente.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.Revision.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.Aprobada.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.Rechazada.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.RevisionArea.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.RevisionDireccion.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.RechazadaArea.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "EstatusSolicitudId", Type: FieldType.NumberField, Value: EstatusSolicitudes.RechazadaDireccion.id, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "FechaFinalizacion", Type: FieldType.DateField, Value: this.obtenerFechaFiltroSolicitudesFinalizadas(-30), Operator: Operator.GreaterThanOrEqualTo, Group: FiltroBuscadorGroup.Or },
        { Field: "Responsable", Type: FieldType.LookupField, Value: datosUsuario.Nombre, Operator: Operator.EqualTo, Group: FiltroBuscadorGroup.And },
      ];
      return filtrosBasePorRol;
    }
  }

  private obtenerFechaFiltroSolicitudesFinalizadas = (numeroDiasAgregar: number, date = new Date()): Date => {
    date.setDate(date.getDate() + numeroDiasAgregar);
    return date;
  }

  private ejecutarBusquedaSolicitudes = (): void => {
    this.setState({ buscandoSolicitudes: true });
    const filters = this.state.filtrosSeleccionados.slice();
    this.props.spServicioSolicitudBoveda.buscarSolicitudes(filters, "").then(pagedListData => {
      const resultadoData = pagedListData.Items;
      if (pagedListData.NextPageToken !== null && pagedListData.NextPageToken !== null) {
        resultadoData.push(null);
      }
      const resultado = pagedListData;
      resultado.Items = resultadoData.sort(function (a, b) { return a.EstatusId - b.EstatusId });
      this.agruparSolicitudes(resultado);
    }).catch((error) => {
      console.log("Error en buscarSolicitudes en funcion ejecutarBusquedaSolicitudes");
    });
  }

  private agruparSolicitudes = (resultadoSolicitudes: ResultadoBusquedaSolicitudes): void => {

    let solicitudesAgrupadasEstatus: any = [];
    let estatusObtenidos: any[] = [];
    let solicitudesFiltradas: SolicitudBoveda[] = [];

    if (resultadoSolicitudes.Items.length > 0) {
      solicitudesAgrupadasEstatus = this.groupBy<SolicitudBoveda>(resultadoSolicitudes.Items, "EstatusDescripcion");
      estatusObtenidos = Object.getOwnPropertyNames(solicitudesAgrupadasEstatus).map(estatus => {
        return ({ nombreEstatus: estatus, count: solicitudesAgrupadasEstatus[estatus].length });
      });
      solicitudesFiltradas = solicitudesAgrupadasEstatus[estatusObtenidos[0].nombreEstatus];
    }
    this.setState({ buscandoSolicitudes: false, resultadoBusquedaSolicitudes: resultadoSolicitudes, solicitudesAgrupadasEstatus: solicitudesAgrupadasEstatus, estatusObtenidos: estatusObtenidos, solicitudesFiltradasTab: solicitudesFiltradas, estatusSeleccionadoPivote: "0" });
  }

  private groupBy<T>(collection: T[], key: keyof T): any {
    const groupedResult = collection.reduce((previous, current) => {
      if (!previous[current[key]]) {
        previous[current[key]] = [] as T[];
      }
      previous[current[key]].push(current);
      return previous;
    }, {} as any);
    return groupedResult
  }

  private seleccionEstatus = (grid: any): void => {
    const estatusSeleccionado = typeof grid.props !== "undefined" ? grid.props.itemID : "";
    if (estatusSeleccionado !== "")
      this.setState({ solicitudesFiltradasTab: this.state.solicitudesAgrupadasEstatus[estatusSeleccionado], estatusSeleccionadoPivote: grid.props.itemKey });
  }

  public loadMoreItems = (nextPageData: string): void => {
    const currentResults: ResultadoBusquedaSolicitudes = this.state.resultadoBusquedaSolicitudes;
    let currentListData = currentResults.Items;
    currentListData = currentListData.filter((el) => {
      return el !== null;
    });
    if (nextPageData !== null && nextPageData !== "") {
      const filters = currentResults.filtros.slice();
      this.props.spServicioSolicitudBoveda.buscarSolicitudes(filters, nextPageData).then(pagedListData => {
        const resultsData = pagedListData.Items;
        if (pagedListData.NextPageToken !== null && pagedListData.NextPageToken !== "") {
          resultsData.push(null);
        }
        currentListData = [...currentListData, ...resultsData];
        currentResults.Items = currentListData;
        currentResults.NextPageToken = pagedListData.NextPageToken;
        this.setState({
          resultadoBusquedaSolicitudes: currentResults
        });
      }).catch((error) => {
        console.log("Error en buscarSolicitudes en funcion loadMoreItems", error);
      });
    }
  }

  private opcionesOnSelect = (item: SolicitudBoveda, optionType: string): void => {
    switch (optionType) {
      case "VerSolicitud": {
        window.location.href = `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${item.Id}&DisplayMode=View`;
        break;
      }
      case "EditarSolicitud": {
        window.location.href = `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${item.Id}&DisplayMode=Edit`;
        break;
      }
      case "VerHistorial": {
        this.cargarHistorial(item);
        break;
      }
      default: {
        window.location.href = `${this.props.context.pageContext.web.absoluteUrl}/SitePages/SolicitudBoveda.aspx?SolicitudId=${item.Id}&DisplayMode=View`;
        break;
      }
    }
  }

  private cargarHistorial = (item: SolicitudBoveda): void => {
    this.setState({ mostrarModal: true, cargandoModal: true, tituloModal: "Historial" });
    this.props.spServicioSolicitudBoveda.obtenerHistorialSolicitud(item.Id).then(resultado => {
      this.setState({
        cargandoModal: false,
        datosHistorial: resultado
      });
    }).catch((error) => {
      console.log("Error en funcion cargarHistorial", error);
    });
  }

  private cerrarModal = (): void => {
    this.setState({ mostrarModal: false });
  }

  public interfazModal(): any {
    if (this.state.cargandoModal)
      return (<div><Spinner size={SpinnerSize.large} /></div>);
    else
      return (<GridHistorial
        datosHistorial={this.state.datosHistorial}
      />);
  }

  private onBuscarSolicitudes = (filtros: FiltroBuscador[]): void => {
    this.setState({ filtrosSeleccionados: [...this.state.filtrosBaseRol, ...filtros] }, this.ejecutarBusquedaSolicitudes);
  }

  public render(): React.ReactElement<IDashboardSolicitudesProps> {

    return (
      <div>
        {this.state.datosUsuarioLogueado.Id !== 0 ?
          <div>
            {this.state.datosUsuarioLogueado.Rol.Id > 0 ? <div className={styles.dashboardSolicitudes}>
              {this.state.filtrosSeleccionados.length > 0 ?
                <div style={{ display: this.state.datosUsuarioLogueado.Rol.Id > 0 ? "block" : "none" }}>
                  <FormFiltrosBusquedaSolicitudes
                    buscandoSolicitudes={this.state.buscandoSolicitudes}
                    busquedaSolicitudes={this.onBuscarSolicitudes}
                    datosUsuarioLogueado={this.state.datosUsuarioLogueado}
                    listadoSucursales={this.state.listadoSucursales}
                    listadoTiposSolicitud={this.state.listadoTiposSolicitud}
                  />
                  < hr />
                  <div className={styles.gridContainer} data-is-scrollable="true">
                    <Pivot onLinkClick={this.seleccionEstatus} overflowBehavior={"menu"} headersOnly={true} selectedKey={this.state.estatusSeleccionadoPivote} >
                      {
                        this.state.estatusObtenidos.map((item, index) => {
                          return (<PivotItem key={`${index}`} headerText={item.nombreEstatus} itemKey={`${index}`} itemID={item.nombreEstatus} itemCount={item.count} />);
                        })
                      }
                    </Pivot>
                    <GridDashboardSolicitudes
                      key="GrdBuscador"
                      loadMoreItems={this.loadMoreItems}
                      listData={this.state.solicitudesFiltradasTab}
                      nextPageData={this.state.resultadoBusquedaSolicitudes.NextPageToken}
                      controlOpciones={this.opcionesOnSelect}
                      datosUsuarioLogueado={this.state.datosUsuarioLogueado}
                    />
                    <Modal
                      isOpen={this.state.mostrarModal}
                      isBlocking={false}
                      containerClassName={styles.textDialog}
                    >
                      <div className={styles.modalHeader}>
                        <span>{this.state.tituloModal}</span>
                        <IconButton
                          styles={iconButtonStyles}
                          iconProps={cancelIcon}
                          ariaLabel="Cerrar"
                          onClick={this.cerrarModal}
                        />
                      </div>
                      <div className={styles.modalBody}>
                        {this.interfazModal()}
                      </div>
                    </Modal>
                  </div>
                </div > : null}
            </div > : <MessageBar messageBarType={MessageBarType.error} isMultiline={false} dismissButtonAriaLabel="Close">
              {strings.MensajeErrorSinRol}
            </MessageBar>
            }
          </div> : null}
      </div>
    );
  }
}
