import { FiltroBuscador, ResultadoBusquedaSolicitudes, Historial, SolicitudBoveda, ContadorTipoSolicitud, TipoDocumento, TipoDocumentoRol, DocumentoBoveda, TiposDocumentoSolicitud } from "../entities";
import { IDropdownOption } from "@fluentui/react";

export interface ISolicitudesBovedaService {
    //Consulta a la lista Solicitudes y obtiene los registros que cumplan con los filtros recibidos
    buscarSolicitudes(filtros: FiltroBuscador[], nextPageToken?: string): Promise<ResultadoBusquedaSolicitudes | undefined>;
    //Obtiene todos los registros de la lista Sucursales
    obtenerSucursales(): Promise<any[]>;
    //Obtiene de la lista HistorialSolicitudes los movimientos que ha tenido una solicitud en particular
    obtenerHistorialSolicitud(solicitudId: number): Promise<Historial[]>;
    //Obtiene el contador de elementos de boveda, se utiliza para generar el folio de la solicitud
    obtenerContador(anio: number): Promise<ContadorTipoSolicitud>;
    //Obtiene el detalle de la solicitud
    obtenerDetalleSolicitud(idSolicitud: number): Promise<SolicitudBoveda>;
    //Obtiene de la lista TiposSolicitud los tipos de solicitud disponibles
    obtenerTiposSolicitud(): Promise<IDropdownOption[]>;
    //Obtiene las Ciudades con su Estado
    obtenerCiudades(): Promise<any[]>;
    //Obtiene los roles del sitio Boveda
    obtenerRoles(): Promise<any[]>;
    //Obtiene los tipos de documento del checklist
    obtenerTiposDocumento(): Promise<TipoDocumento[]>;
    //Obtiene los tipos de documento del checklist con su respectivo Rol responsable
    obtenerTiposDocumentoRol(): Promise<TipoDocumentoRol[]>;
    //Actualiza el contador de elementos de la solicitud , se utiliza para generar el folio de la solicitud
    actualizarContador(contador: any): Promise<boolean>;
    //Crear o actualizar registros en la solicitud
    actualizarSolicitudBoveda(solData: SolicitudBoveda): Promise<number>;
    //Crea un registro en la lista de historial con la información proporcionada
    insertarHistoricoSolicitud(registro: Historial): Promise<number>;
    //Actualiza los documentos de una solicitud
    actualizarAdjuntos(solData: SolicitudBoveda): Promise<any>;
    //Obtiene el catalogo de Condiciones de documento
    obtenerCondicionesDocumento(): Promise<any[]>;
    //Obtiene registros con fecha vigencia mayor a fechaComparar de la biblioteca Boveda  
    obtenerDocumentosVencidosPorSucursal(sucursalId: number, fechaComparar: string): Promise<TiposDocumentoSolicitud[]>;
    //Obtiene el catalogo de EstatusRevisionDocumento
    obtenerEstatusRevisionDocumento(): Promise<any[]>;
    //Actualiza el registro correspondiente de la lista TiposDocumentoSolicitudes y de la biblioteca de documentos Boveda
    actualizarSeguimientoChecklist(solicitudId: number, tipoDocumentoSolicitud: TiposDocumentoSolicitud, adjuntoRelacionado?: DocumentoBoveda): Promise<any>;
    //Obtiene el flujo de estatus de las solicitudes
    obtenerFlujosEstatusSolicitud(): Promise<any>;
    //Obtiene el catalogo de aprobadores
    obtenerAprobadoresSolicitud(): Promise<any>;
    //Actualiza el estatus y el usuario asignado de una solicitud
    actualizarEstatusSolicitud(solicitudData: SolicitudBoveda): Promise<any>
    //Actualiza los metadatos de varios archivos de una solicitud en la biblioteca de boveda
    actualizarItemsAdjuntosSolicitud(adjuntosData: DocumentoBoveda[]): Promise<any>
    //Obtiene los documentos en base a filtro especificado
    obtenerDocumentosPorFiltro(filtro: string): Promise<DocumentoBoveda[]>;
    //Obtiene registros de lista Asuetos
    obtenerAsuetos(): Promise<any[]>;
    //Actualiza tipos de documento de la solicitud especificada por id
    actualizarTiposDocumentoSolicitud(solicitudId: number, tiposDocumentoSolicitud: TiposDocumentoSolicitud[]): Promise<any>;
}