const mongoose= require("mongoose");

const userSchema= mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        maxLength:50
    },
    lastName:{
        type:String,
    },
    emailId:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        min:18
    },
    image:{
        type:String,
        default:"https://geographyandyou.com/images/user-profile.png"
    },
    gender:{
        type:String,
        validate(value){//by default, this validate func only runs while creating a new doc
            if(!["male","female","others"].includes(value)){
                throw new Error("Invalid gender");
            }
        }
    },
    about:{
        type:String
    },
    skills:{
        type:[String], //array of strings
    }
},{
    timestamps:true
});

const User = mongoose.model("User",userSchema);

module.exports=User;