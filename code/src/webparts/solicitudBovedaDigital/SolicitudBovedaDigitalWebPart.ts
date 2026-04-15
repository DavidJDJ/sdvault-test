import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'SolicitudResguardoDocumentosWebPartStrings';
import SolicitudBovedaDigital from './components/SolicitudBovedaDigital';
import { ISolicitudBovedaDigitalProps } from './components/ISolicitudBovedaDigitalProps';
import { getSP } from "../../pnpjs-presets";
import { IGeneralService } from '../../general/data/interfaces/IGeneralService';
import { GeneralService } from '../../general/data/services/GeneralService';
import { ISolicitudesBovedaService } from '../../general/data/interfaces/ISolicitudesBovedaService';
import { SolicitudBovedaService } from '../../general/data/services/SolicitudBovedaService';
import { INotificacionesService } from '../../general/data/interfaces/INotificacionesService';
import { NotificacionesService } from '../../general/data/services/NotificacionesService';


export interface ISolicitudBovedaDigitalWebPartProps {
  description: string;
}

export default class SolicitudBovedaDigitalWebPart extends BaseClientSideWebPart<ISolicitudBovedaDigitalWebPartProps> {

  private spGeneralService: IGeneralService;
  private spSolicitudBovedaService: ISolicitudesBovedaService;
  private spNotificacionesService: INotificacionesService;

  protected onInit(): Promise<void> {
    this.context.statusRenderer.displayLoadingIndicator(
      this.domElement,
      "SolicitudBovedaDigital"
    );
    return super.onInit().then((_) => {
      this.spGeneralService = new GeneralService(this.context);
      this.spSolicitudBovedaService = new SolicitudBovedaService(this.context);
      this.spNotificacionesService = new NotificacionesService(this.context);
      getSP(this.context);
    });
  }

  public render(): void {
    const element: React.ReactElement<ISolicitudBovedaDigitalProps> = 
    React.createElement(SolicitudBovedaDigital,
      {
        description: this.properties.description,
        context: this.context,
        spGeneralService: this.spGeneralService,
        spSolicitudBovedaService: this.spSolicitudBovedaService,
        spNotificacionesService: this.spNotificacionesService
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
