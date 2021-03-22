// Run on load
(async function() {

    getStatus();

})();

// Get current status
async function getStatus() {

    try {

        const response = await fetch(config.licenseDataUrl + "/status");
        const data = await response.json();

        renderStatus(data);

        // Refresh on interval
        setTimeout(getStatus, config.statusRefreshInterval * 1000);

    } catch (error){
        console.log(error);
    }

}

// Display status
const versionNumber = document.getElementById("version-number");
const sourceUrl = document.getElementById("source-url");

function renderStatus(data){

    // Show clean source URL
    let source = config.licenseDataUrl.replace(/^(https?:|)\/\//, "");
    source = source.substring(0, source.indexOf(":"));
    sourceUrl.innerHTML = source;

    // Version number
    const majorVersion = data.version.major;
    const minorVersion = data.version.minor;
    versionNumber.innerHTML = `${majorVersion}.${minorVersion}`;

}
