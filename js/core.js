/**
 * Theme Switching
 */

// By config (default)
const defaultTheme = config.defaultTheme;
if (defaultTheme){
    document.body.classList.add(`theme-${defaultTheme}`);
}

// By url query
const urlQuery = new URLSearchParams(window.location.search);
const queryTheme = urlQuery.get("theme");
if (queryTheme){

    // Remove any previously set theme classes
    document.body.classList.forEach(className => {
        if (className.startsWith("theme-")) {
            document.body.classList.remove(className);
        }
    });

    // Add specified theme class
    document.body.classList.add(`theme-${queryTheme}`);

}

/**
 * Extract configured DriveWorks version data from set
 */
function getDriveWorksVersionIndex(data){
    return (data.driveWorksMajorVersion || data.majorVersion) === config.driveWorksMajorVersion;
}

/**
 * Basic browser detection
 */
const currentBrowser = (function (agent) {
    switch (true) {
        case agent.indexOf("edge") > -1:
            return "edge";
        case agent.indexOf("edg") > -1:
            return "edge-chromium";
        case agent.indexOf("opr") > -1 && !!window.opr:
            return "opera";
        case agent.indexOf("chrome") > -1 && !!window.chrome:
            return "chrome";
        case agent.indexOf("firefox") > -1:
            return "firefox";
        case agent.indexOf("safari") > -1:
            return "safari";
        default: return "other";
    }
})(window.navigator.userAgent.toLowerCase());

// Add current browser as class to body
document.body.classList.add(`browser-${currentBrowser}`);
