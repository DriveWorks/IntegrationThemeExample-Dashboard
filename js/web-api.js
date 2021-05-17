const SERVER_URL = config.serverUrl;
const GROUP_ALIAS = config.groupAlias;
const CREDENTIALS = config.credentials;

const DOCUMENTS_TOTAL_SESSION_KEY = "documentsTotal";
const DOCUMENTS_QUEUED_SESSION_KEY = "documentsQueued";

// Render on load
let DW_CLIENT;
function dwClientLoaded() {
    try {
        DW_CLIENT = new window.DriveWorksLiveClient(SERVER_URL);
    } catch (error) {
        handleUnauthorizedUser("Cannot access client.");
    }

    clientFunctions();
}

// Render on load
async function clientFunctions() {
    if (!SERVER_URL || !GROUP_ALIAS) {
        return;
    }

    try {
        // Login to Group
        await DW_CLIENT.loginGroup(GROUP_ALIAS, CREDENTIALS);

        // Get data from API
        getApiData();
    } catch (error) {
        console.log(error);
    }
}

// Get data
async function getApiData() {
    try {
        // Get Project and Specification data from API
        await Promise.all([
            getProjects(),
            getSpecifications(),
            getSpecificationsQueued()
        ]);

        // Refresh data on interval
        setTimeout(getApiData, config.apiRefreshInterval * 1000);
    } catch (error) {
        console.log(error);
    }
}

// Get project data
async function getProjects() {
    const total = document.getElementById("projects-total");

    try {
        const projects = await DW_CLIENT.getProjects(GROUP_ALIAS);
        total.innerHTML = projects.length;
    } catch (error) {
        console.log(error);
    }
}

// Get specification data
async function getSpecifications() {
    const total = document.getElementById("specifications-total");

    try {
        const specifications = await DW_CLIENT.getAllSpecifications(GROUP_ALIAS);
        total.innerHTML = specifications.length;
        getDocuments(specifications);
    } catch (error) {
        console.log(error);
    }
}

async function getSpecificationsQueued() {
    const output = document.getElementById("specifications-queued");

    // Display total queued (if previously retrieved and saved)
    const storedSpecificationsQueued = sessionStorage.getItem("specificationsQueued");
    if (storedSpecificationsQueued) {
        output.innerHTML = `In Queue: ${storedSpecificationsQueued}`;
    }

    try {
        // Get queued specifications (in "Automatic" state)
        const queuedSpecifications = await DW_CLIENT.getAllSpecifications(GROUP_ALIAS, "$filter=StateType eq 'Automatic'");
        output.innerHTML = `In Queue: ${queuedSpecifications.length}`;

        // Store queued Specifications count for instant display on subsequent loads
        sessionStorage.setItem("specificationsQueued", queuedSpecifications.length);
    } catch (error) {
        console.log(error);
    }
}

// Get documents data
const totalOutput = document.getElementById("documents-total");
const queueOutput = document.getElementById("documents-queued");
let documentsTotal, storedDocumentTotal;
let queuedTotal, storedQueuedTotal;

// Get documents data
async function getDocuments(specifications) {
    const documentRequests = [];
    storedDocumentTotal = sessionStorage.getItem(DOCUMENTS_TOTAL_SESSION_KEY);
    storedQueuedTotal = sessionStorage.getItem(DOCUMENTS_QUEUED_SESSION_KEY);
    documentsTotal = 0;
    queuedTotal = 0;

    // Show stored totals (if previously saved)
    if (storedDocumentTotal) {
        totalOutput.innerHTML = storedDocumentTotal;
    }
    if (storedQueuedTotal) {
        queueOutput.innerHTML = `In Queue: ${storedQueuedTotal}`;
    }

    // Generate requests for document total of each spec (and accumulate)
    for (const specification of specifications) {
        documentRequests.push(getDocumentsFromSpecification(specification.id));
    }

    // Process specifications
    try {

        // Request all specification document totals
        await Promise.all(documentRequests);

        // Output final totals
        totalOutput.innerHTML = documentsTotal;
        queueOutput.innerHTML = `In Queue: ${queuedTotal}`;

        // Store totals in session
        sessionStorage.setItem(DOCUMENTS_TOTAL_SESSION_KEY, documentsTotal);
        sessionStorage.setItem(DOCUMENTS_QUEUED_SESSION_KEY, queuedTotal);
    } catch (error) {
        console.log(error);
    }
}

// Get documents data
async function getDocumentsFromSpecification(specification) {

    // Get document data
    const documents = await DW_CLIENT.getSpecificationDocuments(GROUP_ALIAS, specification);

    // Increment total
    documentsTotal += documents.length;

    // Check for generating files
    for (let i = 0; i < documents.length; i++) {
        if (documents[i].fileExists === false) {
            queuedTotal++;
        }
    }

    // Increase visual output (count up, if no current total shown)
    if (!storedDocumentTotal) {
        totalOutput.innerHTML = documentsTotal;
    }
    if (!storedQueuedTotal) {
        queueOutput.innerHTML = `In Queue: ${queuedTotal}`;
    }
}
