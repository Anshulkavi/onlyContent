document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let message = document.getElementById("message");

    // Simple validation
    if (username === "" || email === "" || password === "") {
        message.style.color = "red";
        message.innerText = "All fields are required!";
        return;
    }

    if (password.length < 6) {
        message.style.color = "red";
        message.innerText = "Password must be at least 6 characters!";
        return;
    }

    message.style.color = "green";
    message.innerText = "Signup successful!";
    
    // Clear fields after successful submission
    setTimeout(() => {
        document.getElementById("signupForm").reset();
        message.innerText = "";
    }, 2000);
});


