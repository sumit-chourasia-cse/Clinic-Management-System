// schedules.js displays and updates the clinic's daily doctor schedules.
(() => {
    // Make sure a user is signed in before showing clinic information.
    let user;
    try {
        user = JSON.parse(sessionStorage.getItem("carepoint.session") || "null");
    } catch {
        user = null;
    }

    if (!user || !user.email) {
        window.location.replace("index.html");
        return;
    }

    const userEmail = user.email.trim().toLowerCase();
    const storageKey = `carepoint.dashboard.${encodeURIComponent(userEmail)}`;
    const userName = user.name || userEmail.split("@")[0];
    const clinicData = loadClinicData();

    document.querySelector("#user-name").textContent = userName;
    document.querySelector("#user-initials").textContent = getInitials(userName);
    document.querySelector("#nav-patient-count").textContent = clinicData.patients.length.toLocaleString();

    const dateInput = document.querySelector("#schedule-date");
    dateInput.value = getToday();
    fillDoctorFilter();
    showSchedules();

    dateInput.addEventListener("change", showSchedules);
    document.querySelector("#doctor-filter").addEventListener("change", showSchedules);
    document.querySelector("#schedule-search").addEventListener("input", showSchedules);

    // Add a schedule entry for the selected day.
    document.querySelector("#add-schedule").addEventListener("click", () => {
        const doctor = prompt("Enter the doctor's name:");
        if (!doctor || !doctor.trim()) return;

        const department = prompt("Enter the doctor's department:") || "General Medicine";
        const room = prompt("Enter the room (for example, Room 01):") || "Room not set";
        const time = prompt("Enter the start time (for example, 09:00 AM):") || "Time not set";

        clinicData.schedules.push({
            doctor: doctor.trim(),
            department: department.trim(),
            room: room.trim(),
            time: time.trim(),
            date: dateInput.value,
            status: "Available"
        });

        saveClinicData();
        fillDoctorFilter();
        showSchedules();
        showMessage("Schedule added.");
    });

    function loadClinicData() {
        try {
            const savedData = JSON.parse(localStorage.getItem(storageKey) || "null");
            if (savedData) {
                if (!Array.isArray(savedData.patients)) savedData.patients = [];
                if (!Array.isArray(savedData.appointments)) savedData.appointments = [];
                if (!Array.isArray(savedData.schedules)) savedData.schedules = makeSampleSchedules();
                return savedData;
            }
        } catch {
            // Start with the example schedule if browser storage cannot be read.
        }

        return {
            patients: [],
            appointments: [],
            schedules: makeSampleSchedules()
        };
    }

    function makeSampleSchedules() {
        const today = getToday();
        return [
            { doctor: "Dr. Rachel Morgan", department: "General Medicine", room: "Room 01", time: "09:00 AM", date: today, status: "Available" },
            { doctor: "Dr. Chen", department: "Cardiology", room: "Room 02", time: "10:00 AM", date: today, status: "In clinic" },
            { doctor: "Dr. Lee", department: "Dentistry", room: "Room 03", time: "12:00 PM", date: today, status: "Available" }
        ];
    }

    function saveClinicData() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(clinicData));
        } catch {
            showMessage("The browser could not save this schedule.");
        }
    }

    function fillDoctorFilter() {
        const doctorFilter = document.querySelector("#doctor-filter");
        const selectedDoctor = doctorFilter.value || "all";
        const doctors = [...new Set(clinicData.schedules.map(item => item.doctor))].sort();

        doctorFilter.replaceChildren();
        addDoctorOption(doctorFilter, "all", "All doctors");
        doctors.forEach(doctor => addDoctorOption(doctorFilter, doctor, doctor));
        doctorFilter.value = doctors.includes(selectedDoctor) ? selectedDoctor : "all";
    }

    function addDoctorOption(select, value, label) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        select.append(option);
    }

    function showSchedules() {
        const selectedDate = dateInput.value;
        const selectedDoctor = document.querySelector("#doctor-filter").value;
        const searchText = document.querySelector("#schedule-search").value.trim().toLowerCase();

        const matches = clinicData.schedules.filter(item => {
            const details = `${item.doctor} ${item.department} ${item.room}`.toLowerCase();
            const matchesDate = item.date === selectedDate;
            const matchesDoctor = selectedDoctor === "all" || item.doctor === selectedDoctor;
            const matchesSearch = details.includes(searchText);
            return matchesDate && matchesDoctor && matchesSearch;
        });

        drawSchedules(matches);
    }

    function drawSchedules(schedules) {
        const list = document.querySelector("#schedule-list");
        list.replaceChildren();

        schedules.forEach(item => {
            const row = document.createElement("article");
            const time = document.createElement("span");
            const marker = document.createElement("span");
            const details = document.createElement("span");
            const doctor = document.createElement("strong");
            const department = document.createElement("span");
            const status = document.createElement("select");

            row.className = "schedule-row";
            time.className = "schedule-time";
            time.textContent = item.time;
            marker.className = "schedule-mark";
            details.className = "schedule-details";
            doctor.textContent = item.doctor;
            department.textContent = `${item.department} · ${item.room}`;
            details.append(doctor, department);

            status.className = `schedule-status ${statusClass(item.status)}`;
            status.setAttribute("aria-label", `Availability for ${item.doctor}`);
            ["Available", "In clinic", "Off duty"].forEach(label => {
                const option = document.createElement("option");
                option.value = label;
                option.textContent = label;
                status.append(option);
            });
            status.value = item.status;
            status.addEventListener("change", () => {
                item.status = status.value;
                status.className = `schedule-status ${statusClass(item.status)}`;
                saveClinicData();
                showMessage(`${item.doctor}'s status updated to ${item.status.toLowerCase()}.`);
            });

            row.append(time, marker, details, status);
            list.append(row);
        });

        document.querySelector("#empty-schedule").hidden = schedules.length > 0;
    }

    function statusClass(status) {
        return status.toLowerCase().replaceAll(" ", "-");
    }

    function getToday() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function getInitials(name) {
        return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
    }

    function showMessage(text) {
        document.querySelector("#page-message").textContent = text;
    }
})();
