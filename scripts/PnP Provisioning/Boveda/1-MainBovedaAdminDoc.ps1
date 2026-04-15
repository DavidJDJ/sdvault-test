#Url del sitio destino
$SiteURL = "https://soriana0.sharepoint.com/sites/BovedaAdminDoc"

#Correo del usuario instalador para eliminar permiso por defecto que asigna el proceso
$AdminEmail = "t_victorcr@soriana.com"

#Permiso que se asigna por defecto al usuario instalador que se eliminará
$RoleToRemove = "Control total"

#Id del app que se instalará (Generado desde la solución en spfx)
$IdApp = "51141bde-6f41-4581-9175-d6a668e2ca84"

#Se solicitan credenciales
$credentials = Get-Credential
Connect-PnPOnline -Url $SiteURL -Credentials $credentials

#Deshabilita Edición rapida de la lista y modifica Título para que no sea requerido si se especifica $IsTitleNotRequired = true
function CustomizeList($ListName,$IsTitleNotRequired) { 
    Write-Host 'Configurando...'$ListName -ForegroundColor Yellow
    if($IsTitleNotRequired){
        $Field = Get-PnPField -List $ListName -Identity "Title"
        $Field.Required = $false
        $Field.Update()
    }
    $List = Get-pnpList -Identity $ListName
    $List.DisableGridEditing = $True
    $List.Update()
    Invoke-PnPQuery
}

#Elimina el permiso de control total que se agrega por defecto
function DeleteCustomRole($ListName){
    Write-Host 'Eliminando permisos personalizados...'$ListName -ForegroundColor Yellow
    Set-PnPListPermission -Identity $ListName -User $AdminEmail -RemoveRole $RoleToRemove
}

#Renombra el campo titulo de las listas
function ChangeTitle($ListName,$DisplayName){
    $Field = Get-PnPField -List $ListName -Identity "Title"
    $Field.Title = $DisplayName
    $Field.Update()
    Invoke-PnPQuery
}

#Agrega índice a lista
function AddIndex($ListName,$FieldName){
    write-host 'Agregando índice del campo' $FieldName 'en la lista' $ListName -ForegroundColor Yellow
    $Field = Get-PnPField -List $ListName -Identity $FieldName
    $Field.Indexed = $True
    $Field.Update()
    Invoke-PnPQuery
}

#Aplica valores unicos
function EnforceUniqueValues($ListName,$FieldName){
    write-host 'Aplicando valores unicos al campo' $FieldName 'en la lista' $ListName -ForegroundColor Yellow
    $Field = Get-PnPField -List $ListName -Identity $FieldName
    $Field.EnforceUniqueValues = $True
    $Field.Update()
    Invoke-PnPQuery
}

#Aplica plantilla
Invoke-PnPSiteTemplate -Path .\BovedaAdminDoc.xml

DeleteCustomRole -ListName "Boveda"
DeleteCustomRole -ListName "ContadorConsecutivos"
DeleteCustomRole -ListName "ControlEliminacionDocumentos"
DeleteCustomRole -ListName "HistorialSolicitudes"
DeleteCustomRole -ListName "Solicitudes"
DeleteCustomRole -ListName "TiposDocumentoSolicitudes"

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


#Agrega solucion al sitio Boveda
Write-Host 'Agregando solución a catálogo...' -ForegroundColor Yellow
Add-PnPApp -Path ./solution/soriana-admindocs-boveda.sppkg -Scope Site -Publish

#Se instala app
Write-Host 'Instalando solución...' -ForegroundColor Yellow
Install-PnPApp -Identity $IdApp -Scope Site

#Inicia espera 60seg
Start-Sleep -s 60

#Agrega webpart a paginas
Write-Host 'Instalando webparts...' -ForegroundColor Yellow
Add-PnPPageWebPart -Page "SolicitudBoveda" -Component "SolicitudBovedaDigital"
Add-PnPPageWebPart -Page "DashboardSolicitudes" -Component "DashboardSolicitudes"

#Cambia layout de las paginas
Write-Host 'Configurando paginas...' -ForegroundColor Yellow
Set-PnPPage -Identity "SolicitudBoveda" -LayoutType "SingleWebPartAppPage"
Set-PnPPage -Identity "DashboardSolicitudes" -LayoutType "SingleWebPartAppPage"

Write-Host '¡Instalación finalizada!' -ForegroundColor Green