#Url del sitio destino
$SiteURL = "https://soriana0.sharepoint.com/sites/DatosMaestrosAdminDoc"

#Correo del usuario instalador para eliminar permiso por defecto que asigna el proceso
$AdminEmail = "t_victorcr@soriana.com"

#Permiso que se asigna por defecto al usuario instalador que se eliminará
$RoleToRemove = "Control total"

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
Invoke-PnPSiteTemplate -Path .\DatosMaestrosAdminDoc.xml

AddIndex -ListName "Asuetos" -FieldName "Title"
AddIndex -ListName "Asuetos" -FieldName "Fecha"
AddIndex -ListName "GerentesSucursales" -FieldName "Sucursal"
AddIndex -ListName "GerentesSucursales" -FieldName "Usuario"

EnforceUniqueValues -ListName "Asuetos" -FieldName "Title"
EnforceUniqueValues -ListName "Asuetos" -FieldName "Fecha"
EnforceUniqueValues -ListName "GerentesSucursales" -FieldName "Sucursal"
EnforceUniqueValues -ListName "GerentesSucursales" -FieldName "Usuario"

Write-Host '¡Instalación finalizada!' -ForegroundColor Green