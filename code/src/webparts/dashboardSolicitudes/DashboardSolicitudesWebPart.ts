import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'DashboardSolicitudesWebPartStrings';
import DashboardSolicitudes from './components/DashboardSolicitudes';
import { IDashboardSolicitudesProps } from './components/IDashboardSolicitudesProps';
import { getSP } from "../../pnpjs-presets";
import { IGeneralService } from '../../general/data/interfaces/IGeneralService';
import { GeneralService } from '../../general/data/services/GeneralService';
import { ISolicitudesBovedaService } from "../../general/data/interfaces/ISolicitudesBovedaService";
import { SolicitudBovedaService } from "../../general/data/services/SolicitudBovedaService";
export interface IDashboardSolicitudesWebPartProps {
  description: string;
}

export default class DashboardSolicitudesWebPart extends BaseClientSideWebPart<IDashboardSolicitudesWebPartProps> {

  private spGeneralService: IGeneralService;
  private spServicioSolicitudBoveda: ISolicitudesBovedaService;

  protected onInit(): Promise<void> {
    this.context.statusRenderer.displayLoadingIndicator(
      this.domElement,
      "DashboardSolicitudes"
    );
    return super.onInit().then((_) => {
      this.spGeneralService = new GeneralService(this.context);
      this.spServicioSolicitudBoveda = new SolicitudBovedaService(
        this.context
      );
      getSP(this.context);
    });
  }

  public render(): void {
    const element: React.ReactElement<IDashboardSolicitudesProps> =
      React.createElement(DashboardSolicitudes, {
        description: this.properties.description,
        context: this.context,
        spGeneralService: this.spGeneralService,
        spServicioSolicitudBoveda: this.spServicioSolicitudBoveda,
      });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
