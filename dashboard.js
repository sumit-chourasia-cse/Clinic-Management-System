
// Get the signed-in user

let user = JSON.parse(sessionStorage.getItem("carepoint.session"));

// If nobody is logged in, go back to login page

if (!user) {

    window.location.href = "index.html";

}


// Display user information

else {

    let userName = user.name;

    document.getElementById("user-name").textContent = userName;

    document.getElementById("greeting-name").textContent = userName.split(" ")[0];


    // Get user initials

    let nameParts = userName.split(" ");

    let initials = nameParts[0].charAt(0);

    if (nameParts.length > 1) {
        initials += nameParts[1].charAt(0);
    }

    document.getElementById("user-initials").textContent = initials;


    // Display today's date

    let today = new Date();

    document.getElementById("today-date").textContent =
        today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });


    // Search patients

    let search = document.getElementById("dashboard-search");

    search.addEventListener("input", function() {

        let searchText = search.value.toLowerCase();

        let patients = document.querySelectorAll("#patient-list tr");
        
        let visibleCount = 0;

        for (let i = 0; i < patients.length; i++) {

            let patientName = patients[i].textContent.toLowerCase();

            if (patientName.includes(searchText)) {

                patients[i].style.display = "";

                visibleCount++;

            } else {

                patients[i].style.display = "none";

            }

        }

        document.getElementById("patient-empty").hidden = visibleCount > 0;

    });


    // Quick action buttons

    document.getElementById("add-patient").addEventListener("click", function() {

        document.getElementById("action-message").textContent =
            "Patient management will be available soon.";

    });


    document.getElementById("add-appointment").addEventListener("click", function() {

        document.getElementById("action-message").textContent =
            "Appointment management will be available soon.";

    });


    document.getElementById("add-record").addEventListener("click", function() {

        document.getElementById("action-message").textContent =
            "Medical records will be available soon.";

    });


    // Logout

    document.getElementById("logout-button").addEventListener("click", function() {

        sessionStorage.removeItem("carepoint.session");

        window.location.href = "index.html";

    });

}
