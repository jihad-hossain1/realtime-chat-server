const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Mongodb connnection Successfull: ${con.connection.host}`);
    } catch (error) {
        console.log('Ops- something error to connect to database', error);
        process.exit();
    }
}

module.exports = connectDB;