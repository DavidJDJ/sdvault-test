$url = "https://inavant.sharepoint.com/sites/BovedaAdminDoc"

Connect-PnPOnline -Url $url -Credentials (Get-Credential)

Get-PnPSiteTemplate -Out BovedaAdminDoc.xml -Configuration .\BovedaAdminDoc_Configuration.json