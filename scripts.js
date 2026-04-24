function EnquiryForm() {
    let FirstName=document.getElementById("FirstName").value;
    let LastName=document.getElementById("LastName").value;
    let email=document.getElementById("email").value;
    let password=document.getElementById("Password").value;
    let PhoneNumber=document.getElementById("PhoneNumber").value;   
    let city=document.getElementById("city").value;

    if(FirstName==""){
        alert("Please enter your FirstName");
        return false;
    }
    if(LastName==""){
        alert("Please enter your LastName");
        return false;
    }
    if(email==""){
        alert("Please enter your email");
        return false;
    }
    if(password==""){
        alert("Please enter your password");
        return false;
    }
    if(PhoneNumber==""){
        alert("Please enter your phone number");
        return false;
    }
    if(city==""){
        alert("Please enter your city");
        return false;
    }
    alert("Form is submitted!");
    return true;


}
