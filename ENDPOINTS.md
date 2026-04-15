# Boveda Digital - Endpoints (Service Layer)

This document describes all service-layer endpoints used by the SPFx solution. All calls go through **PnPjs** to the SharePoint REST API against two sites:

- **Boveda site** (`_sp`) - Main application site
- **DatosMaestros site** (`_spDM`) - Master data site (`/sites/DatosMaestrosAdminDoc`)

---

## SolicitudBovedaService

Service for managing vault requests, documents, approvals, and related catalogs.

### Solicitudes (Requests)

| Method | Type | SharePoint List | Description |
|--------|------|-----------------|-------------|
| `buscarSolicitudes(filtros, nextPageToken?)` | READ | `Solicitudes` | Searches requests using CAML query with dynamic filters and server-side pagination via `renderListDataAsStream`. Returns paginated results with `NextPageToken`. |
| `obtenerDetalleSolicitud(idSolicitud)` | READ | `Solicitudes` | Gets full detail of a single request by ID, including related document types (`TiposDocumentoSolicitudes`) and attachments from the `Boveda` library. Expands `Responsable`, `Author`, and `Asignado` user fields. |
| `actualizarSolicitudBoveda(solData)` | WRITE | `Solicitudes` | Creates or updates a request. On **create**: also provisions a folder in the `Boveda` library named `{NumeroSucursal} - {SucursalDescripcion}` and inserts document type records. On **update**: updates document types and attachments. |
| `actualizarEstatusSolicitud(solicitudData)` | WRITE | `Solicitudes` | Updates the status and assigned user of a request. Handles special fields for area/direction review statuses (`HistorialComentariosArea`, `HistorialComentariosDireccion`). Sets `FechaFinalizacion` when status is `Finalizada`. |

### Historial (History)

| Method | Type | SharePoint List | Description |
|--------|------|-----------------|-------------|
| `obtenerHistorialSolicitud(solicitudId)` | READ | `HistorialSolicitudes` | Gets all history records for a request, ordered by most recent first. Each record includes movement type, dates, responsible party, role, status, and comments. |
| `insertarHistoricoSolicitud(registro)` | WRITE | `HistorialSolicitudes` | Inserts a new history record for a request (e.g., creation, approval, rejection, finalization). |

### Documentos y Adjuntos (Documents & Attachments)

| Method | Type | SharePoint Library/List | Description |
|--------|------|-------------------------|-------------|
| `actualizarAdjuntos(solData)` | WRITE | `Boveda` (library) | Processes file uploads and deletions for a request. Uploads go to `Boveda/{NumeroSucursal} - {SucursalDescripcion}/`. Files are renamed with timestamp + request ID. Deletions create a control record and clear the `SolicitudId`. |
| `obtenerDocumentosPorFiltro(filtro)` | READ | `Boveda` (library) | Retrieves documents from the vault library matching a custom OData filter string. Returns metadata including version, review status, condition, and loan status. |
| `obtenerDocumentosVencidosPorSucursal(sucursalId, fechaComparar)` | READ | `Boveda` (library) | Gets documents from a branch whose expiration date (`FechaVencimiento`) is on or before the comparison date. Used for renewal requests. |
| `actualizarSeguimientoChecklist(solicitudId, tipoDocumentoSolicitud, adjuntoRelacionado?)` | WRITE | `TiposDocumentoSolicitudes` + `Boveda` | Updates a checklist item and its related attachment. If `AplicaResguardo` is false and an attachment exists, it creates a deletion record. |
| `actualizarItemsAdjuntosSolicitud(adjuntosData)` | WRITE | `Boveda` (library) | Batch-updates metadata (expiration, version, review status, condition, loan status) on multiple documents in the vault library. |

### Tipos de Documento por Solicitud (Document Types per Request)

| Method | Type | SharePoint List | Description |
|--------|------|-----------------|-------------|
| `actualizarTiposDocumentoSolicitud(solicitudId, tiposDocumentoSolicitud)` | WRITE | `TiposDocumentoSolicitudes` | Batch creates or updates document type records linked to a request. Each record tracks: safekeeping applicability, responsible/admin comments, review status, loan days, and original document return date. |

