const dataCard = document.getElementById("data-card");
const sessionsCard = document.getElementById("sessions-card");
const sessionsTable = document.getElementById("sessions-table");
const sessionsEmpty = document.getElementById("sessions-empty");

const knownAddresses = new Map(config.knownAddresses);
let storedData = [];
let serverTimeOffset;

// Run on document ready
(async function () {

    sizeSessionsCard();

    serverTimeOffset = await calculateServerTimeOffset();
    getSessions();

})();

// On page load
window.onload = function () {
    sizeSessionsCard()
};

// On resize
window.addEventListener("resize", function () {
    sizeSessionsCard();
});

// Calculate sessions table card max-height
async function sizeSessionsCard() {

    // Remove an height affecting calculation
    sessionsCard.style.maxHeight = "0";

    // Set max-height to height of data card
    const dataHeight = dataCard.offsetHeight;
    sessionsCard.style.maxHeight = `${Math.floor(dataHeight - 1)}px`;

}

// Get session data
async function getSessions() {

    try {

        // Get data
        const response = await fetch(config.licenseDataUrl + "/sessions");
        const data = await response.json();

        // Extract data for specified version
        const index = data.findIndex(getDriveWorksVersionIndex);
        const sessions = data[index].sessions;
        if (sessions.length) {

            // Sort by desc date order (newest first)
            let sortedSessions = JSON.parse(JSON.stringify(sessions));
            sortedSessions = sortedSessions.sort((a, b) => new Date(b.sessionStarted) - new Date(a.sessionStarted));

            // Update session table (if: empty (page load) OR open + data has changed)
            if (storedData.length === 0 || JSON.stringify(data) !== JSON.stringify(storedData)) {
                getSessionLocations(sortedSessions);
            }

            // Store data for later comparison
            storedData = data;

            // Update session durations
            calculateSessionLengths(sortedSessions);

        } else {
            // Show empty state (if previously hidden)
            sessionsTable.classList.add("is-hidden");
            sessionsEmpty.classList.remove("is-hidden");
        }

    } catch (error) {
        console.log(error);
    }

    // Refresh on interval
    setTimeout(getSessions, config.sessionRefreshInterval * 1000);

}

// Get locations from session IP
async function getSessionLocations(sessions) {

    // Extract IP addresses from hostname. Lookup if not in known addresses (new IP)
    const newIpAddresses = [];
    for (const [index, session] of sessions.entries()) {

        const ip = extractIpAddress(session.hostName);
        sessions[index].ipAddress = ip;

        // If an IP address is found in the hostname, and has not been previously mapped, store for lookup
        if (ip && !knownAddresses.has(ip) && newIpAddresses.indexOf(ip) === -1) {
            newIpAddresses.push(ip);
        }

    }

    // Lookup geolocation of new, unknown IP addresses
    // Source: GeoJS (https://www.geojs.io/)
    // MIT License: https://github.com/jloh/geojs/blob/master/LICENCE (subject to change by external parties)
    if (config.ipAddressLookup && newIpAddresses.length) {

        try {

            const response = await fetch(`https://get.geojs.io/v1/ip/country.json?ip=${newIpAddresses.join()}`);
            if (response.ok) {
                const locations = await response.json();

                // For each new address, check a location is returned (by index)
                for (const ipAddress of newIpAddresses) {
                    const addressIndex = locations.map((location) => { return location.ip; }).indexOf(ipAddress);
                    if (addressIndex > -1) {

                        // Extract geolocation information required, with clear key names
                        const location = locations[addressIndex];
                        if (location.name && location.country) {
                            const countryDetails = {
                                "country": location.name,
                                "countryCode": location.country,
                            };

                            knownAddresses.set(ipAddress, countryDetails);
                        }
                    }
                }

            }

        } catch (error) {
            console.log(error);
        }
    }

    renderSessions(sessions);

}

// Render sessions to table
function renderSessions(sessions) {

    // Show table
    sessionsEmpty.classList.add("is-hidden");
    sessionsTable.classList.remove("is-hidden");

    // Generate session details
    let sessionsMarkup = "";
    for (let i = 0; i < sessions.length; i++) {

        // Calculate start date
        const options = {
            dateStyle: "short",
            timeStyle: "short",
        };
        const sessionStarted = new Date(sessions[i].sessionStarted);
        const sessionStartedDate = sessionStarted.toLocaleString(config.dateLocale, options);

        // Get location
        const sessionAddress = knownAddresses.get(sessions[i].ipAddress);
        const countryName = sessionAddress && sessionAddress.country ? sessionAddress.country : "No location available.";
        const countryCode = sessionAddress && sessionAddress.countryCode ? sessionAddress.countryCode : "---";

        // Create markup
        sessionsMarkup += `
            <tr>
                <td class="session-server">${sessions[i].serverName.toLowerCase()}</td>
                <td class="session-country" title="${countryName}">${countryCode}</td>
                <td class="session-hostname" title="${sessions[i].hostName}"><span>${sessions[i].hostName.split(":")[0]}</span></td>
                <td class="session-started">${sessionStartedDate} <span class="time-difference">(${timeDifference(sessionStarted)})<span></td>
                <td class="session-browser" title="${sessions[i].userAgent}">${sessions[i].browser.split(".")[0]}</td>
            </tr>
        `;

    }

    // Display Data
    document.querySelector("#sessions-table tbody").innerHTML = sessionsMarkup;

}

// Calculate the difference between two dates (in a human readable format)
function timeDifference(previousDate) {

    const elapsedTime = (new Date() - previousDate) + serverTimeOffset;
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;

    if (elapsedTime < msPerMinute) {
        const seconds = Math.round(elapsedTime / 1000);
        const suffix = seconds > 1 ? "secs" : "sec";
        return `${seconds} ${suffix} ago`;
    }

    else if (elapsedTime < msPerHour) {
        const minutes = Math.round(elapsedTime / msPerMinute);
        const suffix = minutes > 1 ? "mins" : "min";
        return `${minutes} ${suffix} ago`;
    }

    const hours = Math.round(elapsedTime / msPerHour);
    const suffix = hours > 1 ? "hrs" : "hr";
    return `${hours} ${suffix} ago`;

}

// Calculate newest/oldest session
function calculateSessionLengths(sessions) {

    // Newest session
    const newestSession = new Date(sessions[0].sessionStarted);
    document.getElementById("newest-session").innerHTML = timeDifference(newestSession);

    // Oldest session
    const oldestSession = new Date(sessions[sessions.length - 1].sessionStarted);
    document.getElementById("oldest-session").innerHTML = timeDifference(oldestSession);

}

// Extract IP Address from string
function extractIpAddress(host) {
    const format = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    const check = host.match(format);
    if (check) {
        return check[0];
    }
}

// Calculate offset between server's reported time and local device time
async function calculateServerTimeOffset() {

    try {

        const response = await fetch(config.licenseDataUrl);
        if (response.ok) {

            // Extract server time from the end of the license version string
            const data = await response.text();
            const serverTime = data.slice(-28);

            // Return the difference between server and current time
            return new Date(serverTime) - new Date();
        }

    } catch (error) {
        console.log(error);
        return 0;
    }

}
