$url = "https://soriana0.sharepoint.com/sites/DatosMaestrosAdminDoc"

Connect-PnPOnline -Url $url -Credentials (Get-Credential)

Get-PnPSiteTemplate -Out DatosMaestrosAdminDoc.xml -Configuration .\DatosMaestrosAdminDoc_Configuration.json