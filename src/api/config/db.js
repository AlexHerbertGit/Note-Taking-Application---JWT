const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://alexherberttech:qEMVInzTafvQhQ4o@notemanagmentdb.xkln5np.mongodb.net/?retryWrites=true&w=majority&appName=noteManagmentDB", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
 };

 module.exports = connectDB;