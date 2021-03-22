// Run on load
(async function() {

    getInfo();

})();

async function getInfo() {

    const info = await fetch(config.licenseDataUrl + "/info");
    const data = await info.json();
    renderInfo(data);

    // Refresh
    setTimeout(getInfo, config.infoRefreshInterval * 1000);

}

function renderInfo(data) {

    // Parse Response
    const index = data.findIndex(getDriveWorksVersionIndex);

    const maxConcurrentUsers = data[index].maxConcurrentUsers;
    const activeSessions = data[index].activeSessionsCount;
    const onDemandCap = data[index].onDemandCap;
    const peakSessions = data[index].sessionsPeak;

    // Calculate total users
    let totalUsers = 0;
    let totalDisplay = 0;

    if (maxConcurrentUsers !== 0) {
        totalUsers = maxConcurrentUsers + onDemandCap;
    }

    if (totalUsers === 0) {
        totalUsers = 1;
    } else {
        totalDisplay = totalUsers;
    }

    // Calculate centralised users
    let centralizedDisplay = activeSessions;
    if (activeSessions >= maxConcurrentUsers) {
        centralizedDisplay = maxConcurrentUsers;
    }

    // OnDemand sessions
    let onDemandDisplay = 0;
    if (activeSessions >= maxConcurrentUsers) {
        onDemandDisplay = activeSessions - maxConcurrentUsers;
    }

    // Calculate percentages
    centralizedPercentage = centralizedDisplay === 0 ? 0 : Math.round((centralizedDisplay / maxConcurrentUsers) * 100);
    onDemandPercentage = onDemandDisplay === 0 ? 0 : Math.round((onDemandDisplay / onDemandCap) * 100);
    activePercentage = activeSessions === 0 ? 0 : Math.round((activeSessions / totalDisplay) * 100);
    peakPercentage = peakSessions === 0 ? 0 : Math.round((peakSessions / totalDisplay) * 100);

    // Create charts
    drawDonutChart("centralized-sessions-chart", centralizedDisplay, centralizedPercentage, maxConcurrentUsers);
    drawDonutChart("ondemand-sessions-chart", onDemandDisplay, onDemandPercentage, onDemandCap);
    drawDonutChart("active-sessions-chart", activeSessions, activePercentage, totalDisplay, peakPercentage);

    // Render info
    document.getElementById("total-users-limit").innerHTML = maxConcurrentUsers;
    document.getElementById("ondemand-sessions-limit").innerHTML = onDemandCap;
    document.getElementById("total-sessions-limit").innerHTML = totalDisplay;
    document.getElementById("peak-sessions-total").innerHTML = peakSessions;

}

// Create Donut Charts
function drawDonutChart(el, value, percentage, total, peak) {

    // Options
    const donutWidth = 2.5;

    // Ensure minumum percentage is 1 (to show something on the chart)
    if (value > 0 && percentage === 0){
        percentage++;
    }

    // Set status
    let status = "ok";
    if (percentage >= 75){
        status = "warning";
    }

    // Draw chart
    document.getElementById(el).innerHTML = `
		<svg viewBox="0 0 20 20" style="overflow: visible;">
			<circle class="ring" r="10" cx="10" cy="10" />
			${peak ? `<circle class="peak" r="5" cx="10" cy="10" stroke-width="10" stroke-dasharray="${(peak * 31.42) / 100} 31.42" transform="rotate(-90) translate(-20)" />` : ""}
			<circle class="progress status-${status}" r="5" cx="10" cy="10" stroke-width="10" stroke-dasharray="${(percentage * 31.42) / 100} 31.42" transform="rotate(-90) translate(-20)" />
			<circle class="center" r="${10 - donutWidth}" cx="10" cy="10" />
		</svg>
		<div class="chart-value" title="${percentage}%">
			<div>
				${value}
				<div class="total">/ ${total}</div>
			</div>
		</div>
	`;

}