### Contadores (Counters)

| Method | Type | SharePoint List | Description |
|--------|------|-----------------|-------------|
| `obtenerContador(anio)` | READ | `ContadorConsecutivos` | Gets the current folio counter for a given year. Returns the next available consecutive number. |
| `actualizarContador(contador)` | WRITE | `ContadorConsecutivos` | Increments the folio counter after a request is created. |

### Catalogos (Catalogs)

| Method | Type | SharePoint List / Site | Description |
|--------|------|------------------------|-------------|
| `obtenerSucursales()` | READ | `Sucursales` (DatosMaestros) | Gets all active branches with city and format info. Ordered by branch consecutive number. |
| `obtenerCiudades()` | READ | `Ciudades` (DatosMaestros) | Gets all cities with their associated state. |
| `obtenerTiposSolicitud()` | READ | `TiposSolicitud` | Gets active request types (Resguardo, Prestamo, Renovacion) as dropdown options. |
| `obtenerRoles()` | READ | `Roles` | Gets active roles with permissions flags (`SeguimientoSolicitudesResguardo`, `SolicitarPrestamoDocumentos`). |
| `obtenerTiposDocumento()` | READ | `TiposDocumento` | Gets the document type checklist catalog. Includes procedure type, expiration flag, and confidentiality flag. |
| `obtenerTiposDocumentoRol()` | READ | `TiposDocumentoRol` | Gets the document-type-to-role mapping. Determines which roles are responsible for which document types. |
| `obtenerCondicionesDocumento()` | READ | `CondicionesDocumento` | Gets the document condition catalog (e.g., Original, Copy). |
| `obtenerEstatusRevisionDocumento()` | READ | `EstatusRevisionDocumento` | Gets review statuses (Aprobado, Rechazado). |
| `obtenerFlujosEstatusSolicitud()` | READ | `FlujoEstatusSolicitudes` | Gets the approval workflow state machine: current status -> next status on approval/rejection, per request type. |
| `obtenerAprobadoresSolicitud()` | READ | `Aprobadores` | Gets the approver configuration per responsible role: Area director, Vault direction, and Vault administrator users. |
| `obtenerAsuetos()` | READ | `Asuetos` (DatosMaestros) | Gets holidays list. Used to calculate business-day commitment dates. |

---

## GeneralService

Service for user identity, role resolution, and general configuration.

| Method | Type | SharePoint List / API | Description |
|--------|------|----------------------|-------------|
| `obtenerDatosUsuario()` | READ | SP User API + `GerentesSucursales` (DatosMaestros) | Aggregates current user data: basic info (Id, Name, Email), SharePoint group memberships, branch assignment, area director, and resolved role. Role is determined by group membership priority (AdministradorBoveda > DireccionBoveda > DireccionArea > RegionalZona > GerenteSucursal > GerenteConstruccion > JuridicoInmuebles > JuridicoAdministrativo). |
| `obtenerUsuariosGrupoSP(grupo)` | READ | SP Groups API | Gets all users from a specified SharePoint security group. |
| `obtenerConfiguracionRecurrencia()` | READ | `ConfiguracionRecurrencia` | Gets recurrence configuration (anticipation days, frequency days). Used for document expiration notification scheduling. |

---

## NotificacionesService

Service for sending email notifications through SharePoint lists.

| Method | Type | SharePoint List / Site | Description |
|--------|------|------------------------|-------------|
| `enviarNotificacion(destinatario, tipoNotificacion, tagsCorreo)` | WRITE | `PlantillasNotificaciones` + `Notificaciones` (DatosMaestros) | Fetches an email template by notification type, replaces placeholder tags in subject/body, and inserts a record into the `Notificaciones` list (which a Power Automate flow picks up to send the actual email). |

### Notification Types

