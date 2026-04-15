# Penrose tenant variant — interactive auth, targets /sites/dev on penrosetechnologies.
# Skips the .sppkg install / Add-PnPPageWebPart block (not needed for local dev via gulp serve).

Import-Module PnP.PowerShell -RequiredVersion 2.12.0

$SiteURL = "https://penrosetechnologies.sharepoint.com/sites/dev"

Connect-PnPOnline -Url $SiteURL -UseWebLogin

function AddIndex($ListName,$FieldName){
    write-host 'Agregando indice del campo' $FieldName 'en la lista' $ListName -ForegroundColor Yellow
    $Field = Get-PnPField -List $ListName -Identity $FieldName
    $Field.Indexed = $True
    $Field.Update()
    Invoke-PnPQuery
}

function EnforceUniqueValues($ListName,$FieldName){
    write-host 'Aplicando valores unicos al campo' $FieldName 'en la lista' $ListName -ForegroundColor Yellow
    $Field = Get-PnPField -List $ListName -Identity $FieldName
    $Field.EnforceUniqueValues = $True
    $Field.Update()
    Invoke-PnPQuery
}

Invoke-PnPSiteTemplate -Path .\BovedaAdminDoc.xml

AddIndex -ListName "Aprobadores" -FieldName "RolResponsable"
AddIndex -ListName "CondicionesDocumento" -FieldName "Title"
AddIndex -ListName "CondicionesDocumento" -FieldName "Activo"
AddIndex -ListName "ConfiguracionRecurrencia" -FieldName "Title"
AddIndex -ListName "ContadorConsecutivos" -FieldName "Anio"
AddIndex -ListName "EstatusRevisionDocumento" -FieldName "Title"
AddIndex -ListName "EstatusRevisionDocumento" -FieldName "Activo"
AddIndex -ListName "EstatusSolicitud" -FieldName "Title"
AddIndex -ListName "EstatusSolicitud" -FieldName "Activo"
AddIndex -ListName "FlujoEstatusSolicitudes" -FieldName "EstatusActual"
AddIndex -ListName "FlujoEstatusSolicitudes" -FieldName "TipoSolicitud"
AddIndex -ListName "HistorialSolicitudes" -FieldName "FolioSolicitud"
AddIndex -ListName "HistorialSolicitudes" -FieldName "SolicitudId"
AddIndex -ListName "PlantillasNotificaciones" -FieldName "TipoNotificacion"
AddIndex -ListName "Roles" -FieldName "Activo"
AddIndex -ListName "Roles" -FieldName "SeguimientoSolicitudesResguardo"
AddIndex -ListName "Roles" -FieldName "Title"
AddIndex -ListName "Solicitudes" -FieldName "Asignado"
AddIndex -ListName "Solicitudes" -FieldName "Created"
AddIndex -ListName "Solicitudes" -FieldName "Author"
AddIndex -ListName "Solicitudes" -FieldName "EstatusSolicitudDescripcion"
AddIndex -ListName "Solicitudes" -FieldName "EstatusSolicitudId"
AddIndex -ListName "Solicitudes" -FieldName "FechaCompromiso"
AddIndex -ListName "Solicitudes" -FieldName "FechaFinalizacion"
AddIndex -ListName "Solicitudes" -FieldName "Responsable"
AddIndex -ListName "Solicitudes" -FieldName "RolResponsableDescripcion"
AddIndex -ListName "Solicitudes" -FieldName "RolResponsableId"
AddIndex -ListName "Solicitudes" -FieldName "RolSolicitanteDescripcion"
AddIndex -ListName "Solicitudes" -FieldName "RolSolicitanteId"
AddIndex -ListName "Solicitudes" -FieldName "SucursalDescripcion"
AddIndex -ListName "Solicitudes" -FieldName "SucursalId"
AddIndex -ListName "Solicitudes" -FieldName "TipoSolicitudDescripcion"
AddIndex -ListName "Solicitudes" -FieldName "TipoSolicitudId"
AddIndex -ListName "Solicitudes" -FieldName "Title"
AddIndex -ListName "TiposDocumento" -FieldName "Title"
AddIndex -ListName "TiposDocumento" -FieldName "Consecutivo"
AddIndex -ListName "TiposDocumento" -FieldName "Activo"
AddIndex -ListName "TiposDocumentoSolicitudes" -FieldName "Solicitud"
AddIndex -ListName "TiposNotificaciones" -FieldName "Activo"
AddIndex -ListName "TiposNotificaciones" -FieldName "Title"
AddIndex -ListName "TiposSolicitud" -FieldName "Title"
AddIndex -ListName "TiposSolicitud" -FieldName "Activo"
AddIndex -ListName "TiposTramite" -FieldName "Activo"
AddIndex -ListName "TiposTramite" -FieldName "Title"

EnforceUniqueValues -ListName "Aprobadores" -FieldName "RolResponsable"
EnforceUniqueValues -ListName "CondicionesDocumento" -FieldName "Title"
EnforceUniqueValues -ListName "ConfiguracionRecurrencia" -FieldName "Title"
EnforceUniqueValues -ListName "ContadorConsecutivos" -FieldName "Anio"
EnforceUniqueValues -ListName "EstatusRevisionDocumento" -FieldName "Title"
EnforceUniqueValues -ListName "EstatusSolicitud" -FieldName "Title"
EnforceUniqueValues -ListName "Roles" -FieldName "Title"
EnforceUniqueValues -ListName "Solicitudes" -FieldName "Title"
EnforceUniqueValues -ListName "TiposDocumento" -FieldName "Title"
EnforceUniqueValues -ListName "TiposDocumento" -FieldName "Consecutivo"
EnforceUniqueValues -ListName "TiposNotificaciones" -FieldName "Title"
EnforceUniqueValues -ListName "TiposSolicitud" -FieldName "Title"
EnforceUniqueValues -ListName "TiposTramite" -FieldName "Title"

Write-Host 'Instalacion finalizada! (solo plantilla + indices; no se instalo el .sppkg)' -ForegroundColor Green
