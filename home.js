
// Get HTML elements

let form = document.getElementById("auth-form");

let loginTab = document.getElementById("login-tab");
let signupTab = document.getElementById("signup-tab");

let fullName = document.getElementById("full-name");
let email = document.getElementById("email");
let password = document.getElementById("password");
let confirmPassword = document.getElementById("confirm-password");

let title = document.getElementById("form-title");
let subtitle = document.getElementById("form-subtitle");
let submitButton = document.getElementById("submit-button");
let message = document.getElementById("message");

let switchText = document.getElementById("switch-text");
let switchButton = document.getElementById("switch-button");

let mode = "login";

// Get saved users

let users = JSON.parse(localStorage.getItem("carepoint.users")) || [];


// Switch between login and signup

function changeMode(newMode) {

    mode = newMode;

    message.textContent = "";
    form.reset();

    if (mode === "signup") {

        fullName.hidden = false;
        confirmPassword.hidden = false;

        fullName.required = true;
        confirmPassword.required = true;

        title.textContent = "Create an Account";
        subtitle.textContent = "Sign up to get started";
        submitButton.textContent = "Sign Up";

        loginTab.classList.remove("active");
        signupTab.classList.add("active");

        switchText.firstChild.textContent = "Already have an account? ";
        switchButton.textContent = "Log In";

    } else {

        fullName.hidden = true;
        confirmPassword.hidden = true;

        fullName.required = false;
        confirmPassword.required = false;

        title.textContent = "Welcome Back";
        subtitle.textContent = "Log in to your CarePoint account";
        submitButton.textContent = "Log In";

        signupTab.classList.remove("active");
        loginTab.classList.add("active");

        switchText.firstChild.textContent = "Don't have an account? ";
        switchButton.textContent = "Sign Up";
    }
}


// Tab buttons

loginTab.addEventListener("click", function () {
    changeMode("login");
});

signupTab.addEventListener("click", function () {
    changeMode("signup");
});

switchButton.addEventListener("click", function () {

    if (mode === "login") {
        changeMode("signup");
    } else {
        changeMode("login");
    }

});


// Form submission

form.addEventListener("submit", function (event) {

    event.preventDefault();

    let userEmail = email.value.trim().toLowerCase();
    let userPassword = password.value;

    message.textContent = "";

    // Signup

    if (mode === "signup") {

        if (password.value !== confirmPassword.value) {
            message.textContent = "Passwords do not match.";
            return;
        }

        // Check if account already exists

        for (let i = 0; i < users.length; i++) {

            if (users[i].email === userEmail) {
                message.textContent = "Account already exists.";
                return;
            }

        }

        // Create new account

        let newUser = {
            name: fullName.value,
            email: userEmail,
            password: userPassword
        };

        users.push(newUser);

        localStorage.setItem("carepoint.users", JSON.stringify(users));
        sessionStorage.setItem("carepoint.session", JSON.stringify(newUser));

        alert("Account created successfully!");

        window.location.href = "dashboard.html";

    }

    // Login

    else {

        let found = false;

        for (let i = 0; i < users.length; i++) {

            if (users[i].email === userEmail &&
                users[i].password === userPassword) {

                found = true;
                break;

            }

        }

        if (found) {

            let loggedInUser = users.find(function (user) {
                return user.email === userEmail && user.password === userPassword;
            });

            sessionStorage.setItem("carepoint.session", JSON.stringify(loggedInUser));

            alert("Login successful!");

            window.location.href = "dashboard.html";

        } else {

            message.textContent = "Invalid email or password.";

        }

    }

});
