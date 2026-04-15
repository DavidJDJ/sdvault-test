import * as React from "react";
import styles from "./Attachments.module.scss";
import { DropzoneComponent } from "react-dropzone-component";
import { CommandButton, Link, MessageBar, MessageBarType } from "@fluentui/react";
import { SolicitudBoveda } from "../../data/entities";
require("../../../../node_modules/react-dropzone-component/styles/filepicker.css");
require("../../../../node_modules/dropzone/dist/dropzone.css");

export interface IAttachmentsProps {
  solicitud: SolicitudBoveda;
  files: any[];
  disabled?: boolean;
  onAddFile(file: any): void;
  onDeleteExistingFile?(fileName: string): void;
  maxFiles?: number;
}
export interface IAttachmentState {
  fileExtError: boolean;
  mensajeError: string;
}
export class Attachments extends React.Component<IAttachmentsProps, IAttachmentState> {
  private _dropzone: { removeFile: (arg0: any) => void; emit: (arg0: string, arg1: any) => void; removeAllFiles: () => void; };
  private config;
  private djsConfig;
  private eventHandlers;

  constructor(props: IAttachmentsProps) {
    super(props);
    this.state = {
      fileExtError: false,
      mensajeError: ""
    };
    this.config = {
      postUrl: "no-url"
    };
    this.djsConfig = {
      addRemoveLinks: true,
      autoProcessQueue: false,
      dictDefaultMessage: "Arrastre un archivo para cargarlo",
      dictRemoveFile: "Quitar archivo",
      maxFiles: (this.props.maxFiles || 1)
    };
    this.eventHandlers = {
      init: (dz: { removeFile: (arg0: any) => void; emit: (arg0: string, arg1: any) => void; removeAllFiles: () => void; }) => (this._dropzone = dz),
      addedfile: (file: { name: string; }) => {
        const fileExt = file.name.split('.').pop().toUpperCase();
        if (fileExt === 'EXE' || fileExt === 'BIN' || fileExt === 'DEM') {
          this.setState({ fileExtError: true, mensajeError: "Este tipo de archivos no está permitido." }, () => {
            this._dropzone.removeFile(file);
            return false;
          });
        }
        else
          if (this.props.solicitud.Archivos.Files.some(x => x.FileName === file.name))
            this.setState({ fileExtError: true, mensajeError: "Ya cargó un archivo con el mismo nombre." }, () => {
              this._dropzone.removeFile(file);
              return false;
            });
          else {
            if (this.props.files.length >= this.props.maxFiles)
              this.setState({ fileExtError: true, mensajeError: "Solo puede carga un archivo por tipo de documento." }, () => {
                this._dropzone.removeFile(file);
                return false;
              });
            else {
              this.props.onAddFile(file);
              const uploadedfile = file;
              this._dropzone.emit("complete", uploadedfile);
              this.setState({ fileExtError: false, mensajeError: "" });
            }
          }
      },
      complete: (file: any) => this._dropzone.removeAllFiles()
    };
  }

  public _componentWillReceiveProps(nextProps: { files: string | any[]; }): void {
    if (this.props.files.length !== nextProps.files.length && this._dropzone !== null && this._dropzone !== undefined) {
      this._dropzone.removeAllFiles();
    }
  }

  public render(): React.ReactElement<IAttachmentsProps> {
    let droppedFiles;
    if (this.props.files && this.props.files.length > 0)
      droppedFiles = this.props.files.map(f => {
        return (
          <li key={f.FileName}>
            <Link target="_blank" className={styles.fileLink} href={f.Url}>{f.FileName}</Link> &nbsp;&nbsp;&nbsp;
            {this.props.disabled ? null : <CommandButton className={styles.deleteLink} type="button" onClick={this._onDeleted.bind(this, f.FileName)}>Eliminar</CommandButton>}
          </li>
        );
      }
      );

    return (
      <section className={styles.adjuntos}>
        {this.state.fileExtError ? <MessageBar
          messageBarType={MessageBarType.error}
          onDismiss={this._oncloseMessage}
          dismissButtonAriaLabel="Close"
          isMultiline={true}
        >
          {this.state.mensajeError}
        </MessageBar> : null}
        {
          this.props.disabled ? null :
            <div>
              <DropzoneComponent

                config={this.config}
                eventHandlers={this.eventHandlers}
                djsConfig={this.djsConfig}
              />
            </div>
        }
        <aside><ul>{droppedFiles}</ul> </aside>
      </section>
    );
  }

  private _onDeleted = (fileName: string, ev: any): void => {
    this.props.onDeleteExistingFile(fileName);
    this._dropzone.removeAllFiles();
  }
  private _oncloseMessage = (): void => this.setState({ fileExtError: false });
}
export default IAttachmentsProps;
