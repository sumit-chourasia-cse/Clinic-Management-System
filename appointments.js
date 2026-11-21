
// Check login
let user = JSON.parse(sessionStorage.getItem("carepoint.session"));

if (!user) {
    window.location.href = "index.html";
} else {

    // User information
    document.getElementById("user-name").textContent = user.name;

    let name = user.name.split(" ");
    let initials = name[0][0];

    if (name.length > 1) {
        initials += name[1][0];
    }

    document.getElementById("user-initials").textContent = initials;

    // Load appointment data
    let storageKey = "carepoint.dashboard." + encodeURIComponent(user.email.toLowerCase());
    let savedData = localStorage.getItem(storageKey);

    let clinicData;

    if (savedData) {
        clinicData = JSON.parse(savedData);
    } else {
        clinicData = {
            patients: [],
            appointments: [
                { patient: "James Davis", doctor: "Dr. Morgan", date: "Nov 10", time: "09:30 AM", type: "Consultation", status: "Completed" },
                { patient: "Emma Wilson", doctor: "Dr. Morgan", date: "Nov 10", time: "10:15 AM", type: "Follow-up", status: "Waiting" },
                { patient: "Oliver Brown", doctor: "Dr. Chen", date: "Nov 10", time: "11:00 AM", type: "Routine Checkup", status: "Confirmed" },
                { patient: "Ava Thompson", doctor: "Dr. Lee", date: "Nov 10", time: "11:45 AM", type: "Dental", status: "Confirmed" },
                { patient: "Sophia Patel", doctor: "Dr. Morgan", date: "Nov 10", time: "12:30 PM", type: "Consultation", status: "Cancelled" }
            ]
        };
    }

    if (!clinicData.patients) {
        clinicData.patients = [];
    }

    document.getElementById("nav-patient-count").textContent = clinicData.patients.length;


    // Display appointments
    function displayAppointments(appointments) {

        let list = document.getElementById("appointment-list");
        list.innerHTML = "";

        for (let i = 0; i < appointments.length; i++) {

            let appointment = appointments[i];
            let row = document.createElement("tr");

            let nameParts = appointment.patient.split(" ");
            let initials = nameParts[0][0];

            if (nameParts.length > 1) {
                initials += nameParts[1][0];
            }

            let patientCell = document.createElement("td");
            patientCell.innerHTML = "";

            let patientBox = document.createElement("div");
            patientBox.className = "appointment-patient";

            let initialBox = document.createElement("span");
            initialBox.className = "patient-initials";
            initialBox.textContent = initials;

            let patientName = document.createElement("strong");
            patientName.textContent = appointment.patient;

            patientBox.append(initialBox, patientName);
            patientCell.append(patientBox);

            let doctorCell = document.createElement("td");
            doctorCell.textContent = appointment.doctor;

            let dateCell = document.createElement("td");
            dateCell.textContent = appointment.date + " · " + appointment.time;

            let typeCell = document.createElement("td");
            typeCell.textContent = appointment.type;

            // Status
            let statusCell = document.createElement("td");
            let badge = document.createElement("span");

            badge.className = "status status-" + appointment.status.toLowerCase();
            badge.textContent = appointment.status;

            statusCell.append(badge);

            // Update status
            let updateCell = document.createElement("td");
            let select = document.createElement("select");

            select.className = "status-select";

            let statuses = ["Confirmed", "Waiting", "Completed", "Cancelled"];

            for (let j = 0; j < statuses.length; j++) {
                let option = document.createElement("option");
                option.value = statuses[j];
                option.textContent = statuses[j];
                select.append(option);
            }

            select.value = appointment.status;

            select.addEventListener("change", function() {
                appointment.status = select.value;
                saveData();
                searchAppointments();
            });

            updateCell.append(select);

            row.append(patientCell, doctorCell, dateCell, typeCell, statusCell, updateCell);
            list.append(row);
        }

        document.getElementById("empty-message").hidden = appointments.length > 0;
    }


    // Save data
    function saveData() {
        localStorage.setItem(storageKey, JSON.stringify(clinicData));
    }


    // Search and filter
    function searchAppointments() {

        let search = document.getElementById("appointment-search").value.toLowerCase();
        let status = document.getElementById("status-filter").value;

        let results = [];

        for (let i = 0; i < clinicData.appointments.length; i++) {

            let appointment = clinicData.appointments[i];

            let info = (
                appointment.patient + appointment.doctor +
                appointment.date + appointment.time + appointment.type
            ).toLowerCase();

            let matchesSearch = info.includes(search);
            let matchesStatus = status === "all" ||
                appointment.status.toLowerCase() === status;

            if (matchesSearch && matchesStatus) {
                results.push(appointment);
            }
        }

        displayAppointments(results);
    }


    // Search events
    document.getElementById("appointment-search").addEventListener("input", searchAppointments);

    document.getElementById("status-filter").addEventListener("change", searchAppointments);

    document.getElementById("global-search").addEventListener("input", function() {
        document.getElementById("appointment-search").value = this.value;
        searchAppointments();
    });


    // Add appointment
    document.getElementById("add-appointment").addEventListener("click", function() {

        let patient = prompt("Enter patient's name:");

        if (!patient || patient.trim() === "") {
            return;
        }

        let doctor = prompt("Enter doctor's name:") || "Clinic Doctor";
        let time = prompt("Enter appointment time:") || "Time not set";
        let type = prompt("Enter appointment type:") || "Consultation";

        let today = new Date();

        let newAppointment = {
            patient: patient.trim(),
            doctor: doctor.trim(),
            date: today.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
            time: time.trim(),
            type: type.trim(),
            status: "Confirmed"
        };

        clinicData.appointments.push(newAppointment);

        saveData();
        searchAppointments();

        document.getElementById("page-message").textContent =
            "Appointment added successfully.";
    });


    // Show appointments on page load
    displayAppointments(clinicData.appointments);

}
