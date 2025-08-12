const validator = require("validator");

function validateSignUpData(payload){

    const { firstName, emailId, password } = payload;

    if(!firstName || firstName.length>50) throw new Error("Enter a valid name");
    if(!validator.isEmail(emailId)) throw new Error("Enter a valid email");
    if(!validator.isStrongPassword(password)) throw new Error("Enter a strong password");
    

}

module.exports= { validateSignUpData };