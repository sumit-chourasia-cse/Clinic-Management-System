
// Check login
let user = JSON.parse(sessionStorage.getItem("carepoint.session"));

if (!user) {
    window.location.href = "index.html";
} else {

    // User information
    document.getElementById("user-name").textContent = user.name;

    function getInitials(name) {
        let words = name.split(" ");
        let initials = words[0][0];

        if (words.length > 1) {
            initials += words[1][0];
        }

        return initials;
    }

    document.getElementById("user-initials").textContent =
        getInitials(user.name);

    // Load data
    let storageKey = "carepoint.dashboard." +
        encodeURIComponent(user.email.toLowerCase());

    let savedData = localStorage.getItem(storageKey);

    let clinicData = {
        patients: [],
        appointments: [],
        medicalRecords: []
    };

    if (savedData) {
        clinicData = JSON.parse(savedData);
    }

    if (!clinicData.patients) {
        clinicData.patients = [];
    }

    if (!clinicData.medicalRecords) {
        clinicData.medicalRecords = [];
    }

    document.getElementById("nav-patient-count").textContent =
        clinicData.patients.length;

    // Save data
    function saveData() {
        localStorage.setItem(storageKey, JSON.stringify(clinicData));
    }

    // Display records
    function displayRecords(records) {
        let list = document.getElementById("record-list");
        list.innerHTML = "";

        for (let i = 0; i < records.length; i++) {
            let record = records[i];
            let row = document.createElement("tr");

            let patient = document.createElement("td");
            patient.textContent = getInitials(record.patient) +
                " - " + record.patient;

            let type = document.createElement("td");
            type.textContent = record.type;

            let summary = document.createElement("td");
            summary.textContent = record.summary;

            let date = document.createElement("td");
            date.textContent = record.date;

            let doctor = document.createElement("td");
            doctor.textContent = record.doctor;

            row.append(patient, type, summary, date, doctor);
            list.append(row);
        }

        let emptyMessage = document.getElementById("empty-records");
        let recordsCard = document.getElementById("records-card");

        if (records.length > 0) {
            emptyMessage.hidden = true;
            recordsCard.className = "table-card records-card has-records";
        } else {
            emptyMessage.hidden = false;
            recordsCard.className = "table-card records-card";
        }
    }

    // Update numbers
    function updateSummary() {
        let records = clinicData.medicalRecords;
        let patients = [];

        for (let i = 0; i < records.length; i++) {
            let name = records[i].patient.toLowerCase();

            if (!patients.includes(name)) {
                patients.push(name);
            }
        }

        document.getElementById("record-count").textContent =
            records.length;

        document.getElementById("linked-patient-count").textContent =
            patients.length;
    }

    // Search records
    function searchRecords() {
        let search = document.getElementById("record-search").value.toLowerCase();
        let type = document.getElementById("record-type-filter").value;

        let results = [];

        for (let i = 0; i < clinicData.medicalRecords.length; i++) {
            let record = clinicData.medicalRecords[i];

            let info = (record.patient + record.type +
                record.summary + record.doctor).toLowerCase();

            if (info.includes(search) &&
                (type === "all" || record.type.toLowerCase() === type)) {
                results.push(record);
            }
        }

        displayRecords(results);
    }

    // Search events
    document.getElementById("record-search")
        .addEventListener("input", searchRecords);

    document.getElementById("record-type-filter")
        .addEventListener("change", searchRecords);

    document.getElementById("global-search")
        .addEventListener("input", function() {
            document.getElementById("record-search").value = this.value;
            searchRecords();
        });

    // Add record
    document.getElementById("add-record")
        .addEventListener("click", function() {

            let patient = prompt("Enter patient name:");
            if (!patient || patient.trim() === "") return;

            let type = prompt("Enter record type:");
            if (!type || type.trim() === "") return;

            let summary = prompt("Enter record summary:");
            if (!summary || summary.trim() === "") return;

            let doctor = prompt("Enter doctor's name:");

            let newRecord = {
                patient: patient.trim(),
                type: type.trim(),
                summary: summary.trim(),
                doctor: doctor || "Clinic Doctor",
                date: new Date().toLocaleDateString()
            };

            clinicData.medicalRecords.push(newRecord);

            saveData();
            updateSummary();
            searchRecords();

            document.getElementById("page-message").textContent =
                "Medical record added successfully.";
        });

    // Show records when page opens
    updateSummary();
    displayRecords(clinicData.medicalRecords);
}
