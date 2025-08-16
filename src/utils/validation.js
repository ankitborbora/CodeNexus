const validator = require("validator");

function validateSignUpData(payload){

    const { firstName, emailId, password } = payload;

    if(!firstName || firstName.length>50) throw new Error("Enter a valid name");
    if(!validator.isEmail(emailId)) throw new Error("Enter a valid email");
    if(!validator.isStrongPassword(password)) throw new Error("Enter a strong password");
    

}

function validateProfileEdit(payload){
    //i have allowed all the fields for updation except password
    Object.keys(payload).forEach(function(val){
        if(val=="password") return false;
    });
    return true;
}

module.exports= { validateSignUpData,validateProfileEdit };