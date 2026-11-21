(() => {
    let user;

    try {
        user = JSON.parse(sessionStorage.getItem("carepoint.session") || "null");
    } catch {
        user = null;
    }

    if (!user?.email) {
        location.replace("index.html");
        return;
    }

    const $ = selector => document.querySelector(selector);
    const email = user.email.trim().toLowerCase();
    const storageKey = `carepoint.dashboard.${encodeURIComponent(email)}`;
    const userName = user.name || email.split("@")[0];

    let data = { patients: [], appointments: [] };

    try {
        data = JSON.parse(localStorage.getItem(storageKey)) || data;
    } catch {}

    data.patients = Array.isArray(data.patients) ? data.patients : [];
    data.appointments = Array.isArray(data.appointments) ? data.appointments : [];

    const { patients, appointments } = data;
    const initials = name => String(name || "").trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase();

    const count = status => appointments.filter(item => (item.status || "").toLowerCase() === status).length;
    const followUps = patients.filter(p => ["follow-up", "in progress"].includes((p.status || "").toLowerCase())).length;

    $("#user-name").textContent = userName;
    $("#user-initials").textContent = initials(userName);
    $("#nav-patient-count").textContent = patients.length.toLocaleString();

    $("#patient-total").textContent = patients.length.toLocaleString();
    $("#appointment-total").textContent = appointments.length.toLocaleString();
    $("#completed-total").textContent = count("completed").toLocaleString();
    $("#followup-total").textContent = followUps.toLocaleString();

    // Appointment status chart
    const statuses = { Confirmed: 0, Waiting: 0, Completed: 0, Cancelled: 0 };

    appointments.forEach(item => {
        let status = (item.status || "Confirmed").toLowerCase();

        if (status === "upcoming") status = "confirmed";
        if (["arrived", "in room", "in progress"].includes(status)) status = "waiting";

        status = status.charAt(0).toUpperCase() + status.slice(1);

        if (status in statuses) statuses[status]++;
    });

    const largest = Math.max(1, ...Object.values(statuses));

    Object.entries(statuses).forEach(([label, value]) => {
        const row = document.createElement("div");
        row.className = "chart-row";

        const name = document.createElement("span");
        name.textContent = label;

        const track = document.createElement("div");
        track.className = "chart-track";

        const bar = document.createElement("div");
        bar.className = `chart-bar ${label.toLowerCase()}`;
        bar.style.width = `${value / largest * 100}%`;

        const number = document.createElement("span");
        number.className = "chart-value";
        number.textContent = value;

        track.append(bar);
        row.append(name, track, number);
        $("#status-chart").append(row);
    });

    // Display patients
    function showPatients(list) {
        const table = $("#patient-report-list");
        table.replaceChildren();

        list.slice(0, 6).forEach(patient => {
            const row = document.createElement("tr");
            const person = document.createElement("div");
            const avatar = document.createElement("span");
            const name = document.createElement("strong");
            const status = patient.status || "Active";
            const lowerStatus = status.toLowerCase();

            person.className = "report-person";
            avatar.className = "patient-initials";
            avatar.textContent = initials(patient.name);
            name.textContent = patient.name || "Unknown";

            person.append(avatar, name);

            const patientCell = document.createElement("td");
            patientCell.append(person);

            const visitCell = document.createElement("td");
            visitCell.textContent = patient.lastVisit || "—";

            const statusCell = document.createElement("td");
            const badge = document.createElement("span");

            badge.className = `report-status ${["follow-up", "in progress"].includes(lowerStatus) ? "follow-up" : lowerStatus === "active" ? "" : "other"}`;
            badge.textContent = status;

            statusCell.append(badge);
            row.append(patientCell, visitCell, statusCell);
            table.append(row);
        });

        $("#empty-report").hidden = list.length > 0;
    }

    showPatients(patients);

    // Search patients
    $("#report-search").addEventListener("input", event => {
        const query = event.target.value.trim().toLowerCase();

        showPatients(patients.filter(p =>
            `${p.name || ""} ${p.id || ""} ${p.status || ""}`.toLowerCase().includes(query)
        ));
    });

    // Export CSV report
    function exportReport() {
        const rows = [
            ["Clinic Report", "Value"],
            ["Total Patients", patients.length],
            ["Appointments", appointments.length],
            ["Completed Visits", count("completed")],
            ["Follow-ups", followUps],
            [],
            ["Patient", "Patient ID", "Last Visit", "Status"],
            ...patients.map(p => [p.name, p.id, p.lastVisit, p.status])
        ];

        const csv = rows.map(row =>
            row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")
        ).join("\n");

        const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
        const link = document.createElement("a");

        link.href = url;
        link.download = "carepoint-report.csv";
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
        $("#page-message").textContent = "Your report was exported as a CSV file.";
    }

    $("#export-report").addEventListener("click", exportReport);

})();
