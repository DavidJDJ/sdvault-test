import * as React from "react";
import * as moment from "moment";
import { Historial } from "../../../general/data/entities";
import { ConstrainMode, DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from "@fluentui/react";

export interface IHistorialProps {
  datosHistorial: Historial[];
}
export interface IHistorialState {
  viewFields: IColumn[];
}

export default class GridHistorial extends React.Component<IHistorialProps, IHistorialState> {
  constructor(props: IHistorialProps) {
    super(props);
    const viewFields: IColumn[] = [
        { key: "Folio", fieldName: "FolioSolicitud", name: "Folio de solicitud", isResizable: true, minWidth: 0, maxWidth: 150 },
        { key: "Estatus", fieldName: "Estatus", name: "Estatus", isResizable: true, minWidth: 0, maxWidth: 100 },
        { key: "FechaMovimiento", fieldName: "FechaMovimiento", name: "Fecha del movimiento", isResizable: true, minWidth: 0, maxWidth: 150,
            onRender: (item) => { const formatedDate = item.FechaEntrada !== "" ? moment(item.FechaEntrada, moment.ISO_8601).format("DD/MM/YYYY hh:mm a") : ""; return formatedDate; }
        },
        { key: "Responsable", fieldName: "Responsable", name: "Responsable", isResizable: true, minWidth: 150, maxWidth: 150 },
        { key: "Rol", fieldName: "Rol", name: "Rol", isResizable: true, minWidth: 0, maxWidth: 150 },
        { key: "Comentarios", fieldName: "Comentarios", name: "Comentarios", isResizable: true, minWidth: 0, maxWidth: 2000 }
    ];

    this.state = {
      viewFields: viewFields
    };
  }

  public render() : React.ReactElement<IHistorialProps> {
    return (
      <div>
        <DetailsList
          items={this.props.datosHistorial}
          columns={this.state.viewFields}
          selectionMode={SelectionMode.none}
          layoutMode={DetailsListLayoutMode.fixedColumns}
          constrainMode={ConstrainMode.unconstrained}
        />
      </div>
    );
  }
}