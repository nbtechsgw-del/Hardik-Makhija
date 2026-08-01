    function ValidateForm() {
        let name=document.getElementById("name").value;
        let email=document.getElementById("email").value;
        let password=document.getElementById("password").value;
        let phonenumber=document.getElementById("phonenumber").value;

        if(name==""){
            alert("Please enter your name");
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
        if(phonenumber==""){
            alert("Please enter your phone number");
            return false;
        }
    
    alert("Form is submitted!");
    return true;
    }