const mongoose = require('mongoose');
const dotenv = require('dotenv');


async function connectDB(){
    try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log('connection to database succeed !');
    
    }catch{
        console.log('connection to database failed !');
        process.exit(1);
    }
}
module.exports = {
    connectDB
}




