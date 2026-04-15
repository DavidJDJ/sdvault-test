import * as React from "react";
import { SolicitudBoveda, Usuario } from "../../../general/data/entities";
import { IColumn, DetailsList, SelectionMode, DetailsListLayoutMode, ConstrainMode, IGroup } from "@fluentui/react";
import { MenuContextualGrid, IMenuContextualGridProps } from "./MenuContextualGrid";

export interface IGridProps {
    loadMoreItems: any;
    listData: SolicitudBoveda[];
    nextPageData: string;
    controlOpciones: any;
    datosUsuarioLogueado: Usuario;
}

export interface IGridState {
    selectedItem: any;
}

export default class GridDashboardSolicitudes extends React.Component<IGridProps, IGridState> {

    private _columns: IColumn[];

    constructor(props: IGridProps) {
        super(props);
        this._columns = [
            { key: 'Folio', name: 'Folio', fieldName: 'Folio', minWidth: 85, maxWidth:85, isResizable: true },
            {
                key: "opciones",
                name: "",
                minWidth: 60,
                maxWidth: 60,
                onRender: (rowitem: SolicitudBoveda) => {
                    const element: React.ReactElement<IMenuContextualGridProps> = React.createElement(
                        MenuContextualGrid,
                        {
                            item: rowitem,
                            clickOpcion: (elem: any, tipoOpcion: string) => { this.props.controlOpciones(elem, tipoOpcion) },
                            datosUsuarioLogueado: this.props.datosUsuarioLogueado
                        });
                    return element;
                }
            },
            { key: 'TipoSolicitud', name: 'Tipo de solicitud', fieldName: 'TipoSolicitudDescripcion', minWidth:120, maxWidth: 120, isResizable: true },
            { key: 'FechaCaptura', name: 'Fecha de captura', fieldName: 'Creado', minWidth:120, maxWidth: 120, isResizable: true },
            { key: 'FechaCompromiso', name: 'Fecha Compromiso', fieldName: 'FechaCompromiso', minWidth:170, maxWidth: 170, isResizable: true },
            { key: 'RolResponsable', name: 'Rol Responsable', fieldName: 'RolResponsableDescripcion', minWidth:150, maxWidth: 150, isResizable: true },
            { key: 'Responsable', name: 'Responsable', fieldName: 'Responsable', minWidth:150, maxWidth: 150, isResizable: true }
        ];

        this.state = {
            selectedItem: null,
        };
    }

    public render() : React.ReactElement<IGridProps> {

        const _solicitudesOrdendasSucursal = [...this.props.listData].sort(
            (a, b) => a.SucursalId - b.SucursalId
            
        );

        let _groups: IGroup[] = [];
        if(this.props.listData.length > 0)
        {
            _groups = _solicitudesOrdendasSucursal.reduce((acc, cur) => {
                const { SucursalId, SucursalDescripcion } = cur;
                const group = {
                    key: SucursalId,
                    name: `${SucursalDescripcion}`,
                    startIndex: 0,
                    count: 1,
                    isCollapsed: false,
                };
                if (acc.length === 0) {
                    acc.push(group);
                    return acc;
                } else if (acc[acc.length - 1].key !== cur.SucursalId) {
                    const { count, startIndex } = acc[acc.length - 1];
                    acc.push({
                        ...group,
                        startIndex: count + startIndex,
                    });
                    return acc;
                }
                acc[acc.length - 1].count++;
                return acc;
            }, []);
        }
        return (
            <DetailsList
                items={_solicitudesOrdendasSucursal}
                columns={this._columns}
                setKey="set"
                selectionMode={SelectionMode.none}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                constrainMode={ConstrainMode.unconstrained}
                onShouldVirtualize={() => true}
                onRenderMissingItem={(index, rowData) => {
                    this.props.loadMoreItems(this.props.nextPageData);
                    return null;
                }}
                selectionPreservedOnEmptyClick={false}
                ariaLabelForSelectionColumn="Toggle selection"
                ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                checkButtonAriaLabel="select row"
                groups={_groups}
            />
        );
    }
}