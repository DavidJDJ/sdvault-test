import { IDropdownOption } from "@fluentui/react";

export class FiltrosDashboardSolicitudes {
    public Title: string; //Folio de la solicitud
    public TipoSolicitud: IDropdownOption;
    public Sucursal: IDropdownOption;
    public FechaEnvio?: Date;

    constructor(){
        this.Title = "";
        this.TipoSolicitud = { key: null } as IDropdownOption;
        this.Sucursal = { key: null } as IDropdownOption;
        this.FechaEnvio = null;
    }
}