
let user = JSON.parse(sessionStorage.getItem("carepoint.session"));

if (!user || !user.email) {
    window.location.href = "index.html";
}

let key = "carepoint.dashboard." + encodeURIComponent(user.email.toLowerCase());
let data = JSON.parse(localStorage.getItem(key)) || { patients: [], staffMembers: [] };

if (!data.patients) data.patients = [];
if (!data.staffMembers) data.staffMembers = [];

document.getElementById("user-name").textContent = user.name;
document.getElementById("user-initials").textContent = user.name.charAt(0).toUpperCase();
document.getElementById("nav-patient-count").textContent = data.patients.length;

function save() {
    localStorage.setItem(key, JSON.stringify(data));
}

function display() {
    let list = document.getElementById("staff-list");
    let search = document.getElementById("staff-search").value.toLowerCase();
    let role = document.getElementById("role-filter").value;
    let availability = document.getElementById("availability-filter").value;

    list.innerHTML = "";
    let doctors = 0, available = 0, count = 0;

    for (let i = 0; i < data.staffMembers.length; i++) {
        let m = data.staffMembers[i];

        if (m.role == "Doctor") doctors++;
        if (m.availability != "Off duty") available++;

        let details = (m.name + m.role + m.department + m.email).toLowerCase();

        if (!details.includes(search) || (role != "all" && m.role.toLowerCase() != role) ||
            (availability != "all" && m.availability.toLowerCase() != availability)) {
            continue;
        }

        let row = document.createElement("tr");
        let values = [m.name, m.role, m.department, m.email, m.availability];

        for (let j = 0; j < values.length; j++) {
            let cell = document.createElement("td");
            cell.textContent = values[j];
            row.appendChild(cell);
        }

        list.appendChild(row);
        count++;
    }

    document.getElementById("team-count").textContent = data.staffMembers.length;
    document.getElementById("doctor-count").textContent = doctors;
    document.getElementById("available-count").textContent = available;
    document.getElementById("empty-message").hidden = count != 0;
}

document.getElementById("invite-staff").addEventListener("click", function () {
    let name = prompt("Enter name:");
    let email = prompt("Enter email:");
    let role = prompt("Enter role: Doctor, Nurse, Administrator or Receptionist");

    if (!name || !email || !role) return;

    let department = prompt("Enter department:") || "General Care";

    data.staffMembers.push({
        name: name,
        email: email,
        role: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
        department: department,
        availability: "Available"
    });

    save();
    display();
    document.getElementById("page-message").textContent = "Staff member added.";
});

document.getElementById("staff-search").addEventListener("input", display);
document.getElementById("role-filter").addEventListener("change", display);
document.getElementById("availability-filter").addEventListener("change", display);

display();
