
// Display account details and manage settings.

let user;

try {
    user = JSON.parse(sessionStorage.getItem("carepoint.session"));
} catch {
    user = null;
}

// Check whether the user is logged in.
if (!user || !user.email) {
    window.location.replace("index.html");
} else {

    const userName = user.name || user.email.split("@")[0];
    const email = user.email.trim().toLowerCase();

    const clinicKey = "carepoint.dashboard." + encodeURIComponent(email);
    const settingsKey = "carepoint.settings." + encodeURIComponent(email);

    // Display account information.
    function showAccountInfo() {
        let initials = userName.trim().split(" ");

        initials = initials.slice(0, 2).map(function(part) {
            return part[0];
        }).join("").toUpperCase();

        document.querySelector("#header-user-name").textContent = userName;
        document.querySelector("#account-name").textContent = userName;
        document.querySelector("#account-name-field").textContent = userName;
        document.querySelector("#account-email").textContent = user.email;

        document.querySelector("#user-initials").textContent = initials;
        document.querySelector("#account-initials").textContent = initials;
    }

    // Display total registered patients.
    function showPatientCount() {
        let total = 0;

        try {
            let data = JSON.parse(localStorage.getItem(clinicKey));

            if (data && Array.isArray(data.patients)) {
                total = data.patients.length;
            }
        } catch {
            total = 0;
        }

        document.querySelector("#nav-patient-count").textContent = total.toLocaleString();
    }

    // Load previously saved preferences.
    function loadPreferences() {
        let reminders = true;
        let summary = false;

        try {
            let saved = JSON.parse(localStorage.getItem(settingsKey));

            if (saved) {
                reminders = saved.appointmentReminders ?? reminders;
                summary = saved.weeklySummary ?? summary;
            }
        } catch {
            // Use default preferences.
        }

        document.querySelector("#appointment-reminders").checked = reminders;
        document.querySelector("#weekly-summary").checked = summary;
    }

    // Save preferences whenever a checkbox changes.
    function savePreferences() {
        let preferences = {
            appointmentReminders: document.querySelector("#appointment-reminders").checked,
            weeklySummary: document.querySelector("#weekly-summary").checked
        };

        try {
            localStorage.setItem(settingsKey, JSON.stringify(preferences));

            document.querySelector("#preference-message").textContent =
                "Preferences saved on this device.";

        } catch {
            document.querySelector("#preference-message").textContent =
                "The browser could not save your preferences.";
        }
    }

    // Log out the current user.
    function logout() {
        sessionStorage.removeItem("carepoint.session");
        window.location.href = "index.html";
    }

    // Run functions when the page loads.
    showAccountInfo();
    showPatientCount();
    loadPreferences();

    // Add event listeners.
    document.querySelector("#appointment-reminders").addEventListener("change", savePreferences);
    document.querySelector("#weekly-summary").addEventListener("change", savePreferences);
    document.querySelector("#logout-button").addEventListener("click", logout);
}
