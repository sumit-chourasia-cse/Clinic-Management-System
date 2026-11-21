
// Check if a user is logged in
let user = JSON.parse(sessionStorage.getItem("carepoint.session"));

if (!user) {
    window.location.href = "index.html";
} else {

    // Show the user's name
    document.getElementById("user-name").textContent = user.name;

    // Show initials
    let name = user.name.split(" ");
    let initials = name[0][0];

    if (name.length > 1) {
        initials += name[1][0];
    }

    document.getElementById("user-initials").textContent = initials;

    // Get the patient's data
    let email = user.email.toLowerCase();
    let storageKey = "carepoint.dashboard." + encodeURIComponent(email);

    let savedData = localStorage.getItem(storageKey);
    let clinicData;

    if (savedData) {
        clinicData = JSON.parse(savedData);
    } else {
        // Sample patients
        clinicData = {
            patients: [
                { name: "James Davis", gender: "Male", age: "34 years", id: "CP-1024", email: "j.davis@email.com", lastVisit: "Nov 10, 2026", status: "Active" },
                { name: "Emma Wilson", gender: "Female", age: "28 years", id: "CP-1023", email: "e.wilson@email.com", lastVisit: "Nov 10, 2026", status: "Follow-up" },
                { name: "Michael Reed", gender: "Male", age: "52 years", id: "CP-1022", email: "m.reed@email.com", lastVisit: "Nov 09, 2026", status: "Active" },
                { name: "Sophia Patel", gender: "Female", age: "41 years", id: "CP-1021", email: "s.patel@email.com", lastVisit: "Nov 09, 2026", status: "Follow-up" }
            ]
        };
    }

    // Display patients
    function showPatients(patientArray) {

        let list = document.getElementById("patient-list");
        list.innerHTML = "";

        // Update patient count
        document.getElementById("nav-patient-count").textContent =
            clinicData.patients.length;

        for (let i = 0; i < patientArray.length; i++) {

            let patient = patientArray[i];

            let row = document.createElement("tr");

            let initials = patient.name.split(" ")[0][0];

            if (patient.name.split(" ").length > 1) {
                initials += patient.name.split(" ")[1][0];
            }

            let nameCell = document.createElement("td");
            let patientBox = document.createElement("div");
            let initialBox = document.createElement("span");
            let details = document.createElement("div");
            let patientName = document.createElement("strong");
            let patientAge = document.createElement("span");

            patientBox.className = "patient-cell";
            initialBox.className = "patient-initials";
            details.className = "patient-details";

            initialBox.textContent = initials;
            patientName.textContent = patient.name;
            patientAge.textContent = patient.gender + " · " + patient.age;

            details.append(patientName, patientAge);
            patientBox.append(initialBox, details);
            nameCell.append(patientBox);

            let idCell = document.createElement("td");
            idCell.textContent = patient.id;

            let emailCell = document.createElement("td");
            emailCell.textContent = patient.email;

            let visitCell = document.createElement("td");
            visitCell.textContent = patient.lastVisit;

            let statusCell = document.createElement("td");
            let status = document.createElement("span");

            if (patient.status === "Active") {
                status.className = "status status-active";
            } else {
                status.className = "status status-follow-up";
            }

            status.textContent = patient.status;
            statusCell.append(status);

            let actionCell = document.createElement("td");
            let viewButton = document.createElement("button");

            viewButton.className = "view-button";
            viewButton.textContent = "View";
            viewButton.type = "button";

            viewButton.addEventListener("click", function() {
                document.getElementById("page-message").textContent =
                    patient.name + " | " + patient.id + " | " + patient.email;
            });

            actionCell.append(viewButton);

            row.append(nameCell, idCell, emailCell, visitCell, statusCell, actionCell);

            list.append(row);
        }

        // Show message if no patients are found
        document.getElementById("empty-message").hidden =
            patientArray.length > 0;
    }

    // Save patient data
    function savePatients() {
        localStorage.setItem(storageKey, JSON.stringify(clinicData));
    }

    // Search and filter patients
    function filterPatients() {

        let searchText = document.getElementById("patient-search").value.toLowerCase();
        let selectedStatus = document.getElementById("status-filter").value;

        let matchingPatients = [];

        for (let i = 0; i < clinicData.patients.length; i++) {

            let patient = clinicData.patients[i];

            let patientInfo = (
                patient.name + patient.id + patient.email
            ).toLowerCase();

            let matchesSearch = patientInfo.includes(searchText);

            let matchesStatus =
                selectedStatus === "all" ||
                patient.status.toLowerCase() === selectedStatus;

            if (matchesSearch && matchesStatus) {
                matchingPatients.push(patient);
            }
        }

        showPatients(matchingPatients);
    }

    // Search box
    document.getElementById("patient-search").addEventListener("input", filterPatients);

    // Status filter
    document.getElementById("status-filter").addEventListener("change", filterPatients);

    // Global search
    document.getElementById("global-search").addEventListener("input", function() {
        document.getElementById("patient-search").value = this.value;
        filterPatients();
    });

    // Add a new patient
    document.getElementById("add-patient").addEventListener("click", function() {

        let patientName = prompt("Enter patient name:");

        if (!patientName || patientName.trim() === "") {
            return;
        }

        let patientEmail = prompt("Enter patient email:");

        if (!patientEmail || patientEmail.trim() === "") {
            patientEmail = "Not provided";
        }

        let patientNumber = Date.now().toString().slice(-4);

        let newPatient = {
            name: patientName.trim(),
            gender: "Not specified",
            age: "New patient",
            id: "CP-" + patientNumber,
            email: patientEmail.trim(),
            lastVisit: "No visits yet",
            status: "Active"
        };

        clinicData.patients.push(newPatient);

        savePatients();
        filterPatients();

        document.getElementById("page-message").textContent =
            "Patient added successfully.";
    });

    // Display patients when page opens
    showPatients(clinicData.patients);
}