| ID | Type | Trigger |
|----|------|---------|
| 1 | `NuevaSolicitudResguardo` | New safekeeping request created |
| 2 | `VencimientoDocumentos` | Document expiration warning |
| 3 | `SolicitudRevisionBoveda` | Request sent to vault review |
| 4 | `SolicitudAprobadaBoveda` | Request approved by vault |
| 5 | `SolicitudRechazadaBoveda` | Request rejected by vault |
| 6 | `NuevaSolicitudPrestamoDireccionArea` | Loan request sent to area direction |
| 7 | `NuevaSolicitudPrestamoDireccionBoveda` | Loan request sent to vault direction |
| 8 | `SolicitudPrestamoAprobada` | Loan request approved |
| 9 | `SolicitudPrestamoRechazada` | Loan request rejected |
| 10 | `SolicitudPrestamoFinalizada` | Loan request finalized |
| 11 | `SolicitudFinalizada` | Request finalized |

---

## SharePoint Lists Reference

### Boveda Site

| List/Library | Internal Name | Purpose |
|-------------|---------------|---------|
| `Solicitudes` | listaSolicitudes | Main requests list |
| `HistorialSolicitudes` | listaHistorialSolicitudes | Request activity history |
| `Boveda` | bibliotecaBoveda | Document library (vault storage) |
| `TiposDocumentoSolicitudes` | listaTiposDocumentoSolicitudes | Document checklist items per request |
| `ContadorConsecutivos` | listaControlContadores | Folio sequential counters |
| `TiposSolicitud` | listaTiposSolicitud | Request type catalog |
| `Roles` | listaRoles | Roles catalog |
| `TiposDocumento` | listaTiposDocumento | Document type catalog |
| `TiposDocumentoRol` | listaTiposDocumentoRol | Document type to role mapping |
| `CondicionesDocumento` | listaCondicionesDocumento | Document condition catalog |
| `EstatusRevisionDocumento` | listaEstatusRevisionDocumento | Review status catalog |
| `ControlEliminacionDocumentos` | listaControlEliminacionDocumentos | Soft-delete control records |
| `FlujoEstatusSolicitudes` | listaFlujoEstatusSolicitudes | Approval workflow state machine |
| `Aprobadores` | listaAprobadores | Approver configuration |
| `ConfiguracionRecurrencia` | listaConfiguracionRecurrencia | Notification recurrence settings |
| `PlantillasNotificaciones` | listaPlantillaNotificaciones | Email templates |

### DatosMaestros Site (`/sites/DatosMaestrosAdminDoc`)

| List | Internal Name | Purpose |
|------|---------------|---------|
| `Sucursales` | listaSucursales | Branch catalog |
| `Ciudades` | listaCiudades | City catalog |
| `GerentesSucursales` | listaGerentesSucursales | Branch-to-manager assignments |
| `Notificaciones` | listaNotificaciones | Outbound notification queue (picked up by Power Automate) |
| `Asuetos` | listaAsuetos | Holidays catalog |

---

## Security Groups (Roles)

| Group Name | Role ID | Priority |
|------------|---------|----------|
| Administrador Boveda | 7 | Highest |
| Direccion de Boveda | 1 | |
| Direccion de Area | 6 | |
| Regional Zona | 8 | |
| Gerente de Sucursal | 2 | |
| Gerente de Construccion | 3 | |
| Juridico de Inmuebles | 4 | |
| Juridico Administrativo | 5 | Lowest |

---

## Request Status Flow

| ID | Status | Description |
|----|--------|-------------|
| 1 | Pendiente | Initial state |
| 2 | En Revision | Under vault admin review |
| 3 | Aprobada | Approved |
| 4 | Rechazada | Rejected |
| 5 | Finalizada | Completed |
| 6 | En Revision Area | Under area direction review |
| 7 | Rechazada Area | Rejected by area direction |
| 8 | En Revision Direccion Boveda | Under vault direction review |
| 9 | Rechazada Direccion Boveda | Rejected by vault direction |
