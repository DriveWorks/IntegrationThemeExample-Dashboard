// Update these values to match those of your Server URL, DriveWorks Group Alias (optional: Credentials)
// and Licensing Data URL

// You can also enter any known IP addresses to:
// - Skip the IP lookup for these addresses
// - Override the country information displayed
//      - Example: you could mark your internal IP as "Internal"/"INT", to distinguish internal traffic.

const config = {
    serverUrl: "",
    groupAlias: "",
    credentials: {
        username: "",
        password: "",
    },
    licenseDataUrl: "", // Example: http://YOUR-LICENCE-SERVER:27080 - See https://docs.driveworkspro.com/topic/LicenseManagerDriveWorksLive#driveworks-live-licensing-api
    driveWorksMajorVersion: 20, // Major version of DriveWorks to display data from (multiple may be available)
    statusRefreshInterval: 120, // seconds
    infoRefreshInterval: 10, // seconds
    sessionRefreshInterval: 10, // seconds
    apiRefreshInterval: 30, // seconds
    dateLocale: "en-US", // ISO 639-1 standard language code (e.g. en-US)
    defaultTheme: "light", // light/dark
    ipAddressLookup: false, // Enable reverse lookup for session IP country of origin
    knownAddresses: [ // List of known IP addresses, to override IP address lookup e.g. Main Office IP Address = "HQ"
        // [
        //     "123.123.123.123",
        //     {
        //         "country": "Location Name", // Written name for the location e.g. "United States", "United Kingdom"
        //         "countryCode": "CO", // The short-code for the location e.g. "US", "GB" (ISO 3166-1 alpha-2)
        //     }
        // ],
    ],
};
