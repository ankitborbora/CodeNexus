const cron = require("node-cron");
const {subDays,startOfDay,endOfDay} = require("date-fns");

const ConnectionRequest = require("../models/connectionRequest");

cron.schedule("* * 8 * * *", async ()=>{//this cron will run at 8 am everyday and will display the users and the no of requests they got yesterday

    try{


    let yesterday = subDays(new Date(),1);

    let yesterdayStart = startOfDay(yesterday);
    let yesterdayEnd = endOfDay(yesterday);


    const data = await ConnectionRequest.find({
        status:"interested",
        createdAt:{
            $gte:yesterdayStart,
            $lte:yesterdayEnd
        }
    }).populate([
        {path : "toUserId" , select:"firstName lastName emailId"}
    ]);

    if(data && data.length>0){
        const map = new Map();
        const users = data.map(function(val){
            return val.toUserId.firstName + " " + val.toUserId.lastName;
        });

        users.forEach(function(val){
            map.set(val,(map.get(val) || 0)+1);

        });

        console.log(map);


    }
    }
    catch(err){
        console.log(err.message);
    }
})