# Integration Theme Example - Dashboard
### Release: 19.2
#### Minimum DriveWorks Version: 18.0

An example web dashboard combining data sources from the DriveWorks Integration Theme Web API & Live License Server endpoints.

Please note: DriveWorks are not accepting pull requests for this example.  
Join our [online community](https://my.driveworks.co.uk) for discussion, resources and to suggest other examples.

### Overview
- Dynamically injects the DriveWorks Live Client library script using the configured server url (see config.js).
    - Provides an example of loading from a static URL, if preferred.
- Connects to the DriveWorks Live Integration Theme API.
- Parses data from a supplied DriveWorks Licensing Server endpoint.

- **License Session Data**
    - Centralized, OnDemand and Total Entitlement
    - Current Connections
    - Current Usage
    - Peak Usage

- **Group Data**
    - Projects
    - Specifications (Generated and Queued)
    - Documents (Generated and Queued)

- **Live Sessions**
    - Server Name
    - Country of Origin [optional]
    - Unique Address
    - Session Length
    - Browser

### To use:
1. Clone this repository, or download as a .zip

2. Enter your Integration Theme details into `config.js`
    * `serverUrl` - The URL that hosts your Integration Theme, including any ports.
    * `groupAlias` - The public alias created for the Group containing the data to render - as configured in DriveWorksConfigUser.xml.
        * This connection is used to access API data, such as Project/Specification/Document counts.
        * See [Integration Theme Settings](https://docs.driveworkspro.com/Topic/IntegrationThemeSettings) for additional guidance.
    * `credentials` - [optional] The username and password of the Group user to login.
        * For publicly hosted content, it is advised that default credentials are instead stored within the XML config file (DriveWorksConfigUser.xml).
        * See [Integration Theme Connection Settings](https://docs.driveworkspro.com/Topic/IntegrationThemeSettings#Connection-Settings) for additional guidance.
        * Credentials could also be collected via a login form on-demand. See the related [Simple Login Example](https://github.com/DriveWorks/IntegrationThemeExample-SimpleLogin) for additional guidance.
    * `licenseDataUrl` - Address and port of a valid DriveWorks Live Floating License Server, from which to access usage data.
        * Example: http://YOUR-LICENCE-SERVER:27080
        * See [DriveWorks Live Licensing API Help](https://docs.driveworkspro.com/topic/LicenseManagerDriveWorksLive#driveworks-live-licensing-api) for additional guidance.
    * `driveWorksMajorVersion` - Major version of DriveWorks to display data from (multiple may be available) e.g. '18'

3. [optional] Configure additional settings
    * `statusRefreshInterval` - The interval (in seconds) to request status data (version major/minor)
    * `infoRefreshInterval` - The interval (in seconds) to request license info data (max sessions, on-demand cap, peak usage etc.)
    * `sessionRefreshInterval` - The interval (in seconds) to request live session data (server name, hostname/address, browser, start time etc.)
    * `apiRefreshInterval` - The interval (in seconds) to request DriveWorks Live API data (Projects/Specifications/Documents)
    * `dateLocale` - ISO 639-1 standard language code (e.g. en-US). Used to format dates displayed.
    * `defaultTheme` - (light/dark) Color theme for dashboard.
    * `ipAddressLookup` - (true/false) Map session user address to country of origin.
        * Uses [GeoJS](https://github.com/jloh/geojs) for user address lookup - please refer to it's [Third Party Licensing](https://github.com/jloh/geojs/blob/master/LICENCE)
    * `knownAddresses` - Provide a list of known addresses to skip address lookup and provide custom location identification.
        * Example: 1.1.1.1 - "HQ", "Main Office"
        * See commented format.

4. Host the example locally or on a remote server.
    * Ensure `<corsOrigins>` in DriveWorksConfigUser.xml permits request from this location.
    See [Integration Theme Settings](https://docs.driveworkspro.com/Topic/IntegrationThemeSettings) for additional guidance.

### Troubleshooting:

If encountering any issues, please check the browser's console for error messages (F12).  

If you are unable to use the dynamic library loading demonstrated in this example:
1. In `index.html`, uncomment "Option A" & replace "YOUR-DRIVEWORKS-LIVE-SERVER-URL.COM" with the URL of your own DriveWorks Live server that is serving `DriveWorksLiveIntegrationClient.min.js` - including any ports.
    * This should be the URL that hosts the Integration Theme, and serves it's landing page.
    * To check that this URL is correct, attempt to load DriveWorksLiveIntegrationClient.min.js in a browser. It should return a minified code library.
2. Remove the "Option B" `<script>` tag.

### Potential Issues:

* When serving this example for a domain different to your DriveWorks Live server, e.g. api.my-site.com from www.company.com, 'SameSite' cookie warnings may be thrown when the Client SDK attempts to store the current session id in a cookie.
    * This appears as "Error: 401 Unauthorized" in the browser console, even with the correct configuration set.
    * To resolve:
        * Ensure you are running DriveWorks 18.2 or above
        * Ensure HTTPS is enabled in DriveWorks Live's settings
        * Ensure a valid SSL certificate has been configured via DriveWorksConfigUser.xml.
        * Ensure if using an incognito/private window, third-party cookies are not blocked (see browser settings).
        * See [Integration Theme Settings](https://docs.driveworkspro.com/Topic/IntegrationThemeSettings) for additional guidance.

---

This source code has been made available to demonstrate how you can integrate with DriveWorks using the DriveWorks Live API.
This code is provided under the MIT license, for more details see LICENSE.md.

The example requires that you have the latest DriveWorks Live SDK installed, operational and remotely accessible.
