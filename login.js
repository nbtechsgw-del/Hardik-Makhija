function LoginForm() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username == "") {
        alert("Please enter your username");
        return false;
    }
    if (password == "") {
        alert("Please enter your password");
        return false;
    }

    localStorage.setItem("isLoggedIn", "true");
    alert("Login successful!");
    window.location.href = "chatbot.html";
    return false;

}