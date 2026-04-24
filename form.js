function ValidationForm() {
    let FirstName = document.getElementById("FirstName").value;
    let LastName = document.getElementById("LastName").value;
    let email = document.getElementById("email").value;
    let MobileNumber = document.getElementById("phone").value;
    let PinCode = document.getElementById("PinCode").value;
    let Country = document.getElementById("country").value;
    let Password = document.getElementById("password").value;

    if (FirstName == "") {
        alert("Please enter your First Name");
        return false;
    }
    if (LastName == "") {
        alert("Please enter your Last Name");
        return false;
    }
    if (email == "") {
        alert("Please enter your email");
        return false;
    }
    if (MobileNumber == "") {
        alert("Please enter your Mobile Number");
        return false;
    }
    if (PinCode == "") {
        alert("Please enter your Pin Code");
        return false;
    }
    if (Country == "") {
        alert("Please enter your Country");
        return false;
    }
    if (Password == "") {
        alert("Please enter your Password");
        return false;
    }
    alert("Registration Successfull!");
    return true;
}