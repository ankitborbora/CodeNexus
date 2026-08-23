const mongoose= require("mongoose");

const oauthAccountSchema= mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    provider:{
        type:String,
        enum:["google","github"],
        required:true
    },
    providerAccountId:{
        type:String,
        required:true,
        unique:true,
        maxlength:255
    },
},{
    timestamps:true
});

oauthAccountSchema.index({userId :1});

const OauthAccount = mongoose.model("OauthAccount",oauthAccountSchema);

module.exports=OauthAccount;