# Penrose tenant variant — uses interactive (modern) auth, targets penrosetechnologies tenant.

Import-Module PnP.PowerShell -RequiredVersion 2.12.0

$SiteURL = "https://penrosetechnologies.sharepoint.com/sites/DatosMaestrosAdminDoc"

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

Invoke-PnPSiteTemplate -Path .\DatosMaestrosAdminDoc.xml

AddIndex -ListName "Asuetos" -FieldName "Title"
AddIndex -ListName "Asuetos" -FieldName "Fecha"
AddIndex -ListName "GerentesSucursales" -FieldName "Sucursal"
AddIndex -ListName "GerentesSucursales" -FieldName "Usuario"

EnforceUniqueValues -ListName "Asuetos" -FieldName "Title"
EnforceUniqueValues -ListName "Asuetos" -FieldName "Fecha"
EnforceUniqueValues -ListName "GerentesSucursales" -FieldName "Sucursal"
EnforceUniqueValues -ListName "GerentesSucursales" -FieldName "Usuario"

Write-Host 'Instalacion finalizada!' -ForegroundColor Green
